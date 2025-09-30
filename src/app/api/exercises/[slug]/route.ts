import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mapExerciseDbToExercise, ExerciseDb } from '@/types';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = params;
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Exercise not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching exercise:', error);
      return NextResponse.json(
        { error: 'Failed to fetch exercise', details: error.message },
        { status: 500 }
      );
    }
    
    // Try to increment view count (ignore errors if column doesn't exist)
    try {
      await supabase
        .from('exercises')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
    } catch (e) {
      // Ignore errors if view_count column doesn't exist
      console.log('Could not update view count:', e);
    }
    
    const exercise = mapExerciseDbToExercise(data as ExerciseDb);
    
    return NextResponse.json({ exercise });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
