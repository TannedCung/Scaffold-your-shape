import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types';

export async function fetchActivities(userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('id, user_id, type, name, date, value, unit, created_at, updated_at')
    .order('date', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  // Optionally, map DB fields to Activity type fields if needed
  return (data || []).map((a: any) => ({
    id: a.id,
    userId: a.user_id,
    type: a.type,
    name: a.name,
    date: a.date,
    value: a.value,
    unit: a.unit,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }));
}
