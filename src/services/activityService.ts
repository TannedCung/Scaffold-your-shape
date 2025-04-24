import { supabase } from '@/lib/supabase';

// Activity type matches OutdoorActivity in types/index.ts
export interface Activity {
  id: string;
  userId: string;
  type: string;
  distance: number;
  duration: number;
  date: string;
  location?: string;
  notes?: string;
}

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
