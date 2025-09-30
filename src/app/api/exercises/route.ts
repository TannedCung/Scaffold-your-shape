import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mapExerciseDbToExercise, ExerciseDb } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let query = supabase
      .from('exercises')
      .select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching exercises:', error);
      return NextResponse.json(
        { error: 'Failed to fetch exercises', details: error.message },
        { status: 500 }
      );
    }
    
    const exercises = (data as ExerciseDb[]).map(mapExerciseDbToExercise);
    
    return NextResponse.json({ exercises, count: exercises.length });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
