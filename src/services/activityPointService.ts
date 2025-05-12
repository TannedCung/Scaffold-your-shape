import { supabase } from '@/lib/supabase';
import { ActivityPointConversion, ClubPointConversion, ChallengePointConversion } from '@/types';
import { DEFAULT_ACTIVITY_POINT_CONVERSION } from '@/constants/defaultActivityPointConversion';

// Fetch global conversion rates, fallback to default if not set
export async function fetchGlobalConversionRates(): Promise<ActivityPointConversion[]> {
  const { data, error } = await supabase.from('activity_point_conversion').select('*');
  if (error || !data || data.length === 0) return DEFAULT_ACTIVITY_POINT_CONVERSION;
  return data as ActivityPointConversion[];
}

// Fetch club-specific conversion rates
export async function fetchClubConversionRates(clubId: string): Promise<ClubPointConversion[]> {
  const { data, error } = await supabase
    .from('club_point_conversion')
    .select('*')
    .eq('club_id', clubId);
  if (error) throw error;
  return data as ClubPointConversion[];
}

// Fetch challenge-specific conversion rates
export async function fetchChallengeConversionRates(challengeId: string): Promise<ChallengePointConversion[]> {
  const { data, error } = await supabase
    .from('challenge_point_conversion')
    .select('*')
    .eq('challenge_id', challengeId);
  if (error) throw error;
  return data as ChallengePointConversion[];
}

// Upsert global conversion rates
export async function upsertGlobalConversionRates(rates: ActivityPointConversion[]): Promise<void> {
  const { error } = await supabase.from('activity_point_conversion').upsert(rates, { onConflict: 'activity_type,unit' });
  if (error) throw error;
}

// Upsert club conversion rates
export async function upsertClubConversionRates(clubId: string, rates: ClubPointConversion[]): Promise<void> {
  const { error } = await supabase.from('club_point_conversion').upsert(
    rates.map(r => ({ ...r, club_id: clubId })),
    { onConflict: 'club_id,activity_type,unit' }
  );
  if (error) throw error;
}

// Upsert challenge conversion rates
export async function upsertChallengeConversionRates(challengeId: string, rates: ChallengePointConversion[]): Promise<void> {
  const { error } = await supabase.from('challenge_point_conversion').upsert(
    rates.map(r => ({ ...r, challenge_id: challengeId })),
    { onConflict: 'challenge_id,activity_type,unit' }
  );
  if (error) throw error;
} 