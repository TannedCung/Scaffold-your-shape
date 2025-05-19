import { 
  mapActivityDbToActivity, 
  ActivityDb, 
  Activity, 
  MapDb, 
  mapMapDbToMap, 
  SegmentationDb, 
  mapSegmentationDbToSegmentation 
} from '@/types';
import { activityApi } from '@/lib/api';

// Fetch activities (Read)
export async function fetchActivities(userId?: string): Promise<Activity[]> {
  try {
    const { data, error } = await activityApi.getAll();
    
    if (error) {
      throw error;
    }

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
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

// Fetch a single activity by ID (Read)
export async function fetchActivityById(id: string): Promise<Activity | null> {
  try {
    const { data, error } = await activityApi.getById(id);
    
    if (error) {
      throw new Error(error);
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching activity:', error);
    return null;
  }
}

// Create activity (Create)
export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updatedAt'> & { 
  notes?: string, 
  location?: string 
}): Promise<Activity> {
  try {
    const { data, error } = await activityApi.create(activity);
    
    if (error) {
      throw new Error(error);
    }

    return data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

// Update activity (Update)
export async function updateActivity(activity: Activity & { notes?: string, location?: string }): Promise<Activity> {
  try {
    const { data, error } = await activityApi.update(activity.id, activity);
    
    if (error) {
      throw new Error(error);
    }

    return data;
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
}

// Delete activity (Remove)
export async function deleteActivity(activityId: string): Promise<void> {
  try {
    const { error } = await activityApi.delete(activityId);
    
    if (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
}

// Batch operations
export async function batchDeleteActivities(activityIds: string[]): Promise<void> {
  try {
    const { error } = await activityApi.batchDelete(activityIds);
    
    if (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error('Error batch deleting activities:', error);
    throw error;
  }
}

// Analytics functions
export async function getActivityStats(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  recentStreak: number;
}> {
  try {
    const { data, error } = await activityApi.getStats(userId);
    
    if (error) {
      throw new Error(error);
    }

    return data;
  } catch (error) {
    console.error('Error getting activity stats:', error);
    throw error;
  }
}
