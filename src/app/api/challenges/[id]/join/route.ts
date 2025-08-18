import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';
import { updateChallengeLeaderboard, rebuildChallengeLeaderboard } from '@/lib/challengeLeaderboard';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if challenge exists and is active
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, status, max_participants, participant_count, start_date, end_date')
      .eq('id', id)
      .single();

    if (challengeError) {
      if (challengeError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
      }
      return NextResponse.json({ error: challengeError.message }, { status: 500 });
    }

    if (challenge.status !== 'active') {
      return NextResponse.json({ error: 'Challenge is not active' }, { status: 400 });
    }

    // Check if challenge has started
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);

    if (now > endDate) {
      return NextResponse.json({ error: 'Challenge has ended' }, { status: 400 });
    }

    // Check max participants limit
    if (challenge.max_participants && challenge.participant_count >= challenge.max_participants) {
      return NextResponse.json({ error: 'Challenge is full' }, { status: 400 });
    }

    // Check if user is already a participant
    const { data: existingParticipant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', id)
      .eq('user_id', session.user.id)
      .single();

    if (existingParticipant) {
      return NextResponse.json({ error: 'Already joined this challenge' }, { status: 400 });
    }

    // Join the challenge
    const { data: participant, error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: id,
        user_id: session.user.id,
        current_value: 0,
        progress_percentage: 0,
        completed: false,
        joined_at: new Date().toISOString(),
        last_activity_date: new Date().toISOString(),
        rank: null,
        notes: null
      })
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .single();

    if (error) {
      console.warn('Warning joining challenge:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update Redis leaderboard cache asynchronously
    if (participant) {
      updateChallengeLeaderboard(
        id,
        session.user.id,
        participant.current_value || 0,
        participant.progress_percentage || 0
      ).catch(err => {
        console.error('Error updating challenge leaderboard cache after join:', err);
        // Don't fail the main request if Redis update fails
      });
    }

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.warn('Server warning joining challenge:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', id)
      .eq('user_id', session.user.id)
      .single();

    if (participantError) {
      if (participantError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not a participant in this challenge' }, { status: 404 });
      }
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    // Leave the challenge
    const { error } = await supabase
      .from('challenge_participants')
      .delete()
      .eq('challenge_id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.warn('Warning leaving challenge:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Rebuild Redis leaderboard cache asynchronously after user leaves
    // This is more efficient than trying to remove individual entries
    rebuildChallengeLeaderboard(id).catch(err => {
      console.error('Error rebuilding challenge leaderboard cache after leave:', err);
      // Don't fail the main request if Redis update fails
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn('Server warning leaving challenge:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 