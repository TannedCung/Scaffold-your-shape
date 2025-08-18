import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';
import { updateChallengeLeaderboard } from '@/lib/challengeLeaderboard';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentValue, notes } = body;

    if (currentValue === undefined || currentValue < 0) {
      return NextResponse.json(
        { error: 'Invalid current value' },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('id, current_value')
      .eq('challenge_id', id)
      .eq('user_id', session.user.id)
      .single();

    if (participantError) {
      if (participantError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not a participant in this challenge' }, { status: 404 });
      }
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    // Update progress
    const updateData: { current_value: number; last_activity_date: string; notes?: string } = {
      current_value: currentValue,
      last_activity_date: new Date().toISOString(),
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: updatedParticipant, error } = await supabase
      .from('challenge_participants')
      .update(updateData)
      .eq('challenge_id', id)
      .eq('user_id', session.user.id)
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update Redis leaderboard cache asynchronously
    if (updatedParticipant) {
      updateChallengeLeaderboard(
        id,
        session.user.id,
        updatedParticipant.current_value,
        updatedParticipant.progress_percentage
      ).catch(err => {
        console.error('Error updating challenge leaderboard cache:', err);
        // Don't fail the main request if Redis update fails
      });
    }

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 