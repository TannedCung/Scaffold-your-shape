import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await params;

    // Validate activityId
    if (!activityId || typeof activityId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid activity ID provided' },
        { status: 400 }
      );
    }

    // Verify activity exists first
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('id')
      .eq('id', activityId)
      .single();

    if (activityError || !activity) {
      console.error('Activity not found:', activityError?.message);
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Get reactions for this activity
    const { data: reactions, error } = await supabase
      .from('activity_reactions')
      .select(`
        id,
        reaction_type,
        user_id,
        created_at,
        profiles(id, name, avatar_url)
      `)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reactions from database:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reactions', details: error.message },
        { status: 500 }
      );
    }

    // Handle case where no reactions exist
    if (!reactions || reactions.length === 0) {
      return NextResponse.json({
        reactions: {},
        total: 0
      });
    }

    // Group reactions by type with counts
    const reactionCounts = reactions.reduce((acc: any, reaction) => {
      try {
        const type = reaction.reaction_type;
        const profile = reaction.profiles as any;
        
        if (!acc[type]) {
          acc[type] = { count: 0, users: [] };
        }
        acc[type].count += 1;
        acc[type].users.push({
          id: reaction.user_id,
          name: profile?.name || 'Unknown User',
          avatar_url: profile?.avatar_url || null
        });
      } catch (reactionError) {
        console.error('Error processing reaction:', reactionError);
      }
      return acc;
    }, {});

    return NextResponse.json({
      reactions: reactionCounts,
      total: reactions.length
    });

  } catch (error) {
    console.error('Unexpected error in GET /reactions:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: activityId } = await params;

    // Validate activityId
    if (!activityId || typeof activityId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid activity ID provided' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let reactionType: string;
    try {
      const body = await request.json();
      reactionType = body.reactionType;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate reaction type
    const validReactionTypes = ['like', 'love', 'laugh', 'celebrate', 'fire', 'muscle'];
    if (!reactionType || !validReactionTypes.includes(reactionType)) {
      return NextResponse.json(
        { 
          error: 'Invalid reaction type',
          validTypes: validReactionTypes
        },
        { status: 400 }
      );
    }

    // Verify activity exists
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('id')
      .eq('id', activityId)
      .single();

    if (activityError || !activity) {
      console.error('Activity not found:', activityError?.message);
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if user already has this specific reaction
    const { data: existingReaction, error: checkError } = await supabase
      .from('activity_reactions')
      .select('*')
      .eq('activity_id', activityId)
      .eq('user_id', session.user.id)
      .eq('reaction_type', reactionType)
      .maybeSingle(); // Use maybeSingle to avoid error when no results

    if (checkError) {
      console.error('Error checking existing reaction:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing reaction', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingReaction) {
      // Remove reaction if it exists
      const { error: deleteError } = await supabase
        .from('activity_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove reaction', details: deleteError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        action: 'removed', 
        reactionType,
        message: 'Reaction removed successfully'
      });
    } else {
      // Remove any other reaction from this user first (one reaction per user per activity)
      const { error: removeOthersError } = await supabase
        .from('activity_reactions')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', session.user.id);

      if (removeOthersError) {
        console.error('Error removing other reactions:', removeOthersError);
        // Don't fail completely, just log the error
      }

      // Add new reaction
      const { error: insertError } = await supabase
        .from('activity_reactions')
        .insert({
          activity_id: activityId,
          user_id: session.user.id,
          reaction_type: reactionType
        });

      if (insertError) {
        console.error('Error adding reaction:', insertError);
        return NextResponse.json(
          { error: 'Failed to add reaction', details: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        action: 'added', 
        reactionType,
        message: 'Reaction added successfully'
      });
    }

  } catch (error) {
    console.error('Unexpected error in POST /reactions:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 