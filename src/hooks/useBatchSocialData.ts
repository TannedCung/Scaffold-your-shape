import { useState, useEffect, useCallback, useRef } from 'react';

interface SocialData {
  reactions: { [reactionType: string]: { count: number; users: any[] } };
  totalReactions: number;
  commentsCount: number;
  sharesCount: number;
}

interface BatchSocialDataHook {
  socialData: { [activityId: string]: SocialData };
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchForActivities: (activityIds: string[]) => Promise<void>;
}

export function useBatchSocialData(): BatchSocialDataHook {
  const [socialData, setSocialData] = useState<{ [activityId: string]: SocialData }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentActivityIds, setCurrentActivityIds] = useState<string[]>([]);
  
  // Use ref to track ongoing requests to prevent duplicates
  const ongoingRequestRef = useRef<Promise<void> | null>(null);
  const lastFetchedRef = useRef<string>('');

  const fetchBatchSocialData = useCallback(async (activityIds: string[]) => {
    if (activityIds.length === 0) {
      setSocialData({});
      return;
    }

    // Create a unique key for this request
    const requestKey = activityIds.sort().join(',');
    
    // If we're already fetching the same data, return the ongoing promise
    if (lastFetchedRef.current === requestKey && ongoingRequestRef.current) {
      return ongoingRequestRef.current;
    }

    // Mark this request as ongoing
    lastFetchedRef.current = requestKey;
    setLoading(true);
    setError(null);

    const fetchPromise = async () => {
      try {
        const response = await fetch('/api/activities/batch/social', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activityIds }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch social data');
        }

        setSocialData(data.socialData);
        setCurrentActivityIds(activityIds);
      } catch (err) {
        console.error('Error fetching batch social data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch social data');
      } finally {
        setLoading(false);
        ongoingRequestRef.current = null;
      }
    };

    ongoingRequestRef.current = fetchPromise();
    return ongoingRequestRef.current;
  }, []);

  const refetch = useCallback(() => {
    if (currentActivityIds.length > 0) {
      // Reset the last fetched key to force a refetch
      lastFetchedRef.current = '';
      fetchBatchSocialData(currentActivityIds);
    }
  }, [currentActivityIds, fetchBatchSocialData]);

  const fetchForActivities = useCallback(async (activityIds: string[]) => {
    return fetchBatchSocialData(activityIds);
  }, [fetchBatchSocialData]);

  return {
    socialData,
    loading,
    error,
    refetch,
    fetchForActivities
  };
}

// Helper hook for a specific set of activities
export function useSocialDataForActivities(activityIds: string[]) {
  const { socialData, loading, error, fetchForActivities } = useBatchSocialData();
  
  useEffect(() => {
    if (activityIds.length > 0) {
      fetchForActivities(activityIds);
    }
  }, [activityIds.join(','), fetchForActivities]); // Re-fetch when activity IDs change

  return {
    socialData,
    loading,
    error,
    getSocialData: (activityId: string): SocialData => {
      return socialData[activityId] || {
        reactions: {},
        totalReactions: 0,
        commentsCount: 0,
        sharesCount: 0
      };
    }
  };
} 