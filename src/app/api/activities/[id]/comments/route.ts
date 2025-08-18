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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

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

    // Get comments for this activity
    const { data: comments, error } = await supabase
      .from('activity_comments')
      .select(`
        id,
        content,
        user_id,
        parent_comment_id,
        created_at,
        updated_at,
        profiles(id, name, avatar_url)
      `)
      .eq('activity_id', activityId)
      .is('parent_comment_id', null) // Only top-level comments for now
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments from database:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: error.message },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('activity_comments')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activityId)
      .is('parent_comment_id', null);

    if (countError) {
      console.error('Error fetching comment count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch comment count', details: countError.message },
        { status: 500 }
      );
    }

    // Handle case where no comments exist
    if (!comments || comments.length === 0) {
      return NextResponse.json({
        comments: [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });
    }

    return NextResponse.json({
      comments: comments.map(comment => {
        try {
          const profile = comment.profiles as { name?: string; avatar_url?: string } | null;
          return {
            id: comment.id,
            content: comment.content,
            user: {
              id: comment.user_id,
              name: profile?.name || 'Unknown User',
              avatar_url: profile?.avatar_url || null
            },
            created_at: comment.created_at,
            updated_at: comment.updated_at
          };
        } catch (mapError) {
          console.error('Error mapping comment:', mapError);
          return {
            id: comment.id,
            content: comment.content,
            user: {
              id: comment.user_id,
              name: 'Unknown User',
              avatar_url: null
            },
            created_at: comment.created_at,
            updated_at: comment.updated_at
          };
        }
      }),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /comments:', error);
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
    let content: string, parentCommentId: string | undefined;
    try {
      const body = await request.json();
      content = body.content;
      parentCommentId = body.parentCommentId;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: 'Comment too long (max 500 characters)' },
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

    // If replying to a comment, verify it exists
    if (parentCommentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('activity_comments')
        .select('id, parent_comment_id')
        .eq('id', parentCommentId)
        .eq('activity_id', activityId)
        .single();

      if (parentError || !parentComment) {
        console.error('Parent comment not found:', parentError?.message);
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      // Don't allow replies to replies (keep it flat for now)
      if (parentComment.parent_comment_id) {
        return NextResponse.json(
          { error: 'Cannot reply to a reply (maximum 1 level nesting)' },
          { status: 400 }
        );
      }
    }

    // Create comment
    const { data: newComment, error: insertError } = await supabase
      .from('activity_comments')
      .insert({
        activity_id: activityId,
        user_id: session.user.id,
        content: trimmedContent,
        parent_comment_id: parentCommentId || null
      })
      .select(`
        id,
        content,
        user_id,
        parent_comment_id,
        created_at,
        updated_at,
        profiles(id, name, avatar_url)
      `)
      .single();

    if (insertError) {
      console.error('Error creating comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create comment', details: insertError.message },
        { status: 500 }
      );
    }

    // Handle the response mapping safely
    try {
      const profile = newComment.profiles as { name?: string; avatar_url?: string } | null;
      return NextResponse.json({
        comment: {
          id: newComment.id,
          content: newComment.content,
          user: {
            id: newComment.user_id,
            name: profile?.name || 'Unknown User',
            avatar_url: profile?.avatar_url || null
          },
          created_at: newComment.created_at,
          updated_at: newComment.updated_at
        },
        message: 'Comment created successfully'
      });
    } catch (mappingError) {
      console.error('Error mapping comment response:', mappingError);
      return NextResponse.json({
        comment: {
          id: newComment.id,
          content: newComment.content,
          user: {
            id: newComment.user_id,
            name: 'Unknown User',
            avatar_url: null
          },
          created_at: newComment.created_at,
          updated_at: newComment.updated_at
        },
        message: 'Comment created successfully'
      });
    }

  } catch (error) {
    console.error('Unexpected error in POST /comments:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 



