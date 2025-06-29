import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

interface ProfileStats {
  totalActivities: number;
  totalDistance: number; // in kilometers
  totalChallenges: number;
  totalClubs: number;
  activeChallenges: Array<{
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    progress: number;
    daysRemaining: number;
  }>;
  // Analytics data for charts
  monthlyActivityData: Array<{
    month: string;
    count: number;
    distance: number;
  }>;
  activityTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  weeklyActivityData: Array<{
    day: string;
    count: number;
  }>;
  distanceOverTime: Array<{
    date: string;
    distance: number;
    cumulative: number;
  }>;
}

export function useProfileStats(userId?: string) {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<ProfileStats>({
    totalActivities: 0,
    totalDistance: 0,
    totalChallenges: 0,
    totalClubs: 0,
    activeChallenges: [],
    monthlyActivityData: [],
    activityTypeDistribution: [],
    weeklyActivityData: [],
    distanceOverTime: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveUserId = userId || session?.user?.id;

  const loadStats = useCallback(async () => {
    console.log('useProfileStats - loadStats called with:', { status, effectiveUserId });
    if (status === 'loading' || !effectiveUserId) return;

    console.log('useProfileStats - Starting data fetch...');
    setLoading(true);
    setError(null);

    try {
      // Get total activities count
      console.log('useProfileStats - Fetching total activities count...');
      const { count: totalActivities, error: totalError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', effectiveUserId);

      if (totalError) throw totalError;
      console.log('useProfileStats - Total activities:', totalActivities);

      // Get all activities for distance calculation
      console.log('useProfileStats - Fetching activities for distance calculation...');
      const { data: allActivitiesData, error: allError } = await supabase
        .from('activities')
        .select('value, unit')
        .eq('user_id', effectiveUserId);

      if (allError) throw allError;
      console.log('useProfileStats - Activities for distance:', { count: allActivitiesData?.length, sample: allActivitiesData?.slice(0, 3) });

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
      console.log('useProfileStats - Total distance calculated:', totalDistance);

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
          // Since we use !inner, challenges should be a single object
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
          };
        })
        .slice(0, 3); // Limit to 3 active challenges

      // Get detailed analytics data
      console.log('useProfileStats - Fetching activities for analytics...');
      const { data: activitiesForAnalytics, error: analyticsError } = await supabase
        .from('activities')
        .select('type, date, value, unit')
        .eq('user_id', effectiveUserId)
        .order('date', { ascending: true });

      if (analyticsError) throw analyticsError;
      console.log('useProfileStats - Activities for analytics:', { count: activitiesForAnalytics?.length, sample: activitiesForAnalytics?.slice(0, 3) });

      // Process analytics data
      console.log('useProfileStats - Processing analytics data...');
      const monthlyData = processMonthlyData(activitiesForAnalytics || []);
      console.log('useProfileStats - Monthly data processed:', monthlyData);
      
      const typeDistribution = processActivityTypeDistribution(activitiesForAnalytics || []);
      console.log('useProfileStats - Type distribution processed:', typeDistribution);
      
      const weeklyData = processWeeklyData(activitiesForAnalytics || []);
      console.log('useProfileStats - Weekly data processed:', weeklyData);
      
      const distanceData = processDistanceOverTime(activitiesForAnalytics || []);
      console.log('useProfileStats - Distance data processed:', distanceData);

      const finalStats = {
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
      
      console.log('useProfileStats - Final stats object:', finalStats);
      setStats(finalStats);

    } catch (err) {
      console.error('Error loading profile stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile stats');
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, status]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
}

// Helper functions for processing analytics data
function processMonthlyData(activities: Array<{ type: string; date: string; value: number; unit: string }>) {
  console.log('processMonthlyData - Starting with activities:', activities.length);
  const monthlyStats: Record<string, { count: number; distance: number }> = {};
  
  // Handle empty activities
  if (!activities || activities.length === 0) {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }).reverse();
    
    return last12Months.map(month => ({
      month,
      count: 0,
      distance: 0.00
    }));
  }
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = { count: 0, distance: 0 };
    }
    
    monthlyStats[monthKey].count++;
    
    // Add distance if applicable
    if (['meters', 'kilometers', 'miles'].includes(activity.unit)) {
      let distance = activity.value;
      if (activity.unit === 'meters') distance = distance / 1000;
      if (activity.unit === 'miles') distance = distance * 1.609344;
      monthlyStats[monthKey].distance += Number(distance.toFixed(2));
    }
  });
  
  // Convert to array and sort by month
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }).reverse();
  
  return last12Months.map(month => ({
    month,
    count: monthlyStats[month]?.count || 0,
    distance: Number(((monthlyStats[month]?.distance || 0)).toFixed(2))
  }));
}

function processActivityTypeDistribution(activities: Array<{ type: string; date: string; value: number; unit: string }>) {
  const typeCount: Record<string, number> = {};
  
  // Handle empty activities
  if (!activities || activities.length === 0) {
    return [
      { type: 'No Data', count: 0, percentage: 100.0 }
    ];
  }
  
  activities.forEach(activity => {
    typeCount[activity.type] = (typeCount[activity.type] || 0) + 1;
  });
  
  const total = activities.length;
  
  return Object.entries(typeCount)
    .map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Top 6 activity types
}

function processWeeklyData(activities: Array<{ type: string; date: string; value: number; unit: string }>) {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyStats: Record<string, number> = {};
  
  // Initialize all days
  weekDays.forEach(day => {
    weeklyStats[day] = 0;
  });
  
  // Handle empty activities - still return all days with 0 counts
  if (!activities || activities.length === 0) {
    return weekDays.map(day => ({
      day: day.substring(0, 3), // Shorten to 3 letters
      count: 0
    }));
  }
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const dayName = weekDays[date.getDay()];
    weeklyStats[dayName]++;
  });
  
  return weekDays.map(day => ({
    day: day.substring(0, 3), // Shorten to 3 letters
    count: weeklyStats[day]
  }));
}

function processDistanceOverTime(activities: Array<{ type: string; date: string; value: number; unit: string }>) {
  // Handle empty activities
  if (!activities || activities.length === 0) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return last30Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      distance: 0.00,
      cumulative: 0.00
    }));
  }
  
  const distanceActivities = activities.filter(activity => 
    ['meters', 'kilometers', 'miles'].includes(activity.unit)
  );
  
  const dailyDistance: Record<string, number> = {};
  
  distanceActivities.forEach(activity => {
    const dateKey = new Date(activity.date).toISOString().split('T')[0];
    let distance = activity.value;
    
    if (activity.unit === 'meters') distance = distance / 1000;
    if (activity.unit === 'miles') distance = distance * 1.609344;
    
    dailyDistance[dateKey] = Number(((dailyDistance[dateKey] || 0) + distance).toFixed(2));
  });
  
  // Get last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  let cumulative = 0;
  
  return last30Days.map(date => {
    const dailyDist = dailyDistance[date] || 0;
    cumulative += dailyDist;
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      distance: Number(dailyDist.toFixed(2)),
      cumulative: Number(cumulative.toFixed(2))
    };
  });
} 