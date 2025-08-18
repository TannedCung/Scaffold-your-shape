/**
 * CHALLENGE LEADERBOARD SERVICE
 * 
 * This service manages challenge leaderboards with Redis caching and Supabase fallback.
 * Similar to club leaderboards but focused on challenge participants.
 * 
 * DATA FLOW:
 * 1. getChallengeLeaderboard() checks Redis first
 * 2. If cache miss → rebuildAndGetChallengeLeaderboard()
 * 3. rebuildAndGetChallengeLeaderboard() rebuilds Redis cache
 * 4. Then tries to serve from Redis
 * 5. Only falls back to database if Redis is unavailable
 */

import { getRedis, isRedisAvailable } from './redis';
import { supabase } from './supabase';

export interface ChallengeLeaderboardEntry {
  userId: string;
  name: string;
  currentValue: number;
  progressPercentage: number;
  rank: number;
  completed: boolean;
  completedAt?: string;
  joinedAt: string;
  lastActivityDate?: string;
  avatarUrl?: string;
}

export interface ChallengeLeaderboardResult {
  entries: ChallengeLeaderboardEntry[];
  totalParticipants: number;
  challengeId: string;
  challengeInfo?: {
    title: string;
    targetValue: number;
    unit: string;
    endDate?: string;
  };
}

// Helper function to generate challenge leaderboard keys
export const getChallengeLeaderboardKey = (challengeId: string): string => {
  return `challenge_leaderboard:${challengeId}`;
};

/**
 * Update a participant's progress in the challenge leaderboard
 * This should be called whenever challenge progress is updated
 */
export async function updateChallengeLeaderboard(
  challengeId: string,
  userId: string,
  currentValue: number,
  progressPercentage: number
): Promise<void> {
  try {
    // Check if Redis is available
    if (!(await isRedisAvailable())) {
      console.warn('Redis not available, skipping challenge leaderboard update');
      return;
    }

    const redis = getRedis();
    const leaderboardKey = getChallengeLeaderboardKey(challengeId);

    // Use current value as the score for ranking
    // Higher values = better rank
    await redis.zadd(leaderboardKey, { score: currentValue, member: userId });

    // Store additional data in a hash for this user
    const userDataKey = `${leaderboardKey}:user:${userId}`;
    await redis.hset(userDataKey, {
      currentValue,
      progressPercentage,
      lastUpdated: Date.now()
    });

    // Set TTL of 24 hours for both keys
    await redis.expire(leaderboardKey, 86400);
    await redis.expire(userDataKey, 86400);

  } catch (error) {
    console.error('Error updating challenge leaderboard:', error);
    // Don't throw error to avoid breaking the main progress update flow
  }
}

/**
 * Get leaderboard for a specific challenge
 * Returns participants ordered by progress/completion
 */
export async function getChallengeLeaderboard(
  challengeId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ChallengeLeaderboardResult> {
  try {
    // Check if Redis is available
    if (!(await isRedisAvailable())) {
      console.warn('Redis not available, rebuilding from database');
      return await rebuildAndGetChallengeLeaderboard(challengeId, limit, offset);
    }

    const redis = getRedis();
    const leaderboardKey = getChallengeLeaderboardKey(challengeId);

    // Check if leaderboard exists in Redis
    const exists = await redis.exists(leaderboardKey);
    
    if (!exists) {
      return await rebuildAndGetChallengeLeaderboard(challengeId, limit, offset);
    }

    // Get total count
    const totalParticipants = await redis.zcard(leaderboardKey);

    // Get leaderboard entries with scores (descending order - highest values first)
    const entries = await redis.zrange(
      leaderboardKey,
      offset,
      offset + limit - 1,
      { rev: true, withScores: true }
    );

    // Transform the results into ChallengeLeaderboardEntry format
    const leaderboardEntries: ChallengeLeaderboardEntry[] = [];
    
    for (let i = 0; i < entries.length; i += 2) {
      const userId = entries[i] as string;
      const currentValue = entries[i + 1] as number;
      const rank = offset + (i / 2) + 1;
      
      // Get additional user data from hash
      const userDataKey = `${leaderboardKey}:user:${userId}`;
      const userData = await redis.hgetall(userDataKey);
      
      leaderboardEntries.push({
        userId,
        name: '', // Will be filled below
        currentValue,
        progressPercentage: userData?.progressPercentage ? parseFloat(String(userData.progressPercentage)) : 0,
        rank,
        completed: false, // Will be filled below
        joinedAt: '' // Will be filled below
      });
    }

    // Fetch user names and additional data from Supabase
    if (leaderboardEntries.length > 0) {
      const userIds = leaderboardEntries.map(entry => entry.userId);
      
      // Get profiles and challenge participation data
      const [profilesResult, participantsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds),
        supabase
          .from('challenge_participants')
          .select('user_id, completed, completed_at, joined_at, last_activity_date')
          .eq('challenge_id', challengeId)
          .in('user_id', userIds)
      ]);

      // Map data to entries
      if (profilesResult.data && participantsResult.data) {
        const profileMap = new Map(profilesResult.data.map(p => [p.id, p]));
        const participantMap = new Map(participantsResult.data.map(p => [p.user_id, p]));
        
        leaderboardEntries.forEach(entry => {
          const profile = profileMap.get(entry.userId);
          const participant = participantMap.get(entry.userId);
          
          entry.name = profile?.name || 'Unknown User';
          entry.avatarUrl = profile?.avatar_url;
          entry.completed = participant?.completed || false;
          entry.completedAt = participant?.completed_at;
          entry.joinedAt = participant?.joined_at || '';
          entry.lastActivityDate = participant?.last_activity_date;
        });
      }
    }

    // Get challenge info
    const challengeInfo = await getChallengeInfo(challengeId);

    return {
      entries: leaderboardEntries,
      totalParticipants,
      challengeId,
      challengeInfo
    };

  } catch (error) {
    console.error('Error in getChallengeLeaderboard:', error);
    // Fallback to database query
    return await getChallengeLeaderboardFromDatabase(challengeId, limit, offset);
  }
}

/**
 * Rebuild challenge leaderboard from database and cache in Redis
 */
export async function rebuildChallengeLeaderboard(challengeId: string): Promise<void> {
  try {
    // Get all challenge participants with their current progress
    const { data: participants, error: participantsError } = await supabase
      .from('challenge_participants')
      .select('user_id, current_value, progress_percentage')
      .eq('challenge_id', challengeId);

    if (participantsError) {
      throw new Error(`Error fetching challenge participants: ${participantsError.message}`);
    }

    if (!participants || participants.length === 0) {
      return;
    }

    // Update Redis if available
    if (await isRedisAvailable()) {
      const redis = getRedis();
      const leaderboardKey = getChallengeLeaderboardKey(challengeId);

      // Clear existing data
      await redis.del(leaderboardKey);

      // Add all participant scores and data
      for (const participant of participants) {
        // Add to sorted set with current value as score
        await redis.zadd(leaderboardKey, { 
          score: participant.current_value, 
          member: participant.user_id 
        });

        // Store additional data in hash
        const userDataKey = `${leaderboardKey}:user:${participant.user_id}`;
        await redis.hset(userDataKey, {
          currentValue: participant.current_value,
          progressPercentage: participant.progress_percentage,
          lastUpdated: Date.now()
        });
        await redis.expire(userDataKey, 86400);
      }

      // Set TTL of 24 hours
      await redis.expire(leaderboardKey, 86400);
    }

  } catch (error) {
    console.error('Error rebuilding challenge leaderboard:', error);
  }
}

/**
 * Helper function to rebuild and immediately return leaderboard data
 */
async function rebuildAndGetChallengeLeaderboard(
  challengeId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ChallengeLeaderboardResult> {
  try {
    // First rebuild the cache
    await rebuildChallengeLeaderboard(challengeId);

    // Try to get data from Redis after rebuilding
    if (await isRedisAvailable()) {
      try {
        const redis = getRedis();
        const leaderboardKey = getChallengeLeaderboardKey(challengeId);
        
        // Check if rebuild was successful
        const exists = await redis.exists(leaderboardKey);
        if (exists) {
          // Recursive call to get data from Redis
          return await getChallengeLeaderboard(challengeId, limit, offset);
        }
      } catch (redisError) {
        console.error('Error reading from Redis after rebuild:', redisError);
      }
    }

    // If Redis is not available or failed, fall back to database
    console.log(`Falling back to database for challenge ${challengeId} after Redis rebuild failed`);
    return await getChallengeLeaderboardFromDatabase(challengeId, limit, offset);
    
  } catch (error) {
    console.error('Error in rebuildAndGetChallengeLeaderboard:', error);
    return await getChallengeLeaderboardFromDatabase(challengeId, limit, offset);
  }
}

/**
 * Fallback function to get challenge leaderboard directly from database
 */
async function getChallengeLeaderboardFromDatabase(
  challengeId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ChallengeLeaderboardResult> {
  try {
    // Use the existing challenge_leaderboard view
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('challenge_leaderboard')
      .select(`
        challenge_id,
        user_id,
        user_name,
        avatar_url,
        current_value,
        progress_percentage,
        completed,
        completed_at,
        joined_at,
        rank
      `)
      .eq('challenge_id', challengeId)
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1);

    if (leaderboardError) {
      throw new Error(`Error fetching leaderboard: ${leaderboardError.message}`);
    }

    // Get total participants count
    const { count: totalParticipants } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId);

    // Transform data
    const entries: ChallengeLeaderboardEntry[] = (leaderboardData || []).map(entry => ({
      userId: entry.user_id,
      name: entry.user_name || 'Unknown User',
      currentValue: entry.current_value || 0,
      progressPercentage: entry.progress_percentage || 0,
      rank: entry.rank || 0,
      completed: entry.completed || false,
      completedAt: entry.completed_at,
      joinedAt: entry.joined_at,
      avatarUrl: entry.avatar_url
    }));

    // Get challenge info
    const challengeInfo = await getChallengeInfo(challengeId);

    return {
      entries,
      totalParticipants: totalParticipants || 0,
      challengeId,
      challengeInfo
    };

  } catch (error) {
    console.error('Error getting challenge leaderboard from database:', error);
    return {
      entries: [],
      totalParticipants: 0,
      challengeId
    };
  }
}

/**
 * Get basic challenge information
 */
async function getChallengeInfo(challengeId: string) {
  try {
    const { data: challenge } = await supabase
      .from('challenges')
      .select('title, target_value, unit, end_date')
      .eq('id', challengeId)
      .single();

    return challenge ? {
      title: challenge.title,
      targetValue: challenge.target_value,
      unit: challenge.unit,
      endDate: challenge.end_date
    } : undefined;
  } catch (error) {
    console.error('Error fetching challenge info:', error);
    return undefined;
  }
}

/**
 * Get a user's rank in a specific challenge
 */
export async function getUserChallengeRank(
  challengeId: string,
  userId: string
): Promise<number | null> {
  try {
    if (!(await isRedisAvailable())) {
      // Fallback to database calculation
      const { data: participant } = await supabase
        .from('challenge_leaderboard')
        .select('rank')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();
      
      return participant?.rank || null;
    }

    const redis = getRedis();
    const leaderboardKey = getChallengeLeaderboardKey(challengeId);

    // Get user's position in sorted set (0-based)
    const rank = await redis.zrevrank(leaderboardKey, userId);
    return rank !== null ? rank + 1 : null;
    
  } catch (error) {
    console.error('Error getting user challenge rank:', error);
    return null;
  }
}

/**
 * Update challenge progress when a new activity is added
 * This function finds all relevant challenges for the user and updates their progress
 */
export async function updateChallengeProgressFromActivity(
  userId: string,
  activityType: string,
  activityValue: number,
  activityUnit: string
): Promise<void> {
  try {
    console.log(`🏆 Checking challenge progress for user ${userId}: ${activityType} ${activityValue} ${activityUnit}`);

    // Find all active challenges that the user is participating in
    // and match the activity type (or are overall challenges)
    const { data: participations, error: participationsError } = await supabase
      .from('challenge_participants')
      .select(`
        challenge_id,
        current_value,
        completed,
        challenges!inner (
          id,
          title,
          activity_type,
          unit,
          target_value,
          status,
          start_date,
          end_date
        )
      `)
      .eq('user_id', userId)
      .eq('challenges.status', 'active');

    if (participationsError) {
      console.error('Error fetching user challenge participations:', participationsError);
      return;
    }

    if (!participations || participations.length === 0) {
      console.log(`📝 User ${userId} is not participating in any active challenges`);
      return; // User is not participating in any challenges
    }

    console.log(`📋 Found ${participations.length} active challenge participations for user ${userId}`);

    const now = new Date();
    let updatedChallenges = 0;

    // Process each relevant challenge
    for (const participation of participations) {
      const challenge = (participation.challenges as unknown) as { id: string; title: string; start_date: string; end_date?: string; activity_type?: string; target_value: number; target_unit: string };
      
      console.log(`🔍 Evaluating challenge "${challenge.title}" (${challenge.id})`);
      
      // Check if challenge is currently active (within date range)
      const startDate = new Date(challenge.start_date);
      const endDate = challenge.end_date ? new Date(challenge.end_date) : null;
      
      if (now < startDate || (endDate && now > endDate)) {
        console.log(`⏰ Challenge "${challenge.title}" is not in active period (${startDate.toISOString()} - ${endDate?.toISOString() || 'ongoing'})`);
        continue; // Challenge not in active period
      }

      // Check if activity type matches challenge requirements
      const challengeActivityType = challenge.activity_type?.toLowerCase();
      const userActivityType = activityType.toLowerCase();
      
      // Skip if activity type doesn't match (unless it's an "overall" challenge)
      if (challengeActivityType && 
          challengeActivityType !== 'overall' && 
          challengeActivityType !== userActivityType) {
        console.log(`🚫 Activity type "${userActivityType}" doesn't match challenge type "${challengeActivityType}"`);
        continue;
      }

      // Check if units are compatible
      const challengeUnit = challenge.target_unit?.toLowerCase();
      const userUnit = activityUnit.toLowerCase();
      
      // For now, we'll only update if units match exactly
      // In the future, we could add unit conversion logic
      if (challengeUnit && challengeUnit !== userUnit) {
        console.log(`📏 Unit mismatch: activity "${userUnit}" vs challenge "${challengeUnit}"`);
        continue;
      }

      // Calculate new progress
      const currentValue = participation.current_value || 0;
      const newValue = currentValue + activityValue;
      const targetValue = challenge.target_value || 1;
      const progressPercentage = Math.min(100, (newValue / targetValue) * 100);
      const isCompleted = newValue >= targetValue;
      const wasCompleted = participation.completed;

      console.log(`📊 Challenge "${challenge.title}" progress: ${currentValue} + ${activityValue} = ${newValue}/${targetValue} (${progressPercentage.toFixed(1)}%)`);

      // Update challenge participant progress
      const updateData: { current_value: number; progress_percentage: number; last_activity_date: string; completed?: boolean; completed_at?: string } = {
        current_value: newValue,
        progress_percentage: progressPercentage,
        last_activity_date: now.toISOString()
      };

      if (isCompleted && !wasCompleted) {
        updateData.completed = true;
        updateData.completed_at = now.toISOString();
        console.log(`🎉 Challenge "${challenge.title}" completed!`);
      }

      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update(updateData)
        .eq('challenge_id', challenge.id)
        .eq('user_id', userId);

      if (updateError) {
        console.error(`❌ Error updating challenge ${challenge.id} progress for user ${userId}:`, updateError);
        continue;
      }

      // Update Redis leaderboard cache asynchronously
      updateChallengeLeaderboard(
        challenge.id,
        userId,
        newValue,
        progressPercentage
      ).catch(err => {
        console.error(`❌ Error updating Redis cache for challenge ${challenge.id}:`, err);
        // Don't fail the main flow if Redis update fails
      });

      console.log(`✅ Updated challenge "${challenge.title}" progress for user ${userId}: ${currentValue} -> ${newValue} (${progressPercentage.toFixed(1)}%)`);
      updatedChallenges++;
    }

    console.log(`🏁 Challenge progress update complete: ${updatedChallenges} challenges updated for user ${userId}`);

  } catch (error) {
    console.error('❌ Error updating challenge progress from activity:', error);
    // Don't throw error to avoid breaking the main activity creation flow
  }
}

/**
 * Test Redis connectivity for challenge leaderboards
 */
export async function testChallengeRedisConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!(await isRedisAvailable())) {
      return { success: false, message: 'Redis not available' };
    }

    const redis = getRedis();
    const testKey = 'test:challenge_leaderboard:connectivity';
    
    // Test basic operations
    await redis.zadd(testKey, { score: 100, member: 'test-user' });
    const score = await redis.zscore(testKey, 'test-user');
    await redis.del(testKey);
    
    if (score === 100) {
      return { success: true, message: 'Challenge Redis connection working correctly' };
    } else {
      return { success: false, message: 'Challenge Redis operations failed' };
    }
  } catch (error) {
    return { success: false, message: `Challenge Redis test failed: ${error}` };
  }
} 




