import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types';

// Fetch activities (Read)
type ActivityRow = {
  id: string;
  user_id: string;
  type: string;
  name: string;
  date: string;
  value: number;
  unit: string;
  created_at: string;
  updated_at: string;
};

export async function fetchActivities(userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('id, user_id, type, name, date, value, unit, created_at, updated_at')
    .order('date', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ActivityRow[] | null || []).map((a) => ({
    id: a.id,
    userId: a.user_id,
    type: a.type,
    name: a.name,
    date: a.date,
    value: a.value,
    unit: a.unit,
    created_at: a.created_at,
    updatedAt: a.updated_at,
  }));
}

// Create activity (Create)
export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updatedAt'>): Promise<Activity> {
  const { data, error } = await supabase.from('activities').insert([
    {
      user_id: activity.userId,
      type: activity.type,
      name: activity.name,
      date: activity.date,
      value: activity.value,
      unit: activity.unit,
    }
  ]).select('id, user_id, type, name, date, value, unit, created_at, updated_at').single();
  if (error) throw error;
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    name: data.name,
    date: data.date,
    value: data.value,
    unit: data.unit,
    created_at: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Delete activity (Remove)
export async function deleteActivity(activityId: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', activityId);
  if (error) throw error;
}
