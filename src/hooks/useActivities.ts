import { useEffect, useState } from 'react';
import { fetchActivities } from '@/services/activityService';
import type { Activity } from '@/types';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

export function useActivities(userId?: string) {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the effective userId (from props or session)
  const effectiveUserId = userId || session?.user?.id;

  // Function to load activities
  const loadActivities = async () => {
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
  };

  useEffect(() => {
    // Initial fetch
    loadActivities();

    // Set up real-time subscription
    let subscription;
    if (effectiveUserId) {
      subscription = supabase
        .channel('public:activities')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${effectiveUserId}`
        }, () => {
          // Reload activities when changes happen
          loadActivities();
        })
        .subscribe();
    }

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [effectiveUserId, status]);

  return { 
    activities, 
    loading: loading || status === 'loading', 
    error, 
    refresh: loadActivities 
  };
}