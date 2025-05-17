import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getStravaActivities } from '@/services/stravaService';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { StravaActivity, StravaSegment, ActivityInsert } from '@/types/strava';
import { v4 as uuidv4 } from 'uuid';

// Define StravaActivity type
// interface StravaActivity {
//   id: number;
//   type: string;
//   name: string;
//   start_date: string;
//   distance: number;
//   location_city?: string;
//   location_country?: string;
//   description?: string;
//   moving_time?: number;
//   elapsed_time?: number;
//   total_elevation_gain?: number;
//   sport_type?: string;
//   start_latlng?: number[];
//   end_latlng?: number[];
//   average_speed?: number;
//   max_speed?: number;
//   average_cadence?: number;
//   average_temp?: number;
//   average_watts?: number;
//   kilojoules?: number;
//   max_watts?: number;
//   elev_high?: number;
//   elev_low?: number;
//   workout_type?: number;
//   map?: {
//     id: string;
//     polyline: string;
//     summary_polyline: string;
//   };
//   segment_efforts?: Array<{
//     id: number;
//     name: string;
//     elapsed_time: number;
//     moving_time: number;
//     start_date: string;
//     start_date_local: string;
//     distance: number;
//     average_cadence?: number;
//     average_watts?: number;
//     segment: Record<string, unknown>;
//   }>;
// }

// Define StravaSegment type
// interface StravaSegment {
//   id: number;
//   name: string;
//   elapsed_time: number;
//   moving_time: number;
//   start_date: string;
//   start_date_local: string;
//   distance: number;
//   average_cadence?: number;
//   average_watts?: number;
//   segment: Record<string, unknown>;
// };

export async function POST(request: NextRequest) {
  console.log("Strava import API called");
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("Unauthorized: No valid session");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`Processing request for user: ${session.user.id}`);

    // Get profile data including Strava tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: 'Unable to fetch profile', details: profileError },
        { status: 400 }
      );
    }

    if (!profile.strava_access_token) {
      console.log("No Strava access token found for user");
      return NextResponse.json(
        { error: 'Not connected to Strava' },
        { status: 400 }
      );
    }

    // Parse request for parameters
    let params;
    try {
      params = await request.json();
      console.log("Request parameters:", params);
    } catch (e) {
      console.error("Error parsing request JSON:", e);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Fetch Strava activities using the correct parameters
    console.log("Fetching activities from Strava with params:", {
      per_page: params.per_page || 30,
      page: params.page || 1,
      before: params.before,
      after: params.after,
    });

    let stravaActivities;
    try {
      stravaActivities = await getStravaActivities(profile, {
        per_page: params.per_page || 30,
        page: params.page || 1,
        before: params.before,
        after: params.after,
      });
      console.log(`Fetched ${stravaActivities.length} activities from Strava`);
    } catch (e) {
      console.error("Error fetching activities from Strava:", e);
      return NextResponse.json(
        { error: 'Failed to fetch activities from Strava', details: e instanceof Error ? e.message : String(e) },
        { status: 500 }
      );
    }

    // Create a safe number conversion function
    const safeNumber = (value: unknown): number | null => {
      if (value === null || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    // Map Strava activity to our schema
    const activitiesToInsert: ActivityInsert[] = stravaActivities.map((activity: StravaActivity) => {
      const id = activity.id ? activity.id.toString() : uuidv4();
      return {
        strava_id: activity.id.toString(),
        name: activity.name,
        distance: safeNumber(activity.distance),
        moving_time: safeNumber(activity.moving_time),
        elapsed_time: safeNumber(activity.elapsed_time),
        total_elevation_gain: safeNumber(activity.total_elevation_gain),
        activity_type: activity.type,
        start_date: activity.start_date,
        timezone: activity.timezone,
        start_latlng: activity.start_latlng,
        end_latlng: activity.end_latlng,
        achievement_count: activity.achievement_count,
        kudos_count: activity.kudos_count,
        comment_count: activity.comment_count,
        athlete_count: activity.athlete_count,
        photo_count: activity.photo_count,
        map: activity.map,
        trainer: activity.trainer,
        commute: activity.commute,
        manual: activity.manual,
        private: activity.private,
        flagged: activity.flagged,
        workout_type: activity.workout_type,
        upload_id: activity.upload_id?.toString(),
        average_speed: safeNumber(activity.average_speed),
        max_speed: safeNumber(activity.max_speed),
        has_heartrate: activity.has_heartrate,
        average_heartrate: safeNumber(activity.average_heartrate),
        max_heartrate: safeNumber(activity.max_heartrate),
        heartrate_opt_out: activity.heartrate_opt_out,
        display_hide_heartrate_option: activity.display_hide_heartrate_option,
        elev_high: safeNumber(activity.elev_high),
        elev_low: safeNumber(activity.elev_low),
        pr_count: activity.pr_count,
        total_photo_count: activity.total_photo_count,
        has_kudoed: activity.has_kudoed,
        suffer_score: activity.suffer_score,
        average_cadence: safeNumber(activity.average_cadence),
        average_watts: safeNumber(activity.average_watts),
        weighted_average_watts: safeNumber(activity.weighted_average_watts),
        kilojoules: safeNumber(activity.kilojoules),
        device_watts: activity.device_watts,
        has_power_meter: activity.has_power_meter,
        max_watts: safeNumber(activity.max_watts),
        user_id: session.user.id,
        strava_gear_id: activity.gear_id,
        description: activity.description,
        calories: activity.calories,
        perceived_exertion: activity.perceived_exertion,
        prefer_perceived_exertion: activity.prefer_perceived_exertion,
        segment_leaderboard_opt_out: activity.segment_leaderboard_opt_out,
        device_name: activity.device_name,
        type: activity.type,
        unit: 'meters',
        date: activity.start_date,
        value: safeNumber(activity.distance) || 0,
        notes: activity.description || null,
        source: 'Strava',
        sport_type: activity.sport_type,
        url: `https://www.strava.com/activities/${activity.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    // Skip empty imports
    if (activitiesToInsert.length === 0) {
      console.log("No activities to import");
      return NextResponse.json({ message: 'No activities to import' });
    }

    // First check for existing activities to avoid duplicates
    const stravaIds: string[] = activitiesToInsert.map((activity) => activity.id).filter(Boolean) as string[];
    console.log(`Checking for existing activities with ${stravaIds.length} Strava IDs`);
    
    let existingActivities: { strava_id: string }[] = [];
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('strava_id')
        .eq('user_id', session.user.id)
        .in('strava_id', stravaIds);
      if (error) throw error;
      existingActivities = (data ?? []) as { strava_id: string }[];
      console.log(`Found ${existingActivities.length} existing activities`);
    } catch (e) {
      console.error("Error checking for existing activities:", e);
      return NextResponse.json(
        { error: 'Failed to check for existing activities', details: e instanceof Error ? e.message : String(e) },
        { status: 500 }
      );
    }
    
    // Create a set of existing Strava IDs for quick lookup
    const existingStravaIds = new Set((existingActivities as { strava_id: string }[]).map(a => a.strava_id));
    
    // Filter out activities that already exist in the database
    const newActivities: ActivityInsert[] = activitiesToInsert.filter(
      (activity) => activity.strava_id && !existingStravaIds.has(activity.strava_id)
    );
    
    console.log(`${newActivities.length} new activities to insert, ${activitiesToInsert.length - newActivities.length} skipped as duplicates`);
    
    // No new activities to insert
    if (newActivities.length === 0) {
      return NextResponse.json({ 
        message: 'All activities already exist in the database',
        imported: 0,
        total: stravaActivities.length
      });
    }

    // Insert only new activities into database
    const { data: insertedActivities, error: insertError } = await supabase
      .from('activities')
      .insert(newActivities)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to import activities', details: insertError },
        { status: 500 }
      );
    }

    // Now process map and segmentation data for each activity
    const insertedActivitiesMap = new Map(insertedActivities.map(activity => [activity.id, activity.id]));

    // Process map data
    console.log("Processing map data for activities");
    try {
      const mapsToInsert = stravaActivities
        .filter((activity: StravaActivity) => 
          activity.map && 
          activity.map.id && 
          insertedActivitiesMap.has(activity.id.toString())
        )
        .map((activity: StravaActivity) => ({
          id: activity.map!.id,
          polyline: activity.map!.polyline || '',
          activity_id: insertedActivitiesMap.get(activity.id.toString()),
          summary_polyline: activity.map!.summary_polyline || ''
        }));

      console.log(`Found ${mapsToInsert.length} maps to insert`);
      
      if (mapsToInsert.length > 0) {
        const { error } = await supabase
          .from('maps')
          .upsert(mapsToInsert, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
          
        if (error) {
          console.error("Error inserting maps:", error);
          // Continue despite map errors
        } else {
          console.log(`Successfully inserted ${mapsToInsert.length} maps`);
        }
      }
    } catch (e) {
      console.error("Error processing map data:", e);
      // Continue despite map errors
    }

    // Process segmentation data
    console.log("Processing segment data for activities");
    const allSegments: Array<{
      id: string;
      activity_id: string;
      name: string;
      elapsed_time: number;
      moving_time: number;
      start_date: string;
      distance: number;
      average_cadence?: number | null;
      average_watts?: number | null;
      segment: Record<string, unknown>;
    }> = [];
    
    try {
      stravaActivities.forEach((activity: StravaActivity) => {
        const activityId = insertedActivitiesMap.get(activity.id.toString());
        
        if (activity.segment_efforts && activity.segment_efforts.length > 0 && activityId) {
          activity.segment_efforts.forEach((segment: StravaSegment) => {
            try {
              allSegments.push({
                id: segment.id.toString(),
                activity_id: activityId,
                name: segment.name,
                elapsed_time: safeNumber(segment.elapsed_time) || 0,
                moving_time: safeNumber(segment.moving_time) || 0,
                start_date: segment.start_date,
                distance: safeNumber(segment.distance) || 0,
                average_cadence: safeNumber(segment.average_cadence),
                average_watts: safeNumber(segment.average_watts),
                segment: segment.segment
              });
            } catch (segErr) {
              console.error("Error processing segment:", segErr, "Segment:", segment);
              // Continue with other segments
            }
          });
        }
      });

      console.log(`Found ${allSegments.length} segments to insert`);
      
      if (allSegments.length > 0) {
        const { error } = await supabase
          .from('segmentations')
          .upsert(allSegments, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
          
        if (error) {
          console.error("Error inserting segments:", error);
          // Continue despite segment errors
        } else {
          console.log(`Successfully inserted ${allSegments.length} segments`);
        }
      }
    } catch (e) {
      console.error("Error processing segment data:", e);
      // Continue despite segment errors
    }

    console.log("Import completed successfully");
    return NextResponse.json({
      success: true,
      imported: newActivities.length,
      skipped: activitiesToInsert.length - newActivities.length,
      total: stravaActivities.length,
      activities: insertedActivities,
      maps: allSegments.length > 0 ? allSegments.length : 0,
      segments: allSegments.length
    });
  } catch (error) {
    console.error("FATAL ERROR importing Strava activities:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import activities', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
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

function normalizeActivityForInsert(input: Partial<ActivityInsert>): ActivityInsert {
  // List all fields from ActivityInsert
  const fields: (keyof ActivityInsert)[] = [
    'achievement_count', 'activity_type', 'athlete_count', 'average_cadence', 'average_heartrate',
    'average_speed', 'average_temp', 'average_watts', 'calories', 'comment_count', 'commute',
    'created_at', 'date', 'description', 'device_name', 'device_watts', 'display_hide_heartrate_option',
    'distance', 'elapsed_time', 'elev_high', 'elev_low', 'end_latlng', 'flagged', 'has_heartrate',
    'has_kudoed', 'has_power_meter', 'heartrate_opt_out', 'kilojoules', 'kudos_count', 'location',
    'manual', 'map', 'max_heartrate', 'max_speed', 'max_watts', 'moving_time', 'name', 'notes',
    'perceived_exertion', 'photo_count', 'pr_count', 'prefer_perceived_exertion', 'private',
    'segment_leaderboard_opt_out', 'source', 'sport_type', 'start_date', 'start_latlng', 'strava_gear_id',
    'strava_id', 'suffer_score', 'timezone', 'total_elevation_gain', 'total_photo_count', 'trainer',
    'type', 'unit', 'updated_at', 'upload_id', 'url', 'user_id', 'value', 'weighted_average_watts',
    'workout_type'
  ];

  const output: Record<string, unknown> = {};
  for (const field of fields) {
    output[field] = field in input ? input[field] ?? null : null;
  }
  // Required fields
  output.id = input.id ?? uuidv4();
  output.name = input.name ?? '';
  output.type = input.type ?? '';
  output.unit = input.unit ?? '';
  output.date = input.date ?? '';
  output.user_id = input.user_id ?? '';
  output.value = input.value ?? 0;

  return output as ActivityInsert;
} 