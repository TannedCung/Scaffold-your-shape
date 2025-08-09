import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DEFAULT_ACTIVITY_POINT_CONVERSION } from '@/constants/defaultActivityPointConversion';
import { ActivityPointConversion } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId } = await params;

    // Get club-specific conversion rates
    const { data: conversions, error } = await supabase
      .from('club_activity_point_conversion')
      .select('*')
      .eq('club_id', clubId)
      .order('activity_type', { ascending: true });

    if (error) {
      console.error('Error fetching club conversion rates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no club-specific rates exist, return default rates with club_id
    if (!conversions || conversions.length === 0) {
      const defaultRates = DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        club_id: clubId
      }));
      return NextResponse.json(defaultRates);
    }

    return NextResponse.json(conversions);
  } catch (error) {
    console.error('Error in club conversion rates API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId } = await params;
    const rates = await request.json();

    // Verify user is admin of the club
    const { data: membership } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', session.user.id)
      .single();

    const { data: club } = await supabase
      .from('clubs')
      .select('creator_id')
      .eq('id', clubId)
      .single();

    const isCreator = club?.creator_id === session.user.id;
    const isAdmin = membership?.role === 'admin';

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // First, delete existing rates for this club
    const { error: deleteError } = await supabase
      .from('club_activity_point_conversion')
      .delete()
      .eq('club_id', clubId);

    if (deleteError) {
      console.error('Error deleting existing rates:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Then insert new rates
    const ratesWithClubId = rates.map((rate: ActivityPointConversion) => ({
      ...rate,
      club_id: clubId
    }));

    const { error: insertError } = await supabase
      .from('club_activity_point_conversion')
      .insert(ratesWithClubId);

    if (insertError) {
      console.error('Error inserting new rates:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating club conversion rates:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 