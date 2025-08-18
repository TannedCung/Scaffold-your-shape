import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { normalizeActivityInput, isValidUnitForActivity } from '@/constants/activityNormalization';
import { updateLeaderboard } from '@/lib/leaderboard';
import { updateChallengeProgressFromActivity } from '@/lib/challengeLeaderboard';

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

    // Extract activity data and validate required fields
    const { userId, type, value, unit, ...otherFields } = body;

    if (!type || !value || !unit) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, value, and unit are required' 
      }, { status: 400 });
    }

    // Validate unit for activity type
    if (!isValidUnitForActivity(type, unit)) {
      return NextResponse.json({ 
        error: `Invalid unit '${unit}' for activity type '${type}'` 
      }, { status: 400 });
    }

    // Normalize activity input to standard units
    const normalized = normalizeActivityInput(type, parseFloat(value), unit);

    // Create activity object with normalized values
    const activityData = {
      ...otherFields,
      user_id: session.user.id,
      type: normalized.type,
      value: normalized.value,
      unit: normalized.unit
    };

    const { data: activity, error } = await supabase
      .from('activities')
      .insert([activityData])
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

    // Update challenge progress for any relevant challenges the user is participating in
    try {
      await updateChallengeProgressFromActivity(
        session.user.id,
        activity.type,
        activity.value,
        activity.unit
      );
    } catch (challengeError) {
      console.error('Error updating challenge progress from activity:', challengeError);
      // Don't fail the request if challenge update fails
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
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
    const { id, type, value, unit, ...otherUpdateData } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'Activity ID is required' 
      }, { status: 400 });
    }

    // Prepare update data
    let updateData = { ...otherUpdateData };

    // If type, value, or unit are being updated, normalize them
    if (type !== undefined || value !== undefined || unit !== undefined) {
      // Get current activity data if partial update
      const { data: currentActivity } = await supabase
        .from('activities')
        .select('type, value, unit')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();

      if (!currentActivity) {
        return NextResponse.json({ 
          error: 'Activity not found or not owned by user' 
        }, { status: 404 });
      }

      // Use current values as defaults for normalization
      const finalType = type !== undefined ? type : currentActivity.type;
      const finalValue = value !== undefined ? parseFloat(value) : currentActivity.value;
      const finalUnit = unit !== undefined ? unit : currentActivity.unit;

      // Validate unit for activity type
      if (!isValidUnitForActivity(finalType, finalUnit)) {
        return NextResponse.json({ 
          error: `Invalid unit '${finalUnit}' for activity type '${finalType}'` 
        }, { status: 400 });
      }

      // Normalize activity input to standard units
      const normalized = normalizeActivityInput(finalType, finalValue, finalUnit);

      // Add normalized values to update data
      updateData = {
        ...updateData,
        type: normalized.type,
        value: normalized.value,
        unit: normalized.unit
      };
    }

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

    if (!activity) {
      return NextResponse.json({ 
        error: 'Activity not found or not owned by user' 
      }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
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