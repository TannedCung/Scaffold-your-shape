import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Helper functions for processing analytics data
function processMonthlyData(activities: Array<{ date: string; value: number; unit: string }>) {
  const monthlyMap = new Map<string, { count: number; distance: number }>();
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { count: 0, distance: 0 });
    }
    
    const data = monthlyMap.get(monthKey)!;
    data.count += 1;
    
    // Convert distance to kilometers
    if (['meters', 'kilometers', 'miles'].includes(activity.unit)) {
      let distance = activity.value;
      if (activity.unit === 'meters') distance = distance / 1000;
      if (activity.unit === 'miles') distance = distance * 1.609344;
      data.distance += distance;
    }
  });
  
  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      count: data.count,
      distance: Math.round(data.distance * 100) / 100
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function processActivityTypeDistribution(activities: Array<{ type: string }>) {
  const typeMap = new Map<string, number>();
  
  activities.forEach(activity => {
    typeMap.set(activity.type, (typeMap.get(activity.type) || 0) + 1);
  });
  
  const total = activities.length;
  return Array.from(typeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

function processWeeklyData(activities: Array<{ date: string }>) {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyMap = new Map<string, number>();
  
  // Initialize all days
  weekDays.forEach(day => weeklyMap.set(day, 0));
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const dayName = weekDays[date.getDay()];
    weeklyMap.set(dayName, (weeklyMap.get(dayName) || 0) + 1);
  });
  
  return weekDays.map(day => ({
    day,
    count: weeklyMap.get(day) || 0
  }));
}

function processDistanceOverTime(activities: Array<{ date: string; value: number; unit: string }>) {
  const distanceMap = new Map<string, number>();
  
  activities
    .filter(activity => ['meters', 'kilometers', 'miles'].includes(activity.unit))
    .forEach(activity => {
      let distance = activity.value;
      if (activity.unit === 'meters') distance = distance / 1000;
      if (activity.unit === 'miles') distance = distance * 1.609344;
      
      distanceMap.set(activity.date, (distanceMap.get(activity.date) || 0) + distance);
    });
  
  const sortedEntries = Array.from(distanceMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let cumulative = 0;
  
  return sortedEntries.map(([date, distance]) => {
    cumulative += distance;
    return {
      date,
      distance: Math.round(distance * 100) / 100,
      cumulative: Math.round(cumulative * 100) / 100
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');
    
    // If no userId is provided, use the current user's ID
    const effectiveUserId = targetUserId || session?.user?.id;
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // If requesting another user's stats, ensure we have a valid session
    if (targetUserId && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total activities count
    const { count: totalActivities, error: totalError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', effectiveUserId);

    if (totalError) throw totalError;

    // Get all activities for distance calculation
    const { data: allActivitiesData, error: allError } = await supabase
      .from('activities')
      .select('value, unit')
      .eq('user_id', effectiveUserId);

    if (allError) throw allError;

    // Calculate total distance (convert everything to kilometers)
    const calculateDistance = (activities: Array<{ value: number; unit: string }>) => {
      return activities
        .filter(activity => ['meters', 'kilometers', 'miles'].includes(activity.unit))
        .reduce((total, activity) => {
          let distance = activity.value;
          if (activity.unit === 'meters') distance = distance / 1000;
          if (activity.unit === 'miles') distance = distance * 1.609344;
          return total + distance;
        }, 0);
    };

    const totalDistance = calculateDistance(allActivitiesData || []);

    // Get challenges count (total challenges user has participated in)
    const { count: totalChallenges, error: challengesError } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', effectiveUserId);

    if (challengesError) throw challengesError;

    // Get clubs count (total clubs user is member of)
    const { count: totalClubs, error: clubsError } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', effectiveUserId);

    if (clubsError) throw clubsError;

    // Get active challenges with progress
    const { data: activeChallengesData, error: activeChallengesError } = await supabase
      .from('challenge_participants')
      .select(`
        current_value,
        completed,
        challenges!inner (
          id,
          title,
          description,
          target_value,
          unit,
          end_date
        )
      `)
      .eq('user_id', effectiveUserId)
      .eq('completed', false);

    if (activeChallengesError) throw activeChallengesError;

    // Process active challenges
    const activeChallenges = (activeChallengesData || [])
      .filter(item => item.challenges)
      .map(item => {
        const challenge = item.challenges as unknown as {
          id: string;
          title: string;
          description: string;
          target_value: number;
          unit: string;
          end_date: string;
        };
        const progress = challenge.target_value > 0 
          ? Math.min((item.current_value / challenge.target_value) * 100, 100)
          : 0;
        
        return {
          id: challenge.id,
          name: challenge.title,
          description: challenge.description,
          startDate: challenge.end_date,
          endDate: challenge.end_date,
          progress: Math.round(progress),
          daysRemaining: 0,
          currentValue: Number(item.current_value.toFixed(2)),
          targetValue: Number(challenge.target_value.toFixed(2)),
          unit: challenge.unit,
        };
      })
      .slice(0, 3);

    // Get detailed analytics data
    const { data: activitiesForAnalytics, error: analyticsError } = await supabase
      .from('activities')
      .select('type, date, value, unit')
      .eq('user_id', effectiveUserId)
      .order('date', { ascending: true });

    if (analyticsError) throw analyticsError;

    // Process analytics data
    const monthlyData = processMonthlyData(activitiesForAnalytics || []);
    const typeDistribution = processActivityTypeDistribution(activitiesForAnalytics || []);
    const weeklyData = processWeeklyData(activitiesForAnalytics || []);
    const distanceData = processDistanceOverTime(activitiesForAnalytics || []);

    const stats = {
      totalActivities: totalActivities || 0,
      totalDistance: Number(totalDistance.toFixed(2)),
      totalChallenges: totalChallenges || 0,
      totalClubs: totalClubs || 0,
      activeChallenges,
      monthlyActivityData: monthlyData,
      activityTypeDistribution: typeDistribution,
      weeklyActivityData: weeklyData,
      distanceOverTime: distanceData,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile stats' },
      { status: 500 }
    );
  }
} 