import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentValue, notes } = body;

    if (currentValue === undefined || currentValue < 0) {
      return NextResponse.json(
        { error: 'Invalid current value' },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('id, current_value')
      .eq('challenge_id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (participantError) {
      if (participantError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not a participant in this challenge' }, { status: 404 });
      }
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    // Update progress
    const updateData: { current_value: number; last_activity_date: string; notes?: string } = {
      current_value: currentValue,
      last_activity_date: new Date().toISOString(),
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: updatedParticipant, error } = await supabase
      .from('challenge_participants')
      .update(updateData)
      .eq('challenge_id', params.id)
      .eq('user_id', session.user.id)
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 