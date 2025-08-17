import { useState, useEffect, useCallback } from 'react';
import { Activity } from '@/types';

interface ClubMemberActivity extends Activity {
  memberProfile: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface ClubActivitiesResponse {
  activities: ClubMemberActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseClubActivitiesOptions {
  clubId: string;
  activityType?: string;
  limit?: number;
}

export function useClubActivities({ clubId, activityType, limit = 20 }: UseClubActivitiesOptions) {
  const [activities, setActivities] = useState<ClubMemberActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 0
  });
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

      const response = await fetch(`/api/clubs/${clubId}/activities?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      const data: ClubActivitiesResponse = await response.json();
      
      if (reset || page === 1) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [clubId, activityType, limit]);

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
    loadMore,
    hasMore,
    refresh
  };
} 