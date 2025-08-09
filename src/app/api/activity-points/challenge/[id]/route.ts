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

    const { id: challengeId } = await params;

    // Get challenge-specific conversion rates
    const { data: conversions, error } = await supabase
      .from('challenge_activity_point_conversion')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('activity_type', { ascending: true });

    if (error) {
      console.error('Error fetching challenge conversion rates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no challenge-specific rates exist, return default rates with challenge_id
    if (!conversions || conversions.length === 0) {
      const defaultRates = DEFAULT_ACTIVITY_POINT_CONVERSION.map(rate => ({
        ...rate,
        challenge_id: challengeId
      }));
      return NextResponse.json(defaultRates);
    }

    return NextResponse.json(conversions);
  } catch (error) {
    console.error('Error in challenge conversion rates API:', error);
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

    const { id: challengeId } = await params;
    const rates = await request.json();

    // Verify user is creator or admin of the challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('creator_id')
      .eq('id', challengeId)
      .single();

    if (!challenge || challenge.creator_id !== session.user.id) {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }

    // First, delete existing rates for this challenge
    const { error: deleteError } = await supabase
      .from('challenge_activity_point_conversion')
      .delete()
      .eq('challenge_id', challengeId);

    if (deleteError) {
      console.error('Error deleting existing rates:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Then insert new rates
    const ratesWithChallengeId = rates.map((rate: ActivityPointConversion) => ({
      ...rate,
      challenge_id: challengeId
    }));

    const { error: insertError } = await supabase
      .from('challenge_activity_point_conversion')
      .insert(ratesWithChallengeId);

    if (insertError) {
      console.error('Error inserting new rates:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating challenge conversion rates:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 