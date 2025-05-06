import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStravaActivities } from '@/services/stravaService';
import { supabase } from '@/lib/supabase';

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
    const activitiesToInsert = await Promise.all(stravaActivities.map(async (activity: {
      id: number;
      type: string;
      name: string;
      start_date: string;
      distance: number;
      location_city?: string;
      location_country?: string;
      description?: string;
    }) => ({
      user_id: session.user.id,
      strava_id: activity.id.toString(),
      type: await mapStravaType(activity.type),
      name: activity.name,
      date: new Date(activity.start_date).toISOString(),
      value: Math.round(activity.distance),  // Distance in meters
      unit: 'meters',
      location: activity.location_city || activity.location_country || null,
      notes: `Imported from Strava. ${activity.description || ''}`.trim(),
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

    return NextResponse.json({
      success: true,
      imported: activitiesToInsert.length,
      activities: insertedActivities,
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