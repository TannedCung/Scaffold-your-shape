import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types';

export async function fetchActivities(userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false });
  if (userId) query = query.eq('userId', userId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
