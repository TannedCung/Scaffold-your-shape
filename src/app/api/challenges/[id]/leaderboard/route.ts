import { NextRequest, NextResponse } from 'next/server';
import { getChallengeLeaderboard, rebuildChallengeLeaderboard } from '@/lib/challengeLeaderboard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const rebuild = searchParams.get('rebuild') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Rebuild cache if requested
    if (rebuild) {
      await rebuildChallengeLeaderboard(id);
    }

    // Get leaderboard using Redis-backed service
    const leaderboard = await getChallengeLeaderboard(id, limit, offset);

    // Format the response to match the expected frontend structure
    const formattedLeaderboard = leaderboard.entries.map(entry => ({
      id: entry.userId,
      userId: entry.userId,
      challengeId: leaderboard.challengeId,
      currentValue: entry.currentValue,
      progressPercentage: entry.progressPercentage,
      rank: entry.rank,
      joinedAt: entry.joinedAt,
      lastActivityDate: entry.lastActivityDate,
      completed: entry.completed,
      completedAt: entry.completedAt,
      profile: {
        id: entry.userId,
        fullName: entry.name,
        avatarUrl: entry.avatarUrl
      }
    }));

    return NextResponse.json({ 
      data: formattedLeaderboard,
      pagination: {
        limit,
        offset,
        total: leaderboard.totalParticipants
      },
      challengeInfo: leaderboard.challengeInfo,
      cachedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/challenges/[id]/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to rebuild leaderboard cache
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Rebuild the leaderboard cache
    await rebuildChallengeLeaderboard(id);

    return NextResponse.json({ 
      message: 'Challenge leaderboard cache rebuilt successfully',
      challengeId: id,
      rebuiltAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error rebuilding challenge leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to rebuild leaderboard cache' },
      { status: 500 }
    );
  }
} 