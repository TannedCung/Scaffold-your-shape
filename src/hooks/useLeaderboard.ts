import { useState, useEffect, useCallback } from 'react';
import { leaderboardApi } from '@/lib/api';
import { LeaderboardResult } from '@/lib/leaderboard';

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
      
      // Debug: Show the exact structure of data
      const hasEntries = data && typeof data === 'object' && 'entries' in data;
      const entriesValue = hasEntries ? (data as { entries: unknown }).entries : null;
      const isEntriesArray = Array.isArray(entriesValue);
      
      // Type guard for LeaderboardResult
      const isLeaderboardResult = (obj: unknown): obj is LeaderboardResult => {
        return obj !== null && 
               typeof obj === 'object' && 
               'entries' in obj && 
               Array.isArray((obj as { entries: unknown }).entries) &&
               'totalMembers' in obj &&
               'activityType' in obj &&
               'clubId' in obj;
      };
      
      // Ensure data has proper structure with entries array
      if (isLeaderboardResult(data)) {
        setLeaderboard(data);
      } else if (data && typeof data === 'object') {
        // If data exists but doesn't match LeaderboardResult structure, create a safe fallback
        const dataObj = data as Record<string, unknown>;
        setLeaderboard({
          entries: [],
          totalMembers: typeof dataObj.totalMembers === 'number' ? dataObj.totalMembers : 0,
          activityType: typeof dataObj.activityType === 'string' ? dataObj.activityType : activityType,
          clubId: typeof dataObj.clubId === 'string' ? dataObj.clubId : clubId
        });
      } else {
        setLeaderboard(null);
      }
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