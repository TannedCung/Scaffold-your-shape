import { supabase } from '@/lib/supabase';
import { mapActivityDbToActivity, ActivityDb, Activity } from '@/types';

;

export async function fetchActivities(userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('id, user_id, type, name, date, value, unit, created_at, updated_at')
    .order('date', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ActivityDb[] | null)?.map(mapActivityDbToActivity) || [];

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
  return mapActivityDbToActivity(data as ActivityDb);
}

// Delete activity (Remove)
export async function deleteActivity(activityId: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', activityId);
  if (error) throw error;
}
