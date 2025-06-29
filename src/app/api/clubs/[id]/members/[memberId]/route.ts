import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId, memberId } = await params;
    const userId = session.user.id;
    const { role } = await request.json();

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if current user is admin of the club
    const { data: userMembership, error: userError } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (userError || !userMembership || userMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update member roles' }, { status: 403 });
    }

    // Check if target member exists
    const { data: targetMember, error: targetError } = await supabase
      .from('club_members')
      .select('id, role')
      .eq('club_id', clubId)
      .eq('user_id', memberId)
      .single();

    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // If demoting from admin to member, check if there are other admins
    if (targetMember.role === 'admin' && role === 'member') {
      const { data: adminCount } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', clubId)
        .eq('role', 'admin');

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json({ 
          error: 'Cannot demote the only admin. Please promote another member to admin first.' 
        }, { status: 400 });
      }
    }

    // Update member role
    const { error: updateError } = await supabase
      .from('club_members')
      .update({ role })
      .eq('club_id', clubId)
      .eq('user_id', memberId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId, memberId } = await params;
    const userId = session.user.id;

    // Check if current user is admin or removing themselves
    const { data: userMembership, error: userError } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (userError || !userMembership) {
      return NextResponse.json({ error: 'Not a member of this club' }, { status: 403 });
    }

    const isAdmin = userMembership.role === 'admin';
    const isRemovingSelf = userId === memberId;

    if (!isAdmin && !isRemovingSelf) {
      return NextResponse.json({ error: 'Only admins can remove other members' }, { status: 403 });
    }

    // Check if target member exists
    const { data: targetMember, error: targetError } = await supabase
      .from('club_members')
      .select('id, role')
      .eq('club_id', clubId)
      .eq('user_id', memberId)
      .single();

    if (targetError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // If removing an admin, check if there are other admins
    if (targetMember.role === 'admin') {
      const { data: adminCount } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', clubId)
        .eq('role', 'admin');

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json({ 
          error: 'Cannot remove the only admin. Please promote another member to admin first.' 
        }, { status: 400 });
      }
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', memberId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update club member count
    const { error: updateError } = await supabase.rpc('decrement_club_member_count', {
      club_id: clubId
    });

    if (updateError) {
      console.error('Failed to update member count:', updateError);
      // Don't fail the request if count update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 