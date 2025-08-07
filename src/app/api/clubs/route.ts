import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';
import { updateClubMemberCount } from '@/utils/clubMemberCount';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(clubs);
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
    const { name, description, isPrivate, imageUrl, backgroundImageUrl } = body;
    // Note: creatorId is ignored and taken from session for security

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({ 
        error: 'Name and description are required' 
      }, { status: 400 });
    }

    // Create the club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name,
        description,
        creator_id: session.user.id,
        is_private: isPrivate || false,
        image_url: imageUrl || null,
        background_image_url: backgroundImageUrl || null,
        member_count: 1, // Creator is the first member
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clubError) {
      console.error('Error creating club:', clubError);
      return NextResponse.json({ error: clubError.message }, { status: 500 });
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('club_members')
      .insert({
        club_id: club.id,
        user_id: session.user.id,
        role: 'admin',
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // Try to clean up the club if member creation fails
      await supabase.from('clubs').delete().eq('id', club.id);
      return NextResponse.json({ error: 'Failed to create club membership' }, { status: 500 });
    }

    // Update member count to ensure accuracy
    const { success, error: countError } = await updateClubMemberCount(club.id);
    if (!success) {
      console.error('Failed to update member count for new club:', countError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      data: {
        id: club.id,
        name: club.name,
        description: club.description,
        creatorId: club.creator_id,
        imageUrl: club.image_url,
        backgroundImageUrl: club.background_image_url,
        memberCount: club.member_count,
        isPrivate: club.is_private,
        created_at: club.created_at,
        updatedAt: club.updated_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/clubs:', error);
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
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('clubs')
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