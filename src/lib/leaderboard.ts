import { getRedis, getLeaderboardKey, isRedisAvailable } from './redis';
import { supabase } from './supabase';
import { fetchClubConversionRates } from '@/services/activityPointService';
import { calculateActivityPoints } from '@/utils/activityPoints';
import { Activity, ClubPointConversion, ActivityPointConversion } from '@/types';
import { DEFAULT_ACTIVITY_POINT_CONVERSION } from '@/constants/defaultActivityPointConversion';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  totalMembers: number;
  activityType: string;
  clubId: string;
}

/**
 * Update a user's score in the leaderboard for a specific club and activity type
 * This should be called whenever a new activity is added
 */
export async function updateLeaderboard(
  clubId: string,
  userId: string,
  activityType: string,
  activityValue: number,
  activityUnit: string
): Promise<void> {
  try {
    // Check if Redis is available
    if (!(await isRedisAvailable())) {
      console.warn('Redis not available, skipping leaderboard update');
      return;
    }

    // Get club-specific conversion rates
    let clubConversions;
    try {
      clubConversions = await fetchClubConversionRates(clubId);
    } catch (error) {
      console.error(`Error fetching club conversion rates for club ${clubId}:`, error);
      // Use default conversion rates as fallback
      clubConversions = DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        club_id: clubId
      }));
    }
    
    // Find the conversion rate for this activity type and unit
    const conversion = clubConversions.find(
      c => c.activity_type === activityType && c.unit === activityUnit
    );

    if (!conversion) {
      console.warn(`No conversion rate found for ${activityType} (${activityUnit}) in club ${clubId}`);
      return;
    }

    // Calculate points for this activity
    const points = activityValue * conversion.rate;
    
    if (points <= 0) {
      return; // No points to add
    }

    const redis = getRedis();
    const leaderboardKey = getLeaderboardKey(clubId, activityType);

    // Increment the user's score in the sorted set
    await redis.zincrby(leaderboardKey, points, userId);

    // Set TTL of 24 hours for the leaderboard data
    await redis.expire(leaderboardKey, 86400);

    console.log(`Updated leaderboard for user ${userId} in club ${clubId} for ${activityType}: +${points} points`);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    // Don't throw error to avoid breaking the main activity creation flow
  }
}

/**
 * Get leaderboard for a specific club and activity type
 * Returns top users with their scores and ranks
 */
export async function getLeaderboard(
  clubId: string,
  activityType: string,
  limit: number = 50,
  offset: number = 0
): Promise<LeaderboardResult> {
  try {
    // Check if Redis is available
    if (!(await isRedisAvailable())) {
      console.warn('Redis not available, rebuilding from database');
      return await rebuildAndGetLeaderboard(clubId, activityType, limit, offset);
    }

    const redis = getRedis();
    const leaderboardKey = getLeaderboardKey(clubId, activityType);

    // Check if leaderboard exists in Redis
    const exists = await redis.exists(leaderboardKey);
    
    if (!exists) {
      console.log(`Leaderboard cache miss for ${clubId}:${activityType}, rebuilding...`);
      return await rebuildAndGetLeaderboard(clubId, activityType, limit, offset);
    }

    // Get total count
    const totalMembers = await redis.zcard(leaderboardKey);

    // Get leaderboard entries with scores (descending order - highest scores first)
    const entries = await redis.zrange(
      leaderboardKey,
      offset,
      offset + limit - 1,
      { rev: true, withScores: true }
    );

    // Transform the results into LeaderboardEntry format
    const leaderboardEntries: LeaderboardEntry[] = [];
    
    for (let i = 0; i < entries.length; i += 2) {
      const userId = entries[i] as string;
      const score = entries[i + 1] as number;
      const rank = offset + (i / 2) + 1;
      
      leaderboardEntries.push({
        userId,
        name: '', // Will be filled below
        score,
        rank
      });
    }

    // Fetch user names from Supabase
    if (leaderboardEntries.length > 0) {
      const userIds = leaderboardEntries.map(entry => entry.userId);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      // Map names to entries
      if (profiles) {
        const nameMap = new Map(profiles.map(p => [p.id, p.name || 'Unknown User']));
        leaderboardEntries.forEach(entry => {
          entry.name = nameMap.get(entry.userId) || 'Unknown User';
        });
      }
    }

    return {
      entries: leaderboardEntries,
      totalMembers,
      activityType,
      clubId
    };

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    // Fallback to database query
    return await rebuildAndGetLeaderboard(clubId, activityType, limit, offset);
  }
}

/**
 * Rebuild leaderboard from database and cache in Redis
 * This is called when cache is cold or expired
 */
export async function rebuildLeaderboard(clubId: string, activityType: string): Promise<void> {
  try {
    console.log(`Rebuilding leaderboard for club ${clubId}, activity type: ${activityType}`);

    // Get all club members
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId);

    if (membersError) {
      throw new Error(`Error fetching club members: ${membersError.message}`);
    }

    if (!clubMembers || clubMembers.length === 0) {
      console.log(`No members found for club ${clubId}`);
      return;
    }

    const userIds = clubMembers.map(m => m.user_id);

    // Get all activities for these users of the specified type
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('user_id, type, value, unit')
      .in('user_id', userIds)
      .eq('type', activityType);

    if (activitiesError) {
      throw new Error(`Error fetching activities: ${activitiesError.message}`);
    }

    // Get club-specific conversion rates
    let clubConversions;
    try {
      clubConversions = await fetchClubConversionRates(clubId);
    } catch (error) {
      console.error(`Error fetching club conversion rates for club ${clubId}:`, error);
      // Use default conversion rates as fallback
      clubConversions = DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        club_id: clubId
      }));
    }

    // Calculate total scores for each user
    const userScores = new Map<string, number>();

    if (activities) {
      for (const activity of activities) {
        const conversion = clubConversions.find(
          c => c.activity_type === activity.type && c.unit === activity.unit
        );

        if (conversion) {
          const points = activity.value * conversion.rate;
          const currentScore = userScores.get(activity.user_id) || 0;
          userScores.set(activity.user_id, currentScore + points);
        }
      }
    }

    // Update Redis if available
    if (await isRedisAvailable()) {
      const redis = getRedis();
      const leaderboardKey = getLeaderboardKey(clubId, activityType);

      // Clear existing data
      await redis.del(leaderboardKey);

      // Add all user scores
      if (userScores.size > 0) {
        for (const [userId, score] of userScores) {
          await redis.zadd(leaderboardKey, { score, member: userId });
        }
      }

      // Set TTL of 24 hours
      await redis.expire(leaderboardKey, 86400);

      console.log(`Rebuilt leaderboard for ${clubId}:${activityType} with ${userScores.size} users`);
    }

  } catch (error) {
    console.error('Error rebuilding leaderboard:', error);
    throw error;
  }
}

/**
 * Helper function to rebuild and immediately return leaderboard data
 */
async function rebuildAndGetLeaderboard(
  clubId: string,
  activityType: string,
  limit: number = 50,
  offset: number = 0
): Promise<LeaderboardResult> {
  try {
    // First rebuild the cache
    await rebuildLeaderboard(clubId, activityType);

    // Then fetch directly from database to avoid infinite recursion
    return await getLeaderboardFromDatabase(clubId, activityType, limit, offset);
  } catch (error) {
    console.error('Error in rebuildAndGetLeaderboard:', error);
    // Fallback to direct database query
    return await getLeaderboardFromDatabase(clubId, activityType, limit, offset);
  }
}

/**
 * Fallback function to get leaderboard directly from database
 */
async function getLeaderboardFromDatabase(
  clubId: string,
  activityType: string,
  limit: number = 50,
  offset: number = 0
): Promise<LeaderboardResult> {
  try {
    console.log(`Getting leaderboard from database for ${clubId}:${activityType}`);

    // Get club members with their profile information
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select(`
        user_id,
        profiles!inner (
          id,
          name
        )
      `)
      .eq('club_id', clubId);

    if (membersError) {
      throw new Error(`Error fetching club members: ${membersError.message}`);
    }

    if (!clubMembers || clubMembers.length === 0) {
      return {
        entries: [],
        totalMembers: 0,
        activityType,
        clubId
      };
    }

    const userIds = clubMembers.map(m => m.user_id);

    // Get all activities for these users of the specified type
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('user_id, type, value, unit')
      .in('user_id', userIds)
      .eq('type', activityType);

    if (activitiesError) {
      throw new Error(`Error fetching activities: ${activitiesError.message}`);
    }

    // Get club-specific conversion rates
    let clubConversions;
    try {
      clubConversions = await fetchClubConversionRates(clubId);
    } catch (error) {
      console.error(`Error fetching club conversion rates for club ${clubId}:`, error);
      // Use default conversion rates as fallback
      clubConversions = DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        club_id: clubId
      }));
    }

    // Calculate total scores for each user
    const userScores = new Map<string, number>();
    const userNames = new Map<string, string>();

    // Initialize user data
    for (const member of clubMembers) {
      userScores.set(member.user_id, 0);
      const memberProfile = member.profiles as { name?: string } | null;
      userNames.set(member.user_id, memberProfile?.name || 'Unknown User');
    }

    // Calculate points from activities
    if (activities) {
      for (const activity of activities) {
        const conversion = clubConversions.find(
          c => c.activity_type === activity.type && c.unit === activity.unit
        );

        if (conversion) {
          const points = activity.value * conversion.rate;
          const currentScore = userScores.get(activity.user_id) || 0;
          userScores.set(activity.user_id, currentScore + points);
        }
      }
    }

    // Convert to sorted array
    const sortedEntries = Array.from(userScores.entries())
      .map(([userId, score]) => ({
        userId,
        name: userNames.get(userId) || 'Unknown User',
        score,
        rank: 0 // Will be set below
      }))
      .sort((a, b) => b.score - a.score) // Descending order
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))
      .slice(offset, offset + limit);

    return {
      entries: sortedEntries,
      totalMembers: clubMembers.length,
      activityType,
      clubId
    };

  } catch (error) {
    console.error('Error getting leaderboard from database:', error);
    return {
      entries: [],
      totalMembers: 0,
      activityType,
      clubId
    };
  }
}

/**
 * Get a user's rank in a specific leaderboard
 */
export async function getUserRank(
  clubId: string,
  userId: string,
  activityType: string
): Promise<number | null> {
  try {
    if (!(await isRedisAvailable())) {
      // Fallback to database calculation
      const leaderboard = await getLeaderboardFromDatabase(clubId, activityType, 1000, 0);
      const userEntry = leaderboard.entries.find(entry => entry.userId === userId);
      return userEntry ? userEntry.rank : null;
    }

    const redis = getRedis();
    const leaderboardKey = getLeaderboardKey(clubId, activityType);

    // Get all members and find user rank
    const allMembers = await redis.zrange(leaderboardKey, 0, -1, { rev: true });
    const userIndex = allMembers.indexOf(userId);
    return userIndex >= 0 ? userIndex + 1 : null;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
} 