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

      console.log(`🔍 [useLeaderboard] Fetching leaderboard for club ${clubId}, activity: ${activityType}, rebuild: ${rebuild}`);

      const { data, error: apiError } = await leaderboardApi.getClubLeaderboard(clubId, {
        activityType,
        limit,
        offset,
        rebuild,
      });

      console.log(`📊 [useLeaderboard] API Response:`, { data, error: apiError });

      if (apiError) {
        throw new Error(apiError);
      }
      
      // Debug: Show the exact structure of data
      const hasEntries = data && typeof data === 'object' && 'entries' in data;
      const entriesValue = hasEntries ? (data as { entries: unknown }).entries : null;
      const isEntriesArray = Array.isArray(entriesValue);
      
      console.log(`🔍 [useLeaderboard] Data structure analysis:`, {
        dataExists: !!data,
        dataType: typeof data,
        hasEntries,
        entriesType: hasEntries ? typeof entriesValue : 'N/A',
        entriesIsArray: isEntriesArray,
        entriesLength: isEntriesArray ? (entriesValue as unknown[]).length : 'N/A',
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : []
      });
      
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
        console.log(`✅ [useLeaderboard] Setting leaderboard data with ${data.entries.length} entries:`, data.entries.slice(0, 3));
        setLeaderboard(data);
      } else if (data && typeof data === 'object') {
        // If data exists but doesn't match LeaderboardResult structure, create a safe fallback
        console.log(`⚠️ [useLeaderboard] Data exists but doesn't match expected structure, creating fallback. Data received:`, data);
        const dataObj = data as Record<string, unknown>;
        setLeaderboard({
          entries: [],
          totalMembers: typeof dataObj.totalMembers === 'number' ? dataObj.totalMembers : 0,
          activityType: typeof dataObj.activityType === 'string' ? dataObj.activityType : activityType,
          clubId: typeof dataObj.clubId === 'string' ? dataObj.clubId : clubId
        });
      } else {
        console.log(`❌ [useLeaderboard] No data received, setting null`);
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