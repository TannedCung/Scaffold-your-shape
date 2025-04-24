import { useEffect, useState } from 'react';
import { fetchActivities, Activity } from '@/services/activityService';

export function useActivities(userId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities(userId)
      .then(setActivities)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { activities, loading, error };
}
