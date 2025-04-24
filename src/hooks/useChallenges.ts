import { useEffect, useState } from 'react';
import { fetchChallenges } from '@/services/challengeService';
import { Challenge } from '@/types';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges()
      .then(setChallenges)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { challenges, loading, error };
}
