import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!id) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Fetch leaderboard data using the view
    const { data: leaderboard, error } = await supabaseAdmin
      .from('challenge_leaderboard')
      .select(`
        challenge_id,
        user_id,
        current_value,
        progress_percentage,
        rank,
        joined_at,
        last_activity_date,
        profile:profiles(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('challenge_id', id)
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.warn('Warning fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Format the leaderboard data
    const formattedLeaderboard = (leaderboard || []).map((entry, index) => ({
      id: entry.user_id,
      userId: entry.user_id,
      challengeId: entry.challenge_id,
      currentValue: entry.current_value || 0,
      progressPercentage: entry.progress_percentage || 0,
      rank: entry.rank || (offset + index + 1),
      joinedAt: entry.joined_at,
      lastActivityDate: entry.last_activity_date,
      profile: {
        id: (entry.profile as any)?.id || entry.user_id,
        fullName: (entry.profile as any)?.full_name || 'Unknown User',
        avatarUrl: (entry.profile as any)?.avatar_url
      }
    }));

    return NextResponse.json({ 
      data: formattedLeaderboard,
      pagination: {
        limit,
        offset,
        total: formattedLeaderboard.length
      }
    });
  } catch (error) {
    console.warn('Warning in GET /api/challenges/[id]/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 