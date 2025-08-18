import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface BatchSocialRequest {
  activityIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let activityIds: string[];
    try {
      const body: BatchSocialRequest = await request.json();
      activityIds = body.activityIds;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate activity IDs
    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return NextResponse.json(
        { error: 'Activity IDs array is required' },
        { status: 400 }
      );
    }

    if (activityIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 activities per batch request' },
        { status: 400 }
      );
    }

    // Validate each activity ID
    for (const id of activityIds) {
      if (!id || typeof id !== 'string') {
        return NextResponse.json(
          { error: 'All activity IDs must be valid strings' },
          { status: 400 }
        );
      }
    }

    // Batch fetch all social data in parallel
    const [reactionsResult, commentsResult, sharesResult] = await Promise.all([
      // Fetch all reactions for these activities
      supabase
        .from('activity_reactions')
        .select(`
          activity_id,
          reaction_type,
          user_id,
          created_at,
          profiles(id, name, avatar_url)
        `)
        .in('activity_id', activityIds)
        .order('created_at', { ascending: false }),

      // Fetch comment counts for these activities
      supabase
        .from('activity_comments')
        .select('activity_id')
        .in('activity_id', activityIds)
        .is('parent_comment_id', null),

      // Fetch share counts for these activities
      supabase
        .from('activity_shares')
        .select('activity_id')
        .in('activity_id', activityIds)
    ]);

    // Handle errors
    if (reactionsResult.error) {
      console.error('Error fetching reactions:', reactionsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch reactions', details: reactionsResult.error.message },
        { status: 500 }
      );
    }

    if (commentsResult.error) {
      console.error('Error fetching comments:', commentsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: commentsResult.error.message },
        { status: 500 }
      );
    }

    if (sharesResult.error) {
      console.error('Error fetching shares:', sharesResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch shares', details: sharesResult.error.message },
        { status: 500 }
      );
    }

    // Process reactions data - group by activity and reaction type
    const reactionsData: { [activityId: string]: { [reactionType: string]: { count: number; users: Array<{ id: string; name: string; avatar_url: string | null }> } } } = {};
    
    reactionsResult.data?.forEach(reaction => {
      const activityId = reaction.activity_id;
      const reactionType = reaction.reaction_type;
      
      if (!reactionsData[activityId]) {
        reactionsData[activityId] = {};
      }
      
      if (!reactionsData[activityId][reactionType]) {
        reactionsData[activityId][reactionType] = { count: 0, users: [] };
      }
      
      const profile = reaction.profiles as { name?: string; avatar_url?: string } | null;
      reactionsData[activityId][reactionType].count += 1;
      reactionsData[activityId][reactionType].users.push({
        id: reaction.user_id,
        name: profile?.name || 'Unknown User',
        avatar_url: profile?.avatar_url || null
      });
    });

    // Process comments data - count by activity
    const commentsData: { [activityId: string]: number } = {};
    commentsResult.data?.forEach(comment => {
      const activityId = comment.activity_id;
      commentsData[activityId] = (commentsData[activityId] || 0) + 1;
    });

    // Process shares data - count by activity
    const sharesData: { [activityId: string]: number } = {};
    sharesResult.data?.forEach(share => {
      const activityId = share.activity_id;
      sharesData[activityId] = (sharesData[activityId] || 0) + 1;
    });

    // Build response for each activity
    const socialData: { [activityId: string]: { reactions: Record<string, { count: number; users: Array<{ id: string; name: string; avatar_url: string | null }> }>; totalReactions: number; commentsCount: number; sharesCount: number } } = {};
    
    activityIds.forEach(activityId => {
      const reactions = reactionsData[activityId] || {};
      const totalReactions = Object.values(reactions).reduce((sum: number, reaction: { count: number; users: Array<{ id: string; name: string; avatar_url: string | null }> }) => sum + reaction.count, 0);
      
      socialData[activityId] = {
        reactions,
        totalReactions,
        commentsCount: commentsData[activityId] || 0,
        sharesCount: sharesData[activityId] || 0
      };
    });

    return NextResponse.json({
      socialData,
      message: `Fetched social data for ${activityIds.length} activities`
    });

  } catch (error) {
    console.error('Unexpected error in batch social API:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 


