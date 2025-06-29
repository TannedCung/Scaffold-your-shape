import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mapChallengeDbToChallenge } from '@/types';

export async function GET(
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

    // Fetch challenge details
    const { data: challenge, error } = await supabase
      .from('challenges')
      .select(`
        *,
        club:clubs(id, name),
        challenge_participants!inner(
          id,
          user_id,
          progress_percentage,
          current_value,
          joined_at,
          last_activity_date,
          rank,
          notes
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.warn('Warning fetching challenge:', error);
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    if (!challenge) {
      console.warn('Challenge not found:', id);
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Map the challenge data
    const mappedChallenge = mapChallengeDbToChallenge(challenge);

    return NextResponse.json({ data: mappedChallenge });
  } catch (error) {
    console.warn('Warning in GET /api/challenges/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Update challenge
    const { data: challenge, error } = await supabase
      .from('challenges')
      .update({
        title: body.title,
        description: body.description,
        activity_type: body.activityType,
        target_value: body.targetValue,
        unit: body.unit,
        start_date: body.startDate,
        end_date: body.endDate,
        challenge_type: body.challengeType,
        difficulty_level: body.difficultyLevel,
        reward_type: body.rewardType,
        reward_value: body.rewardValue,
        max_participants: body.maxParticipants,
        auto_join: body.autoJoin,
        featured: body.featured,
        tags: body.tags,
        rules: body.rules,
        background_image_url: body.backgroundImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Warning updating challenge:', error);
      return NextResponse.json(
        { error: 'Failed to update challenge' },
        { status: 500 }
      );
    }

    const mappedChallenge = mapChallengeDbToChallenge(challenge);
    return NextResponse.json({ data: mappedChallenge });
  } catch (error) {
    console.warn('Warning in PUT /api/challenges/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete challenge (cascade will handle participants)
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Warning deleting challenge:', error);
      return NextResponse.json(
        { error: 'Failed to delete challenge' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.warn('Warning in DELETE /api/challenges/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 