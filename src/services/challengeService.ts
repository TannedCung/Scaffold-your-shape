import { supabase } from '@/lib/supabase';
import { mapChallengeDbToChallenge, ChallengeDb, Challenge } from '@/types';

export async function fetchChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ChallengeDb[] | null)?.map(mapChallengeDbToChallenge) || [];
}
