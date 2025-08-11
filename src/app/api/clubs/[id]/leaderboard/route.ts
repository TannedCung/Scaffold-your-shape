import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLeaderboard, rebuildLeaderboard, testRedisConnection } from '@/lib/leaderboard';
import { getRedis, getLeaderboardKey, isRedisAvailable } from '@/lib/redis';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId } = await params;
    const { searchParams } = new URL(request.url);
    const activityType = searchParams.get('activityType') || 'run';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const rebuild = searchParams.get('rebuild') === 'true';
    const debug = searchParams.get('debug') === 'true';
    const debugRedis = searchParams.get('debugRedis') === 'true';

    // Check if user is a member of the club
    const { data: membership } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', session.user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Not a club member' }, { status: 403 });
    }

    // Debug Redis mode - provide detailed Redis data
    if (debugRedis) {
      try {
        const redisTest = await testRedisConnection();
        const debugInfo: {
          redisConnection: { success: boolean; message: string };
          clubId: string;
          activityType: string;
          userIsMember: boolean;
          userRole: string;
          currentTimestamp: string;
          redis?: {
            key: string;
            exists: number;
            totalMembers: number;
            allMembers: (string | number)[];
            topMembers: (string | number)[];
            ttl: number;
          } | { error: string };
        } = {
          redisConnection: redisTest,
          clubId,
          activityType,
          userIsMember: !!membership,
          userRole: membership.role,
          currentTimestamp: new Date().toISOString(),
        };

        if (await isRedisAvailable()) {
          const redis = getRedis();
          const leaderboardKey = getLeaderboardKey(clubId, activityType);
          
          debugInfo.redis = {
            key: leaderboardKey,
            exists: await redis.exists(leaderboardKey),
            totalMembers: await redis.zcard(leaderboardKey),
            allMembers: await redis.zrange(leaderboardKey, 0, -1, { rev: true, withScores: true }),
            topMembers: await redis.zrange(leaderboardKey, 0, 4, { rev: true, withScores: true }),
            ttl: await redis.ttl(leaderboardKey)
          };
        } else {
          debugInfo.redis = { error: 'Redis not available' };
        }

        return NextResponse.json({ success: true, debug: debugInfo });
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          debug: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }

    // Debug mode - provide Redis connection info and data flow details
    if (debug) {
      const redisTest = await testRedisConnection();
      return NextResponse.json({ 
        success: true, 
        debug: {
          redisConnection: redisTest,
          clubId,
          activityType,
          userIsMember: !!membership,
          userRole: membership.role,
          currentTimestamp: new Date().toISOString()
        }
      });
    }

    // Rebuild if requested
    if (rebuild) {
      console.log(`🔄 [API] Rebuilding leaderboard for club ${clubId}, activity: ${activityType}`);
      await rebuildLeaderboard(clubId, activityType);
    }

    console.log(`📋 [API] Getting leaderboard for club ${clubId}, activity: ${activityType}, limit: ${limit}, offset: ${offset}`);
    const leaderboard = await getLeaderboard(clubId, activityType, limit, offset);
    
    console.log(`📤 [API] Returning leaderboard data:`, {
      entriesCount: leaderboard.entries?.length || 0,
      totalMembers: leaderboard.totalMembers,
      activityType: leaderboard.activityType,
      clubId: leaderboard.clubId,
      entries: leaderboard.entries?.slice(0, 3) // Log first 3 entries for debugging
    });

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId } = await params;
    const { activityType } = await request.json();

    if (!activityType) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 });
    }

    // Validate club exists and user has admin access to it
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name, creator_id')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is the club creator or admin
    const { data: membership } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', session.user.id)
      .single();

    const isCreator = club.creator_id === session.user.id;
    const isAdmin = membership?.role === 'admin';

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Rebuild the leaderboard
    await rebuildLeaderboard(clubId, activityType);

    return NextResponse.json({
      success: true,
      message: `Leaderboard rebuilt for ${activityType}`
    });

  } catch (error) {
    console.error('Error rebuilding leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 