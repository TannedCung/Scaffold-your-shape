import { 
  mapActivityDbToActivity, 
  ActivityDb, 
  Activity, 
  MapDb, 
  mapMapDbToMap, 
  SegmentationDb, 
  mapSegmentationDbToSegmentation,
  ActivityWithDetails
} from '@/types';
import { activityApi } from '@/lib/api';

// Search activities by query (new function)
export async function searchActivities(query: string, limit: number = 10): Promise<Activity[]> {
  try {
    const { data, error } = await activityApi.search(query, limit);
    
    if (error) {
      throw error;
    }

    return (data || []).map((item: ActivityWithDetails) => {
      const activity = mapActivityDbToActivity(item as unknown as ActivityDb);
      const details = item as ActivityWithDetails;
      
      // Handle map data if present
      if (details.maps && details.maps.length > 0) {
        activity.map = mapMapDbToMap(details.maps[0] as unknown as MapDb);
      }
      
      // Handle segmentation data if present
      if (details.segmentations && details.segmentations.length > 0) {
        activity.segmentEfforts = details.segmentations.map((seg) => 
          mapSegmentationDbToSegmentation(seg as unknown as SegmentationDb)
        );
      }
      
      return activity;
    });
  } catch (error) {
    console.error('Error searching activities:', error);
    return [];
  }
}

// Fetch activities with pagination (enhanced function)
export async function fetchActivities(userId?: string, limit?: number): Promise<Activity[]> {
  try {
    const { data, error } = await activityApi.getAll(limit);
    
    if (error) {
      throw error;
    }

    return (data || []).map((item: Activity) => {
      const activity = mapActivityDbToActivity(item as unknown as ActivityDb);
      const details = item as ActivityWithDetails;
      
      // Handle map data if present
      if (details.maps && details.maps.length > 0) {
        activity.map = mapMapDbToMap(details.maps[0] as unknown as MapDb);
      }
      
      // Handle segmentation data if present
      if (details.segmentations && details.segmentations.length > 0) {
        activity.segmentEfforts = details.segmentations.map((seg) => 
          mapSegmentationDbToSegmentation(seg as unknown as SegmentationDb)
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

    if (!data) {
      return null;
    }

    const activity = mapActivityDbToActivity(data as unknown as ActivityDb);
    const details = data as ActivityWithDetails;
    
    // Handle map data if present
    if (details.maps && details.maps.length > 0) {
      activity.map = mapMapDbToMap(details.maps[0] as unknown as MapDb);
    }
    
    // Handle segmentation data if present
    if (details.segmentations && details.segmentations.length > 0) {
      activity.segmentEfforts = details.segmentations.map((seg) => 
        mapSegmentationDbToSegmentation(seg as unknown as SegmentationDb)
      );
    }

    return activity;
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

    if (!data) {
      throw new Error('No data returned from create activity');
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

    if (!data) {
      throw new Error('No data returned from update activity');
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

    if (!data) {
      throw new Error('No data returned from get activity stats');
    }

    return data;
  } catch (error) {
    console.error('Error getting activity stats:', error);
    throw error;
  }
}
