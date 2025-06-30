import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const last365Days = new Date(now);
    last365Days.setDate(now.getDate() - 365);
    const last365DaysISO = last365Days.toISOString().split('T')[0];

    // Get total activities count
    const { count: totalActivities, error: totalError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalError) throw totalError;

    // Get last 365 days activities
    const { data: last365DaysActivitiesData, error: last365Error } = await supabase
      .from('activities')
      .select('date, value, unit')
      .eq('user_id', userId)
      .gte('date', last365DaysISO);

    if (last365Error) throw last365Error;

    // Calculate distances (convert everything to kilometers)
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

    // Get all activities for total distance calculation
    const { data: allActivitiesData, error: allError } = await supabase
      .from('activities')
      .select('value, unit, date')
      .eq('user_id', userId);

    if (allError) throw allError;

    // Calculate total distance
    const totalDistance = calculateDistance(allActivitiesData || []);

    // Calculate last 365 days distance
    const last365DaysDistance = calculateDistance(last365DaysActivitiesData || []);

    // Calculate active days (unique dates with activities)
    const allDates = [...new Set((allActivitiesData || []).map((a: { date: string }) => a.date))];
    const last365DaysDates = [...new Set((last365DaysActivitiesData || []).map((a: { date: string }) => a.date))];

    // Get challenges count (active challenges user is participating in)
    const { count: challengesCount, error: challengesError } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', false);

    if (challengesError) throw challengesError;

    const stats = {
      totalActivities: totalActivities || 0,
      totalDistance: Math.round(totalDistance * 100) / 100,
      activeDays: allDates.length,
      challengesCount: challengesCount || 0,
      last365DaysActivities: (last365DaysActivitiesData || []).length,
      last365DaysDistance: Math.round(last365DaysDistance * 100) / 100,
      last365DaysActiveDays: last365DaysDates.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 