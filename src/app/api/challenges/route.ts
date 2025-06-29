import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';
import { ChallengeDb, ChallengeType, DifficultyLevel, RewardType, ChallengeStatus } from '@/types';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const featured = searchParams.get('featured');
    const challengeType = searchParams.get('type');
    const clubId = searchParams.get('clubId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('challenges')
      .select(`
        *,
        profiles!challenges_creator_id_fkey(name, avatar_url),
        clubs(name, image_url)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (challengeType) {
      query = query.eq('challenge_type', challengeType);
    }

    if (clubId) {
      query = query.eq('club_id', clubId);
    }

    const { data: challenges, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch user's participation status for all challenges
    const challengeIds = challenges?.map(c => c.id) || [];
    let userParticipations: Array<{
      challenge_id: string;
      user_id: string;
      current_value: number;
      progress_percentage: number;
      completed: boolean;
      joined_at: string;
      last_activity_date: string | null;
      rank: number | null;
      notes: string | null;
    }> = [];
    
    if (challengeIds.length > 0) {
      const { data: participations, error: participationError } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', session.user.id)
        .in('challenge_id', challengeIds);

      if (!participationError) {
        userParticipations = participations || [];
      }
    }

    // Enrich challenges with participation status
    const enrichedChallenges = challenges?.map(challenge => {
      const participation = userParticipations.find(p => p.challenge_id === challenge.id);
      return {
        ...challenge,
        user_participation: participation || null,
        is_participant: !!participation
      };
         }) || [];

    return NextResponse.json(enrichedChallenges);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const {
      title,
      description,
      targetValue,
      unit,
      startDate,
      endDate,
      challengeType = 'individual',
      difficultyLevel = 'beginner',
      rewardType = 'badge',
      rewardValue = 0,
      isPublic = true,
      maxParticipants,
      autoJoin = false,
      featured = false,
      tags,
      rules,
      status = 'active',
      clubId,
      backgroundImageUrl,
      activityType,
      exerciseId
    } = body;

    if (!title || !description || !targetValue || !unit || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, targetValue, unit, startDate, endDate' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const challengeData: Partial<ChallengeDb> = {
      title,
      description,
      creator_id: session.user.id,
      target_value: targetValue,
      unit,
      start_date: startDate,
      end_date: endDate,
      is_public: isPublic,
      challenge_type: challengeType as ChallengeType,
      difficulty_level: difficultyLevel as DifficultyLevel,
      reward_type: rewardType as RewardType,
      reward_value: rewardValue,
      max_participants: maxParticipants || null,
      auto_join: autoJoin,
      featured,
      tags: tags || null,
      rules: rules || null,
      status: status as ChallengeStatus,
      club_id: clubId || null,
      background_image_url: backgroundImageUrl || null,
      activity_type: activityType || null,
      exercise_id: exerciseId || null,
      participant_count: 0
    };

    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select(`
        *,
        profiles!challenges_creator_id_fkey(name, avatar_url),
        clubs(name, image_url)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-join the creator if autoJoin is enabled
    if (autoJoin) {
      await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challenge.id,
          user_id: session.user.id,
          current_value: 0,
          completed: false
        });
    }

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 