import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';
import { updateClubMemberCount } from '@/utils/clubMemberCount';

export async function POST(
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

    // Check if club exists
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, is_private')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member of this club' }, { status: 400 });
    }

    // For private clubs, you might want to add approval logic here
    // For now, we'll allow direct joining

    // Add user to club
    const { error: insertError } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update club member count by counting actual members
    const { success, error: countUpdateError } = await updateClubMemberCount(clubId);
    if (!success) {
      console.error('Failed to update member count:', countUpdateError);
      // Don't fail the request if count update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining club:', error);
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

    // Check if user is a member
    const { data: membership, error: membershipError } = await supabase
      .from('club_members')
      .select('id, role')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this club' }, { status: 400 });
    }

    // Check if user is the only admin
    if (membership.role === 'admin') {
      const { data: adminCount } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', clubId)
        .eq('role', 'admin');

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json({ 
          error: 'Cannot leave club as the only admin. Please promote another member to admin first.' 
        }, { status: 400 });
      }
    }

    // Remove user from club
    const { error: deleteError } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update club member count by counting actual members
    const { success, error: countUpdateError } = await updateClubMemberCount(clubId);
    if (!success) {
      console.error('Failed to update member count:', countUpdateError);
      // Don't fail the request if count update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving club:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 