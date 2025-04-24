import { useEffect, useState } from 'react';
import { fetchClubs } from '@/services/clubService';
import { Club } from '@/types';

export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClubs()
      .then(setClubs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { clubs, loading, error };
}
