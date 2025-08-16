/**
 * LEADERBOARD SERVICE - FIXED VERSION
 * 
 * This service manages club leaderboards with Redis caching and Supabase fallback.
 * 
 * ISSUE FIXED: Previously, when rebuilding leaderboard cache, we would populate Redis
 * but then immediately fall back to database queries instead of using the cached data.
 * 
 * FIX: After rebuilding Redis cache, we now properly attempt to serve data from Redis
 * before falling back to the database.
 * 
 * DATA FLOW:
 * 1. getLeaderboard() checks Redis first
 * 2. If cache miss → rebuildAndGetLeaderboard()
 * 3. rebuildAndGetLeaderboard() rebuilds Redis cache
 * 4. Then tries to serve from Redis (NEW: this was missing before)
 * 5. Only falls back to database if Redis is unavailable
 * 
 * This ensures proper Redis utilization and performance benefits.
 * 
 * NORMALIZATION ADDED: Activity types and units are now normalized for consistent
 * leaderboard grouping and conversion rate matching.
 */

import { getRedis, getLeaderboardKey, isRedisAvailable } from './redis';
import { supabase } from './supabase';
import { fetchClubConversionRatesServer } from '@/services/activityPointService.server';
import { calculateActivityPoints } from '@/utils/activityPoints';
import { Activity, ClubPointConversion, ActivityPointConversion } from '@/types';
import { DEFAULT_ACTIVITY_POINT_CONVERSION } from '@/constants/defaultActivityPointConversion';
import { normalizeActivityType, normalizeUnit, findNormalizedConversion } from '@/constants/activityNormalization';

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

    // Normalize activity type and unit for consistent lookups
    const normalizedType = normalizeActivityType(activityType);
    const normalizedUnit = normalizeUnit(activityUnit);


    // Get club-specific conversion rates using server-side function
    const clubConversions = await fetchClubConversionRatesServer(clubId);
    
    // Find the conversion rate for this activity type and unit using normalized lookup
    const conversion = findNormalizedConversion(clubConversions, activityType, activityUnit);

    if (!conversion) {
      console.warn(`No conversion rate found for ${activityType} (${activityUnit}) -> normalized: ${normalizedType} (${normalizedUnit}) in club ${clubId}`);
      
      // Try fallback to default conversion rates
      const defaultConversion = findNormalizedConversion(DEFAULT_ACTIVITY_POINT_CONVERSION, activityType, activityUnit);
      if (defaultConversion) {
        const points = activityValue * defaultConversion.rate;
        if (points > 0) {
          const redis = getRedis();
          const leaderboardKey = getLeaderboardKey(clubId, normalizedType);
          await redis.zincrby(leaderboardKey, points, userId);
          await redis.expire(leaderboardKey, 86400);
        }
      }
      return;
    }

    // Calculate points for this activity
    const points = activityValue * conversion.rate;
    
    if (points <= 0) {
      return; // No points to add
    }

    const redis = getRedis();
    const leaderboardKey = getLeaderboardKey(clubId, normalizedType);

    // Increment the user's score in the sorted set
    await redis.zincrby(leaderboardKey, points, userId);

    // Set TTL of 24 hours for the leaderboard data
    await redis.expire(leaderboardKey, 86400);

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
    // Normalize activity type for consistent Redis key lookup
    const normalizedType = normalizeActivityType(activityType);
    

    // Check if Redis is available
    if (!(await isRedisAvailable())) {
      console.warn('Redis not available, rebuilding from database');
      return await rebuildAndGetLeaderboard(clubId, normalizedType, limit, offset);
    }

    const redis = getRedis();
    const leaderboardKey = getLeaderboardKey(clubId, normalizedType);

    // Check if leaderboard exists in Redis
    const exists = await redis.exists(leaderboardKey);
    
    if (!exists) {
      return await rebuildAndGetLeaderboard(clubId, normalizedType, limit, offset);
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

    const result = {
      entries: leaderboardEntries,
      totalMembers,
      activityType: normalizedType,
      clubId
    };

    return result;

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    // Fallback to database query
    return await rebuildAndGetLeaderboard(clubId, normalizeActivityType(activityType), limit, offset);
  }
}

/**
 * Rebuild leaderboard from database and cache in Redis
 * This is called when cache is cold or expired
 */
export async function rebuildLeaderboard(clubId: string, activityType: string): Promise<void> {
  try {
    // Normalize activity type
    const normalizedType = normalizeActivityType(activityType);
    

    // Get all club members
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId);

    if (membersError) {
      throw new Error(`Error fetching club members: ${membersError.message}`);
    }

    if (!clubMembers || clubMembers.length === 0) {
      return;
    }

    const userIds = clubMembers.map(m => m.user_id);

    // Get all activities for these users of the specified type (using original activity types)
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('user_id, type, value, unit')
      .in('user_id', userIds);

    if (activitiesError) {
      throw new Error(`Error fetching activities: ${activitiesError.message}`);
    }

    // Filter activities by normalized type
    const filteredActivities = activities?.filter(activity => 
      normalizeActivityType(activity.type) === normalizedType
    ) || [];

    // Get club-specific conversion rates
    let clubConversions;
    try {
      clubConversions = await fetchClubConversionRatesServer(clubId);
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


    if (filteredActivities.length > 0) {
      for (const activity of filteredActivities) {
        const conversion = findNormalizedConversion(clubConversions, activity.type, activity.unit);

        if (conversion) {
          const points = activity.value * conversion.rate;
          const currentScore = userScores.get(activity.user_id) || 0;
          const newScore = currentScore + points;
          userScores.set(activity.user_id, newScore);
          
          if (points > 0) {
          }
        } else {
          const normalizedActivityType = normalizeActivityType(activity.type);
          const normalizedActivityUnit = normalizeUnit(activity.unit);
        }
      }
    }


    // Update Redis if available
    if (await isRedisAvailable()) {
      const redis = getRedis();
      const leaderboardKey = getLeaderboardKey(clubId, normalizedType);

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

    }

  } catch (error) {
    console.error('Error rebuilding leaderboard:', error);
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
    // Normalize activity type
    const normalizedType = normalizeActivityType(activityType);
    
    // First rebuild the cache
    await rebuildLeaderboard(clubId, normalizedType);

    // Try to get data from Redis after rebuilding
    if (await isRedisAvailable()) {
      try {
        const redis = getRedis();
        const leaderboardKey = getLeaderboardKey(clubId, normalizedType);
        
        // Check if rebuild was successful
        const exists = await redis.exists(leaderboardKey);
        if (exists) {
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
            activityType: normalizedType,
            clubId
          };
        }
      } catch (redisError) {
        console.error('Error reading from Redis after rebuild:', redisError);
      }
    }

    // If Redis is not available or failed, fall back to database
    console.log(`Falling back to database for ${clubId}:${normalizedType} after Redis rebuild failed`);
    return await getLeaderboardFromDatabase(clubId, normalizedType, limit, offset);
  } catch (error) {
    console.error('Error in rebuildAndGetLeaderboard:', error);
    // Fallback to direct database query
    return await getLeaderboardFromDatabase(clubId, normalizeActivityType(activityType), limit, offset);
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
    // Normalize activity type
    const normalizedType = normalizeActivityType(activityType);
    

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
        activityType: normalizedType,
        clubId
      };
    }

    const userIds = clubMembers.map(m => m.user_id);

    // Get all activities for these users (all types, will filter by normalized type)
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('user_id, type, value, unit')
      .in('user_id', userIds);

    if (activitiesError) {
      throw new Error(`Error fetching activities: ${activitiesError.message}`);
    }

    // Filter activities by normalized type
    const filteredActivities = activities?.filter(activity => 
      normalizeActivityType(activity.type) === normalizedType
    ) || [];

    // Get club-specific conversion rates
    let clubConversions;
    try {
      clubConversions = await fetchClubConversionRatesServer(clubId);
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
    if (filteredActivities.length > 0) {
      for (const activity of filteredActivities) {
        const conversion = findNormalizedConversion(clubConversions, activity.type, activity.unit);

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
      activityType: normalizedType,
      clubId
    };

  } catch (error) {
    console.error('Error getting leaderboard from database:', error);
    return {
      entries: [],
      totalMembers: 0,
      activityType: normalizeActivityType(activityType),
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
    // Normalize activity type
    const normalizedType = normalizeActivityType(activityType);
    
    if (!(await isRedisAvailable())) {
      // Fallback to database calculation
      const leaderboard = await getLeaderboardFromDatabase(clubId, normalizedType, 1000, 0);
      const userEntry = leaderboard.entries.find(entry => entry.userId === userId);
      return userEntry ? userEntry.rank : null;
    }

    const redis = getRedis();
    const leaderboardKey = getLeaderboardKey(clubId, normalizedType);

    // Get all members and find user rank
    const allMembers = await redis.zrange(leaderboardKey, 0, -1, { rev: true });
    const userIndex = allMembers.indexOf(userId);
    return userIndex >= 0 ? userIndex + 1 : null;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
}

/**
 * Test Redis connectivity and basic operations for debugging
 */
export async function testRedisConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!(await isRedisAvailable())) {
      return { success: false, message: 'Redis not available' };
    }

    const redis = getRedis();
    const testKey = 'test:leaderboard:connectivity';
    
    // Test basic operations
    await redis.zadd(testKey, { score: 100, member: 'test-user' });
    const score = await redis.zscore(testKey, 'test-user');
    await redis.del(testKey);
    
    if (score === 100) {
      return { success: true, message: 'Redis connection and operations working correctly' };
    } else {
      return { success: false, message: 'Redis operations failed' };
    }
  } catch (error) {
    return { success: false, message: `Redis test failed: ${error}` };
  }
} 