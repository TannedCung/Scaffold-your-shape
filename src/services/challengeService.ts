import { mapChallengeDbToChallenge, ChallengeDb, Challenge } from '@/types';
import { challengeApi } from '@/lib/api';

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const { data, error } = await challengeApi.getAll();
    
    if (error) {
      throw new Error(error);
    }

    return (data || []).map(mapChallengeDbToChallenge);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
}
