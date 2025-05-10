import { supabase } from '@/lib/supabase';
import { mapActivityDbToActivity, ActivityDb, Activity } from '@/types';

// Fetch activities (Read)
export async function fetchActivities(userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('id, user_id, type, name, date, value, unit, location, notes, strava_id, source, url, created_at, updated_at')
    .order('date', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ActivityDb[] | null)?.map(mapActivityDbToActivity) || [];
}

// Fetch a single activity by ID (Read)
export async function fetchActivityById(activityId: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from('activities')
    .select('id, user_id, type, name, date, value, unit, location, notes, strava_id, source, url, created_at, updated_at')
    .eq('id', activityId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data ? mapActivityDbToActivity(data as ActivityDb) : null;
}

// Create activity (Create)
export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updatedAt'> & { notes?: string, location?: string }): Promise<Activity> {
  const { data, error } = await supabase.from('activities').insert([
    {
      user_id: activity.userId,
      type: activity.type,
      name: activity.name,
      date: activity.date,
      value: activity.value,
      unit: activity.unit,
      location: activity.location,
      notes: activity.notes,
    }
  ]).select('id, user_id, type, name, date, value, unit, location, notes, strava_id, source, url, created_at, updated_at').single();
  if (error) throw error;
  return mapActivityDbToActivity(data as ActivityDb);
}

// Update activity (Update)
export async function updateActivity(activity: Activity & { notes?: string, location?: string }): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .update({
      type: activity.type,
      name: activity.name,
      date: activity.date,
      value: activity.value,
      unit: activity.unit,
      location: activity.location,
      notes: activity.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', activity.id)
    .select('id, user_id, type, name, date, value, unit, location, notes, strava_id, source, url, created_at, updated_at')
    .single();
  
  if (error) throw error;
  return mapActivityDbToActivity(data as ActivityDb);
}

// Delete activity (Remove)
export async function deleteActivity(activityId: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', activityId);
  if (error) throw error;
}

// Batch operations
export async function batchDeleteActivities(activityIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('activities')
    .delete()
    .in('id', activityIds);
  
  if (error) throw error;
}

// Analytics functions
export async function getActivityStats(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  recentStreak: number;
}> {
  // Get all activities for the user
  const { data, error } = await supabase
    .from('activities')
    .select('id, type, date')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  const activities = data || [];
  
  // Calculate total
  const total = activities.length;
  
  // Calculate by type
  const byType: Record<string, number> = {};
  activities.forEach(activity => {
    const type = activity.type;
    byType[type] = (byType[type] || 0) + 1;
  });
  
  // Calculate recent streak (consecutive days with at least one activity)
  let recentStreak = 0;
  if (activities.length > 0) {
    const datesWithActivity = new Set();
    activities.forEach(activity => {
      const date = new Date(activity.date).toISOString().split('T')[0];
      datesWithActivity.add(date);
    });
    
    const sortedDates = Array.from(datesWithActivity).sort().reverse();
    
    if (sortedDates.length > 0) {
      recentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i - 1]);
        const prevDate = new Date(sortedDates[i]);
        
        // Check if dates are consecutive
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          recentStreak++;
        } else {
          break;
        }
      }
    }
  }
  
  return {
    total,
    byType,
    recentStreak
  };
}
