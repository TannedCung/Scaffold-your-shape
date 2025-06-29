import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's club memberships with club details
    const { data: memberships, error: membershipsError } = await supabase
      .from('club_members')
      .select(`
        id,
        club_id,
        user_id,
        role,
        joined_at,
        clubs:club_id (
          id,
          name,
          description,
          image_url,
          background_image_url,
          member_count,
          is_private,
          created_at,
          updated_at,
          creator_id
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (membershipsError) {
      return NextResponse.json({ error: membershipsError.message }, { status: 500 });
    }

    // Transform the data to match ClubMember interface with club details
    const transformedMemberships = (memberships || []).map(membership => {
      const club = membership.clubs as unknown as {
        id: string;
        name: string;
        description: string;
        creator_id: string;
        image_url?: string;
        background_image_url?: string;
        member_count: number;
        is_private: boolean;
        created_at: string;
        updated_at: string;
      } | null;

      return {
        id: membership.id,
        clubId: membership.club_id,
        userId: membership.user_id,
        role: membership.role,
        joinedAt: membership.joined_at,
        club: club ? {
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
        } : undefined
      };
    });

    return NextResponse.json(transformedMemberships);
  } catch (error) {
    console.error('Error fetching user club memberships:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 