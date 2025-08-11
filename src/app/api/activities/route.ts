import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';
import { updateLeaderboard } from '@/lib/leaderboard';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: activities, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(activities);
  } catch (error) {
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

    // Remove userId from body if it exists and ensure proper field mapping
    const { userId, ...cleanBody } = body;

    const { data: activity, error } = await supabase
      .from('activities')
      .insert([{ ...cleanBody, user_id: session.user.id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update leaderboards for all clubs the user is a member of
    try {
      const { data: clubMemberships } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', session.user.id);

      if (clubMemberships && clubMemberships.length > 0) {
        // Update leaderboard for each club asynchronously (don't await to avoid blocking)
        clubMemberships.forEach(async (membership) => {
          try {
            await updateLeaderboard(
              membership.club_id,
              session.user.id,
              activity.type,
              activity.value,
              activity.unit
            );
          } catch (leaderboardError) {
            console.error('Error updating leaderboard for club:', membership.club_id, leaderboardError);
          }
        });
      }
    } catch (leaderboardError) {
      console.error('Error fetching club memberships for leaderboard update:', leaderboardError);
      // Don't fail the request if leaderboard update fails
    }

    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    const { data: activity, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(activity);
  } catch (error) {
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
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

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