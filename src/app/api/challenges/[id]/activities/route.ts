import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    const { id: challengeId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const activityType = searchParams.get('type');
    const offset = (page - 1) * limit;

    // First check if user is a participant in the challenge
    const { data: participation, error: participationError } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', session.user.id)
      .single();

    if (participationError || !participation) {
      return NextResponse.json({ error: 'You must be a participant in this challenge to view activities' }, { status: 403 });
    }

    // Get challenge details to filter by activity type if needed
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('activity_type, start_date, end_date')
      .eq('id', challengeId)
      .single();

    if (challengeError) {
      return NextResponse.json({ error: challengeError.message }, { status: 500 });
    }

    // Get all challenge participants
    const { data: challengeParticipants, error: participantsError } = await supabase
      .from('challenge_participants')
      .select(`
        user_id,
        profiles!inner(id, name, avatar_url)
      `)
      .eq('challenge_id', challengeId);

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 });
    }

    const participantIds = challengeParticipants.map(p => p.user_id);

    // Build activities query - filter by challenge date range and activity type
    let activitiesQuery = supabase
      .from('activities')
      .select(`
        id,
        user_id,
        name,
        type,
        value,
        unit,
        date,
        location,
        notes,
        distance,
        elapsed_time,
        average_speed,
        total_elevation_gain,
        created_at,
        profiles!inner(id, name, avatar_url)
      `)
      .in('user_id', participantIds)
      .gte('date', challenge.start_date)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by end date if challenge has ended
    if (challenge.end_date) {
      activitiesQuery = activitiesQuery.lte('date', challenge.end_date);
    }

    // Filter by challenge activity type if specified
    if (challenge.activity_type && challenge.activity_type !== 'overall') {
      activitiesQuery = activitiesQuery.eq('type', challenge.activity_type);
    }

    // Additional filter by activity type if specified in query params
    if (activityType) {
      activitiesQuery = activitiesQuery.eq('type', activityType);
    }

    const { data: activities, error: activitiesError } = await activitiesQuery;

    if (activitiesError) {
      return NextResponse.json({ error: activitiesError.message }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .in('user_id', participantIds)
      .gte('date', challenge.start_date);

    if (challenge.end_date) {
      countQuery = countQuery.lte('date', challenge.end_date);
    }

    if (challenge.activity_type && challenge.activity_type !== 'overall') {
      countQuery = countQuery.eq('type', challenge.activity_type);
    }

    if (activityType) {
      countQuery = countQuery.eq('type', activityType);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Enrich activities with participant profiles
    const enrichedActivities = activities.map(activity => {
      const participant = challengeParticipants.find(p => p.user_id === activity.user_id);
      return {
        ...activity,
        memberProfile: participant?.profiles || { name: 'Unknown', avatar_url: null }
      };
    });

    return NextResponse.json({
      activities: enrichedActivities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      challengeInfo: {
        activityType: challenge.activity_type,
        startDate: challenge.start_date,
        endDate: challenge.end_date
      }
    });

  } catch (error) {
    console.error('Error fetching challenge activities:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 