import { useState, useEffect, useCallback } from 'react';
import { leaderboardApi } from '@/lib/api';
import { LeaderboardResult } from '@/types';

interface UseLeaderboardParams {
  clubId: string;
  activityType?: string;
  limit?: number;
  offset?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardResult | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  rebuild: () => Promise<void>;
}

export function useLeaderboard({
  clubId,
  activityType = 'run',
  limit = 50,
  offset = 0,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseLeaderboardParams): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (rebuild = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await leaderboardApi.getClubLeaderboard(clubId, {
        activityType,
        limit,
        offset,
        rebuild,
      });

      if (apiError) {
        throw new Error(apiError);
      }

      setLeaderboard(data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [clubId, activityType, limit, offset]);

  const refresh = async () => {
    await fetchLeaderboard(false);
  };

  const rebuild = async () => {
    try {
      setError(null);
      const { error: rebuildError } = await leaderboardApi.rebuildClubLeaderboard(clubId, activityType);
      
      if (rebuildError) {
        throw new Error(rebuildError);
      }

      // After rebuilding, fetch the updated leaderboard
      await fetchLeaderboard(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rebuild leaderboard';
      setError(errorMessage);
      console.error('Error rebuilding leaderboard:', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (clubId && activityType) {
      fetchLeaderboard(false);
    }
  }, [clubId, activityType, limit, offset, fetchLeaderboard]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !clubId || !activityType) {
      return;
    }

    const interval = setInterval(() => {
      fetchLeaderboard(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, clubId, activityType, limit, offset, fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refresh,
    rebuild,
  };
} 