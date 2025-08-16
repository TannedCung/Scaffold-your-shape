import { useEffect, useState, useCallback } from 'react';
import { fetchActivities } from '@/services/activityService';
import type { Activity } from '@/types';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { subscribeToActivityUpdates } from '@/utils/activityEvents';

export function useActivities(userId?: string) {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the effective userId (from props or session)
  const effectiveUserId = userId || session?.user?.id;

  // Function to load activities - wrap in useCallback to prevent dependency issues
  const loadActivities = useCallback(async () => {
    // Don't attempt to load if authentication is still being determined
    if (status === 'loading') return;
    
    // Clear error state when starting a new load
    setError(null);
    
    try {
      // Only fetch if we have a userId or if explicitly requesting all activities
      if (effectiveUserId || userId === undefined) {
        const data = await fetchActivities(effectiveUserId);
        setActivities(data);
      } else {
        // No user ID available but authentication completed - show empty list
        setActivities([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load activities');
      }
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, status, userId]);

  useEffect(() => {
    // Initial fetch
    loadActivities();

    // Set up real-time subscription
    let subscription: ReturnType<typeof supabase.channel> | undefined;
    if (effectiveUserId) {
      subscription = supabase
        .channel(`public:activities:${effectiveUserId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${effectiveUserId}`
        }, () => {
          loadActivities();
        })
        .subscribe();
    }

    // Subscribe to global activity events (fallback for manual triggers)
    const unsubscribeGlobalEvents = subscribeToActivityUpdates(() => {
      loadActivities();
    });

    // Cleanup subscriptions
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      unsubscribeGlobalEvents();
    };
  }, [effectiveUserId, status, loadActivities]);

  return { 
    activities, 
    loading: loading || status === 'loading', 
    error, 
    refresh: loadActivities 
  };
}