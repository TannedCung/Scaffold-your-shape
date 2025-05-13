import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStravaActivities } from '@/services/stravaService';
import { supabase } from '@/lib/supabase';

// Define StravaActivity type
interface StravaActivity {
  id: number;
  type: string;
  name: string;
  start_date: string;
  distance: number;
  location_city?: string;
  location_country?: string;
  description?: string;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  sport_type?: string;
  start_latlng?: number[];
  end_latlng?: number[];
  average_speed?: number;
  max_speed?: number;
  average_cadence?: number;
  average_temp?: number;
  average_watts?: number;
  kilojoules?: number;
  max_watts?: number;
  elev_high?: number;
  elev_low?: number;
  workout_type?: number;
  map?: {
    id: string;
    polyline: string;
    summary_polyline: string;
  };
  segment_efforts?: Array<{
    id: number;
    name: string;
    elapsed_time: number;
    moving_time: number;
    start_date: string;
    start_date_local: string;
    distance: number;
    average_cadence?: number;
    average_watts?: number;
    segment: Record<string, unknown>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get profile data including Strava tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile.strava_access_token) {
      return NextResponse.json(
        { error: 'Not connected to Strava or unable to fetch profile' },
        { status: 400 }
      );
    }

    // Parse request for parameters
    const params = await request.json();
    
    // Fetch Strava activities
    const stravaActivities = await getStravaActivities(profile, {
      per_page: params.limit || 30,
      page: params.page || 1,
    });

    // Prepare activities for database insertion
    const activitiesToInsert = await Promise.all(stravaActivities.map(async (activity: StravaActivity) => ({
      user_id: session.user.id,
      strava_id: activity.id.toString(),
      type: await mapStravaType(activity.type),
      name: activity.name,
      date: new Date(activity.start_date).toISOString(),
      value: Math.round(activity.distance),  // Distance in meters
      unit: 'meters',
      location: activity.location_city || activity.location_country || null,
      notes: `Imported from Strava. ${activity.description || ''}`.trim(),
      source: 'Strava',
      url: `https://www.strava.com/activities/${activity.id}`,
      // Add the new fields
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain,
      sport_type: activity.sport_type,
      start_date: activity.start_date,
      start_latlng: activity.start_latlng,
      end_latlng: activity.end_latlng,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed,
      average_cadence: activity.average_cadence,
      average_temp: activity.average_temp,
      average_watts: activity.average_watts,
      kilojoules: activity.kilojoules,
      max_watts: activity.max_watts,
      elev_high: activity.elev_high,
      elev_low: activity.elev_low,
      workout_type: activity.workout_type,
      description: activity.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })));

    // Skip empty imports
    if (activitiesToInsert.length === 0) {
      return NextResponse.json({ message: 'No activities to import' });
    }

    // Insert activities into database
    const { data: insertedActivities, error: insertError } = await supabase
      .from('activities')
      .upsert(activitiesToInsert, { 
        onConflict: 'user_id,strava_id',
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to import activities', details: insertError },
        { status: 500 }
      );
    }

    // Now process map and segmentation data for each activity
    const insertedActivitiesMap = new Map(insertedActivities.map(activity => [activity.strava_id, activity.id]));

    // Process map data
    const mapsToInsert = stravaActivities
      .filter(activity => activity.map && activity.map.id) // Only activities with map data
      .map(activity => ({
        id: activity.map!.id,
        polyline: activity.map!.polyline,
        activity_id: insertedActivitiesMap.get(activity.id.toString()),
        summary_polyline: activity.map!.summary_polyline
      }));

    if (mapsToInsert.length > 0) {
      await supabase
        .from('maps')
        .upsert(mapsToInsert, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
    }

    // Process segmentation data
    const allSegments: Array<{
      id: string;
      activity_id: string;
      name: string;
      elapsed_time: number;
      moving_time: number;
      start_date: string;
      start_date_local: string;
      distance: number;
      average_cadence?: number;
      average_watts?: number;
      segment: Record<string, unknown>;
    }> = [];
    
    stravaActivities.forEach(activity => {
      const activityId = insertedActivitiesMap.get(activity.id.toString());
      
      if (activity.segment_efforts && activity.segment_efforts.length > 0 && activityId) {
        activity.segment_efforts.forEach(segment => {
          allSegments.push({
            id: segment.id.toString(),
            activity_id: activityId,
            name: segment.name,
            elapsed_time: segment.elapsed_time,
            moving_time: segment.moving_time,
            start_date: segment.start_date,
            start_date_local: segment.start_date_local,
            distance: segment.distance,
            average_cadence: segment.average_cadence,
            average_watts: segment.average_watts,
            segment: segment.segment
          });
        });
      }
    });

    if (allSegments.length > 0) {
      await supabase
        .from('segmentations')
        .upsert(allSegments, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
    }

    return NextResponse.json({
      success: true,
      imported: activitiesToInsert.length,
      activities: insertedActivities,
      maps: mapsToInsert.length,
      segments: allSegments.length
    });
  } catch (error) {
    console.error('Error importing Strava activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import activities' },
      { status: 500 }
    );
  }
}

// Map Strava activity types to our system's types
async function mapStravaType(stravaType: string): Promise<string> {
  const typeMap: Record<string, string> = {
    'Run': 'run',
    'Walk': 'walk',
    'Hike': 'hike',
    'Ride': 'cycle',
    'Swim': 'swim',
    'WeightTraining': 'workout',
    'Workout': 'workout',
    'Yoga': 'workout',
    'CrossFit': 'workout',
  };

  return typeMap[stravaType] || 'other';
} 