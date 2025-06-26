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
    title: string;
    description: string;
    targetValue: number;
    unit: string;
    endDate: string;
    currentValue: number;
    progress: number;
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveUserId = userId || session?.user?.id;

  const loadStats = useCallback(async () => {
    if (status === 'loading' || !effectiveUserId) return;

    setLoading(true);
    setError(null);

    try {
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
            title: challenge.title,
            description: challenge.description,
            targetValue: challenge.target_value,
            unit: challenge.unit,
            endDate: challenge.end_date,
            currentValue: item.current_value,
            progress: Math.round(progress),
          };
        })
        .slice(0, 3); // Limit to 3 active challenges

      setStats({
        totalActivities: totalActivities || 0,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalChallenges: totalChallenges || 0,
        totalClubs: totalClubs || 0,
        activeChallenges,
      });

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