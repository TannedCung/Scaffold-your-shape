import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's challenge participations
    const { data: participations, error } = await supabase
      .from('challenge_participants')
      .select(`
        id,
        challenge_id,
        user_id,
        current_value,
        progress_percentage,
        completed,
        completed_at,
        joined_at,
        last_activity_date,
        rank,
        notes
      `)
      .eq('user_id', session.user.id);

    if (error) {
      console.warn('Warning fetching user participations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch participations' },
        { status: 500 }
      );
    }

    // Format the participations data
    const formattedParticipations = (participations || []).map((participation) => ({
      id: participation.id,
      challengeId: participation.challenge_id,
      userId: participation.user_id,
      currentValue: participation.current_value || 0,
      progressPercentage: participation.progress_percentage || 0,
      completed: participation.completed || false,
      completedAt: participation.completed_at,
      joinedAt: participation.joined_at,
      lastActivityDate: participation.last_activity_date,
      rank: participation.rank,
      notes: participation.notes
    }));

    return NextResponse.json({ data: formattedParticipations });
  } catch (error) {
    console.warn('Warning in GET /api/challenges/my-participations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 