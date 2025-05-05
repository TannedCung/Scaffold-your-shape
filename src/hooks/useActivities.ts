import { useEffect, useState } from 'react';
import { fetchActivities } from '@/services/activityService';
import type { Activity } from '@/types';
import { supabase } from '@/lib/supabase';

export function useActivities(userId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load activities
  const loadActivities = async () => {
    try {
      const data = await fetchActivities(userId);
      setActivities(data);
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
    const subscription = supabase
      .channel('public:activities')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: userId ? `user_id=eq.${userId}` : undefined
      }, () => {
        // Reload activities when changes happen
        loadActivities();
      })
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { activities, loading, error, refresh: loadActivities };
}