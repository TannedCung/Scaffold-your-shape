import { useState, useEffect } from 'react';
import { Exercise, ExerciseType } from '@/types';

interface UseExercisesParams {
  type?: ExerciseType | 'all';
  difficulty?: string;
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

interface UseExercisesResult {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExercises(params: UseExercisesParams = {}): UseExercisesResult {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      
      if (params.type && params.type !== 'all') {
        searchParams.append('type', params.type);
      }
      if (params.difficulty && params.difficulty !== 'all') {
        searchParams.append('difficulty', params.difficulty);
      }
      if (params.category) {
        searchParams.append('category', params.category);
      }
      if (params.featured) {
        searchParams.append('featured', 'true');
      }
      if (params.search) {
        searchParams.append('search', params.search);
      }
      if (params.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      if (params.offset) {
        searchParams.append('offset', params.offset.toString());
      }
      
      const response = await fetch(`/api/exercises?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      
      const data = await response.json();
      setExercises(data.exercises || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [
    params.type,
    params.difficulty,
    params.category,
    params.featured,
    params.search,
    params.limit,
    params.offset,
  ]);

  return {
    exercises,
    loading,
    error,
    refetch: fetchExercises,
  };
}

interface UseExerciseDetailParams {
  slug: string;
}

interface UseExerciseDetailResult {
  exercise: Exercise | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExerciseDetail(params: UseExerciseDetailParams): UseExerciseDetailResult {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/exercises/${params.slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Exercise not found');
        } else {
          throw new Error('Failed to fetch exercise');
        }
        return;
      }
      
      const data = await response.json();
      setExercise(data.exercise);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchExercise();
    }
  }, [params.slug]);

  return {
    exercise,
    loading,
    error,
    refetch: fetchExercise,
  };
}


