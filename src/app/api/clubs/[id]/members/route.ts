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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if club exists and user has access (member or public club)
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, is_private')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // If private club, check if user is a member
    if (club.is_private) {
      const { data: membership } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', clubId)
        .eq('user_id', session.user.id)
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'Access denied to private club' }, { status: 403 });
      }
    }

    // Get club members with profile information
    const { data: members, error: membersError } = await supabase
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
      .range(offset, offset + limit - 1);

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    // Transform the data to match ClubMember interface
    const transformedMembers = (members || []).map(member => {
      const profile = member.profiles as unknown as {
        id: string;
        name: string;
        email: string;
        avatar_url?: string;
      } | null;

      return {
        id: member.id,
        clubId: member.club_id,
        userId: member.user_id,
        role: member.role,
        joinedAt: member.joined_at,
        profile: profile ? {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url
        } : undefined
      };
    });

    return NextResponse.json(transformedMembers);
  } catch (error) {
    console.error('Error fetching club members:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 