import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  totalActivities: number;
  totalDistance: number; // in kilometers
  activeDays: number;
  challengesCount: number;
  last365DaysActivities: number;
  last365DaysDistance: number;
  last365DaysActiveDays: number;
}

export function useDashboardStats() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalActivities: 0,
    totalDistance: 0,
    activeDays: 0,
    challengesCount: 0,
    last365DaysActivities: 0,
    last365DaysDistance: 0,
    last365DaysActiveDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (status === 'loading' || !session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stats/dashboard');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
} 