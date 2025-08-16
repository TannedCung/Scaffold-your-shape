import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

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
    currentValue: number;
    targetValue: number;
    unit: string;
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
    if (status === 'loading' || !effectiveUserId) return;

    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/stats/profile', window.location.origin);
      if (userId) {
        url.searchParams.set('userId', userId);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setStats(data);
    } catch (err) {
      console.error('Error loading profile stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile stats');
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, status, userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
} 