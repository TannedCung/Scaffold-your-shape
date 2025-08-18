import { useState, useEffect, useCallback } from 'react';
import { Activity } from '@/types';

interface ChallengeParticipantActivity extends Activity {
  memberProfile: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface ChallengeActivitiesResponse {
  activities: ChallengeParticipantActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  challengeInfo: {
    activityType?: string;
    startDate: string;
    endDate?: string;
  };
}

interface UseChallengeActivitiesOptions {
  challengeId: string;
  activityType?: string;
  limit?: number;
}

export function useChallengeActivities({ challengeId, activityType, limit = 20 }: UseChallengeActivitiesOptions) {
  const [activities, setActivities] = useState<ChallengeParticipantActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 0
  });
  const [challengeInfo, setChallengeInfo] = useState<{
    activityType?: string;
    startDate: string;
    endDate?: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchActivities = useCallback(async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (activityType) {
        searchParams.append('type', activityType);
      }

      const response = await fetch(`/api/challenges/${challengeId}/activities?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      const data: ChallengeActivitiesResponse = await response.json();
      
      if (reset || page === 1) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      
      setPagination(data.pagination);
      setChallengeInfo(data.challengeInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [challengeId, activityType, limit]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchActivities(pagination.page + 1, false);
    }
  }, [fetchActivities, pagination.page, pagination.totalPages, loading]);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const hasMore = pagination.page < pagination.totalPages;

  useEffect(() => {
    fetchActivities(1, true);
  }, [fetchActivities, refreshKey]);

  return {
    activities,
    loading,
    error,
    pagination,
    challengeInfo,
    loadMore,
    hasMore,
    refresh
  };
} 