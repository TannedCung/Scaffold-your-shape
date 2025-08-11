import { ActivityPointConversion, ClubPointConversion, ChallengePointConversion } from '@/types';
import { DEFAULT_ACTIVITY_POINT_CONVERSION } from '@/constants/defaultActivityPointConversion';
import { supabase } from '@/lib/supabase';

// Server-side function to fetch global conversion rates
export async function fetchGlobalConversionRatesServer(): Promise<ActivityPointConversion[]> {
  try {
    const { data: conversions, error } = await supabase
      .from('activity_point_conversion')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching global conversion rates:', error);
      return DEFAULT_ACTIVITY_POINT_CONVERSION;
    }

    return conversions || DEFAULT_ACTIVITY_POINT_CONVERSION;
  } catch (error) {
    console.error('Error fetching global conversion rates:', error);
    return DEFAULT_ACTIVITY_POINT_CONVERSION;
  }
}

// Server-side function to fetch club-specific conversion rates
export async function fetchClubConversionRatesServer(clubId: string): Promise<ClubPointConversion[]> {
  try {
    const { data: conversions, error } = await supabase
      .from('club_activity_point_conversion')
      .select('*')
      .eq('club_id', clubId)
      .order('activity_type', { ascending: true });

    if (error) {
      console.error('Error fetching club conversion rates:', error);
      // Return default rates with club_id
      return DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        club_id: clubId
      }));
    }

    // If no club-specific rates exist, return default rates with club_id
    if (!conversions || conversions.length === 0) {
      return DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        club_id: clubId
      }));
    }

    // Ensure each conversion has a club_id
    return conversions.map(conversion => ({
      ...conversion,
      club_id: clubId
    }));
  } catch (error) {
    console.error('Error fetching club conversion rates:', error);
    // Return default rates with club_id
    return DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
      ...rate,
      club_id: clubId
    }));
  }
}

// Server-side function to fetch challenge-specific conversion rates
export async function fetchChallengeConversionRatesServer(challengeId: string): Promise<ChallengePointConversion[]> {
  try {
    const { data: conversions, error } = await supabase
      .from('challenge_activity_point_conversion')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('activity_type', { ascending: true });

    if (error) {
      console.error('Error fetching challenge conversion rates:', error);
      // Return default rates with challenge_id
      return DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        challenge_id: challengeId
      }));
    }

    // If no challenge-specific rates exist, return default rates with challenge_id
    if (!conversions || conversions.length === 0) {
      return DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        challenge_id: challengeId
      }));
    }

    // Ensure each conversion has a challenge_id
    return conversions.map(conversion => ({
      ...conversion,
      challenge_id: challengeId
    }));
  } catch (error) {
    console.error('Error fetching challenge conversion rates:', error);
    // Return default rates with challenge_id
    return DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
      ...rate,
      challenge_id: challengeId
    }));
  }
}

// Server-side function to upsert club conversion rates
export async function upsertClubConversionRatesServer(
  clubId: string, 
  rates: ClubPointConversion[]
): Promise<void> {
  try {
    // First, delete existing rates for this club
    const { error: deleteError } = await supabase
      .from('club_activity_point_conversion')
      .delete()
      .eq('club_id', clubId);

    if (deleteError) {
      console.error('Error deleting existing club rates:', deleteError);
      throw new Error(deleteError.message);
    }

    // Then insert new rates
    const ratesWithClubId = rates.map(rate => ({
      ...rate,
      club_id: clubId
    }));

    const { error: insertError } = await supabase
      .from('club_activity_point_conversion')
      .insert(ratesWithClubId);

    if (insertError) {
      console.error('Error inserting new club rates:', insertError);
      throw new Error(insertError.message);
    }
  } catch (error) {
    console.error('Error upserting club conversion rates:', error);
    throw error;
  }
}

// Server-side function to upsert challenge conversion rates
export async function upsertChallengeConversionRatesServer(
  challengeId: string, 
  rates: ChallengePointConversion[]
): Promise<void> {
  try {
    // First, delete existing rates for this challenge
    const { error: deleteError } = await supabase
      .from('challenge_activity_point_conversion')
      .delete()
      .eq('challenge_id', challengeId);

    if (deleteError) {
      console.error('Error deleting existing challenge rates:', deleteError);
      throw new Error(deleteError.message);
    }

    // Then insert new rates
    const ratesWithChallengeId = rates.map(rate => ({
      ...rate,
      challenge_id: challengeId
    }));

    const { error: insertError } = await supabase
      .from('challenge_activity_point_conversion')
      .insert(ratesWithChallengeId);

    if (insertError) {
      console.error('Error inserting new challenge rates:', insertError);
      throw new Error(insertError.message);
    }
  } catch (error) {
    console.error('Error upserting challenge conversion rates:', error);
    throw error;
  }
} 