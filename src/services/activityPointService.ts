import { ActivityPointConversion, ClubPointConversion, ChallengePointConversion } from '@/types';
import { DEFAULT_ACTIVITY_POINT_CONVERSION } from '@/constants/defaultActivityPointConversion';
import { activityPointApi } from '@/lib/api';

// Fetch global conversion rates, fallback to default if not set
export async function fetchGlobalConversionRates(): Promise<ActivityPointConversion[]> {
  try {
    const { data, error } = await activityPointApi.getConversions();
    
    if (error) {
      throw new Error(error);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching conversion rates:', error);
    return [];
  }
}

// Fetch club-specific conversion rates
export async function fetchClubConversionRates(clubId: string): Promise<ClubPointConversion[]> {
  try {
    const { data, error } = await activityPointApi.getClubConversions(clubId);
    
    if (error) {
      throw new Error(error);
    }

    // Ensure each conversion has a club_id
    return (data || []).map(conversion => ({
      ...conversion,
      club_id: clubId
    }));
  } catch (error) {
    console.error('Error fetching club conversion rates:', error);
    return [];
  }
}

// Fetch challenge-specific conversion rates
export async function fetchChallengeConversionRates(challengeId: string): Promise<ChallengePointConversion[]> {
  try {
    const { data, error } = await activityPointApi.getChallengeConversions(challengeId);
    
    if (error) {
      throw new Error(error);
    }

    // Ensure each conversion has a challenge_id
    return (data || []).map(conversion => ({
      ...conversion,
      challenge_id: challengeId
    }));
  } catch (error) {
    console.error('Error fetching challenge conversion rates:', error);
    return [];
  }
}

// Upsert global conversion rates
export async function upsertGlobalConversionRates(rates: ActivityPointConversion[]): Promise<void> {
  try {
    const { error } = await activityPointApi.upsertConversions(rates);
    
    if (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error('Error upserting global conversion rates:', error);
    throw error;
  }
}

// Upsert club conversion rates
export async function upsertClubConversionRates(clubId: string, rates: ClubPointConversion[]): Promise<void> {
  try {
    const { error } = await activityPointApi.upsertClubConversions(clubId, rates);
    
    if (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error('Error upserting club conversion rates:', error);
    throw error;
  }
}

// Upsert challenge conversion rates
export async function upsertChallengeConversionRates(challengeId: string, rates: ChallengePointConversion[]): Promise<void> {
  try {
    const { error } = await activityPointApi.upsertChallengeConversions(challengeId, rates);
    
    if (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error('Error upserting challenge conversion rates:', error);
    throw error;
  }
} 