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

    const { id: clubId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const activityType = searchParams.get('type');
    const offset = (page - 1) * limit;

    // First check if user is a member of the club
    const { data: membership, error: membershipError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', clubId)
      .eq('user_id', session.user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'You must be a member of this club to view activities' }, { status: 403 });
    }

    // Get all club members
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select(`
        user_id,
        profiles!inner(id, name, avatar_url)
      `)
      .eq('club_id', clubId);

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    const memberIds = clubMembers.map(m => m.user_id);

    // Build activities query
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
      .in('user_id', memberIds)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by activity type if specified
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
      .in('user_id', memberIds);

    if (activityType) {
      countQuery = countQuery.eq('type', activityType);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Enrich activities with member profiles
    const enrichedActivities = activities.map(activity => {
      const member = clubMembers.find(m => m.user_id === activity.user_id);
      return {
        ...activity,
        memberProfile: member?.profiles || { name: 'Unknown', avatar_url: null }
      };
    });

    return NextResponse.json({
      activities: enrichedActivities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching club member activities:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 