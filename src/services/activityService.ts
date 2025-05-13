import { supabase } from '@/lib/supabase';
import { 
  mapActivityDbToActivity, 
  ActivityDb, 
  Activity, 
  MapDb, 
  mapMapDbToMap, 
  SegmentationDb, 
  mapSegmentationDbToSegmentation 
} from '@/types';

// Fetch activities (Read)
export async function fetchActivities(userId?: string): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select(`
      *,
      maps(*),
      segmentations(*)
    `)
    .order('date', { ascending: false });
  
  if (userId) query = query.eq('user_id', userId);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map(item => {
    const activity = mapActivityDbToActivity(item as ActivityDb);
    
    // Handle map data if present
    if (item.maps && item.maps.length > 0) {
      activity.map = mapMapDbToMap(item.maps[0] as MapDb);
    }
    
    // Handle segmentation data if present
    if (item.segmentations && item.segmentations.length > 0) {
      activity.segmentEfforts = item.segmentations.map((seg: SegmentationDb) => 
        mapSegmentationDbToSegmentation(seg)
      );
    }
    
    return activity;
  });
}

// Fetch a single activity by ID (Read)
export async function fetchActivityById(activityId: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      maps(*),
      segmentations(*)
    `)
    .eq('id', activityId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  if (!data) return null;
  
  const activity = mapActivityDbToActivity(data as ActivityDb);
  
  // Handle map data if present
  if (data.maps && data.maps.length > 0) {
    activity.map = mapMapDbToMap(data.maps[0] as MapDb);
  }
  
  // Handle segmentation data if present
  if (data.segmentations && data.segmentations.length > 0) {
    activity.segmentEfforts = data.segmentations.map((seg: SegmentationDb) => 
      mapSegmentationDbToSegmentation(seg)
    );
  }
  
  return activity;
}

// Create activity (Create)
export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updatedAt'> & { 
  notes?: string, 
  location?: string 
}): Promise<Activity> {
  // Convert to DB format
  const dbActivity = {
    user_id: activity.userId,
    type: activity.type,
    name: activity.name,
    date: activity.date,
    value: activity.value,
    unit: activity.unit,
    location: activity.location,
    notes: activity.notes,
    // Add new Strava fields
    distance: activity.distance,
    moving_time: activity.movingTime,
    elapsed_time: activity.elapsedTime,
    total_elevation_gain: activity.totalElevationGain,
    sport_type: activity.sportType,
    start_date: activity.startDate,
    start_latlng: activity.startLatlng,
    end_latlng: activity.endLatlng,
    average_speed: activity.averageSpeed,
    max_speed: activity.maxSpeed,
    average_cadence: activity.averageCadence,
    average_temp: activity.averageTemp,
    average_watts: activity.averageWatts,
    kilojoules: activity.kilojoules,
    max_watts: activity.maxWatts,
    elev_high: activity.elevHigh,
    elev_low: activity.elevLow,
    workout_type: activity.workoutType,
    description: activity.description,
  };

  // Insert the activity
  const { data, error } = await supabase
    .from('activities')
    .insert([dbActivity])
    .select()
    .single();

  if (error) throw error;
  
  const newActivity = mapActivityDbToActivity(data as ActivityDb);

  // If map data is provided, insert it
  if (activity.map) {
    const mapData = {
      id: activity.map.id,
      polyline: activity.map.polyline,
      activity_id: newActivity.id,
      summary_polyline: activity.map.summaryPolyline
    };

    await supabase.from('maps').insert([mapData]);
  }

  // If segment efforts are provided, insert them
  if (activity.segmentEfforts && activity.segmentEfforts.length > 0) {
    const segmentData = activity.segmentEfforts.map(segment => ({
      id: segment.id,
      activity_id: newActivity.id,
      name: segment.name,
      elapsed_time: segment.elapsedTime,
      moving_time: segment.movingTime,
      start_date: segment.startDate,
      start_date_local: segment.startDateLocal,
      distance: segment.distance,
      average_cadence: segment.averageCadence,
      average_watts: segment.averageWatts,
      segment: segment.segment
    }));

    await supabase.from('segmentations').insert(segmentData);
  }

  return newActivity;
}

// Update activity (Update)
export async function updateActivity(activity: Activity & { notes?: string, location?: string }): Promise<Activity> {
  // Convert to DB format
  const dbActivity = {
    type: activity.type,
    name: activity.name,
    date: activity.date,
    value: activity.value,
    unit: activity.unit,
    location: activity.location,
    notes: activity.notes,
    updated_at: new Date().toISOString(),
    // Add new Strava fields
    distance: activity.distance,
    moving_time: activity.movingTime,
    elapsed_time: activity.elapsedTime,
    total_elevation_gain: activity.totalElevationGain,
    sport_type: activity.sportType,
    start_date: activity.startDate,
    start_latlng: activity.startLatlng,
    end_latlng: activity.endLatlng,
    average_speed: activity.averageSpeed,
    max_speed: activity.maxSpeed,
    average_cadence: activity.averageCadence,
    average_temp: activity.averageTemp,
    average_watts: activity.averageWatts,
    kilojoules: activity.kilojoules,
    max_watts: activity.maxWatts,
    elev_high: activity.elevHigh,
    elev_low: activity.elevLow,
    workout_type: activity.workoutType,
    description: activity.description,
  };

  // Update the activity
  const { data, error } = await supabase
    .from('activities')
    .update(dbActivity)
    .eq('id', activity.id)
    .select()
    .single();
  
  if (error) throw error;
  
  const updatedActivity = mapActivityDbToActivity(data as ActivityDb);

  // If map data is provided, upsert it
  if (activity.map) {
    const mapData = {
      id: activity.map.id,
      polyline: activity.map.polyline,
      activity_id: updatedActivity.id,
      summary_polyline: activity.map.summaryPolyline
    };

    await supabase
      .from('maps')
      .upsert([mapData], { onConflict: 'id' });
  }

  // If segment efforts are provided, handle them
  if (activity.segmentEfforts && activity.segmentEfforts.length > 0) {
    // First delete existing segmentations for this activity
    await supabase
      .from('segmentations')
      .delete()
      .eq('activity_id', activity.id);

    // Then insert the new ones
    const segmentData = activity.segmentEfforts.map(segment => ({
      id: segment.id,
      activity_id: updatedActivity.id,
      name: segment.name,
      elapsed_time: segment.elapsedTime,
      moving_time: segment.movingTime,
      start_date: segment.startDate,
      start_date_local: segment.startDateLocal,
      distance: segment.distance,
      average_cadence: segment.averageCadence,
      average_watts: segment.averageWatts,
      segment: segment.segment
    }));

    await supabase.from('segmentations').insert(segmentData);
  }

  return updatedActivity;
}

// Delete activity (Remove)
export async function deleteActivity(activityId: string): Promise<void> {
  // Maps and segmentations will be automatically deleted due to CASCADE
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
