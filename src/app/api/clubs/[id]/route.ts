import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubId = (await params).id;
    const userId = session.user.id;

    // Get club details
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Get user's membership status
    const { data: userMembership, error: membershipError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    // Get all members (limited for performance)
    const { data: membersList, error: membersError } = await supabase
      .from('club_members')
      .select(`
        id,
        club_id,
        user_id,
        role,
        joined_at,
        profiles:user_id (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('club_id', clubId)
      .order('joined_at', { ascending: true })
      .limit(100); // Limit to first 100 members

    if (membersError) {
      console.error('Error fetching members:', membersError);
    }

    // Transform club data to camelCase
    const transformedClub = {
      id: club.id,
      name: club.name,
      description: club.description,
      creatorId: club.creator_id,
      imageUrl: club.image_url,
      backgroundImageUrl: club.background_image_url,
      memberCount: club.member_count,
      isPrivate: club.is_private,
      created_at: club.created_at,
      updatedAt: club.updated_at,
      // Add membership information
      is_member: !!userMembership,
      user_membership: userMembership || null,
      members_list: membersList || []
    };

    return NextResponse.json({ data: transformedClub });
  } catch (error) {
    console.error('Error fetching club details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubId = (await params).id;
    const userId = session.user.id;
    const updateData = await request.json();

    // Check if user has permission to edit (admin or creator)
    const { data: membership, error: membershipError } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('creator_id')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const isCreator = club.creator_id === userId;
    const isAdmin = membership && membership.role === 'admin';

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Only club admins can edit club details' }, { status: 403 });
    }

    // Convert camelCase to snake_case for database
    const dbUpdateData: Record<string, unknown> = {};
    if (updateData.name) dbUpdateData.name = updateData.name;
    if (updateData.description) dbUpdateData.description = updateData.description;
    if (updateData.imageUrl !== undefined) dbUpdateData.image_url = updateData.imageUrl;
    if (updateData.backgroundImageUrl !== undefined) dbUpdateData.background_image_url = updateData.backgroundImageUrl;
    if (updateData.isPrivate !== undefined) dbUpdateData.is_private = updateData.isPrivate;

    dbUpdateData.updated_at = new Date().toISOString();

    // Update club
    const { data: updatedClub, error: updateError } = await supabase
      .from('clubs')
      .update(dbUpdateData)
      .eq('id', clubId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Transform response to camelCase
    const transformedClub = {
      id: updatedClub.id,
      name: updatedClub.name,
      description: updatedClub.description,
      creatorId: updatedClub.creator_id,
      imageUrl: updatedClub.image_url,
      backgroundImageUrl: updatedClub.background_image_url,
      memberCount: updatedClub.member_count,
      isPrivate: updatedClub.is_private,
      created_at: updatedClub.created_at,
      updatedAt: updatedClub.updated_at
    };

    return NextResponse.json({ data: transformedClub });
  } catch (error) {
    console.error('Error updating club:', error);
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubId = (await params).id;
    const userId = session.user.id;

    // Check if user is the creator
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('creator_id')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    if (club.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the club creator can delete the club' }, { status: 403 });
    }

    // Delete all club members first (due to foreign key constraints)
    const { error: deleteMembersError } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId);

    if (deleteMembersError) {
      return NextResponse.json({ error: deleteMembersError.message }, { status: 500 });
    }

    // Delete the club
    const { error: deleteError } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 