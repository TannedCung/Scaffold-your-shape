import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';


// Define tool schemas
const searchActivitiesSchema = z.object({
  query: z.string().optional().describe('Search query for activity name'),
  limit: z.number().optional().describe('Maximum number of results to return'),
  startDate: z.string().optional().describe('Start date filter (ISO string)'),
  endDate: z.string().optional().describe('End date filter (ISO string)'),
});

const getActivityDetailsSchema = z.object({
  activityId: z.string().describe('ID of the activity to retrieve'),
});

const getProfileSchema = z.object({
  profileId: z.string().describe('ID of the profile to retrieve'),
});

const updateProfileSchema = z.object({
  profileId: z.string().describe('ID of the profile to update'),
  data: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    preferences: z.record(z.unknown()).optional(),
  }).describe('Profile data to update'),
});

const createActivitySchema = z.object({
  userId: z.string().describe('ID of the user creating the activity'),
  name: z.string().describe('Name of the activity'),
  type: z.string().describe('Type of the activity (e.g., run, walk, swim)'),
  value: z.number().describe('Value of the activity (e.g., distance, duration)'),
  unit: z.string().describe('Unit of measurement (e.g., meters, minutes)'),
  date: z.string().describe('Date of the activity (ISO string)'),
  location: z.string().optional().describe('Location where activity took place'),
  notes: z.string().optional().describe('Additional notes about the activity'),
});

const searchChallengesSchema = z.object({
  query: z.string().optional().describe('Search query for challenges'),
  limit: z.number().optional().describe('Maximum number of results to return'),
  isPublic: z.boolean().optional().describe('Filter by public challenges only'),
});

const getChallengeDetailsSchema = z.object({
  challengeId: z.string().describe('ID of the challenge to retrieve'),
});

const createChallengeSchema = z.object({
  creatorId: z.string().describe('ID of the user creating the challenge'),
  title: z.string().describe('Title of the challenge'),
  description: z.string().describe('Description of the challenge'),
  activityType: z.string().optional().describe('Type of activity for the challenge'),
  targetValue: z.number().describe('Target value to achieve'),
  unit: z.string().describe('Unit of measurement'),
  startDate: z.string().describe('Start date of the challenge (ISO string)'),
  endDate: z.string().describe('End date of the challenge (ISO string)'),
  isPublic: z.boolean().describe('Whether the challenge is public'),
});

const searchClubsSchema = z.object({
  query: z.string().optional().describe('Search query for clubs'),
  limit: z.number().optional().describe('Maximum number of results to return'),
  isPrivate: z.boolean().optional().describe('Filter by private clubs only'),
});

const getClubDetailsSchema = z.object({
  clubId: z.string().describe('ID of the club to retrieve'),
});

const createClubSchema = z.object({
  creatorId: z.string().describe('ID of the user creating the club'),
  name: z.string().describe('Name of the club'),
  description: z.string().describe('Description of the club'),
  isPrivate: z.boolean().describe('Whether the club is private'),
  imageUrl: z.string().optional().describe('URL of the club image'),
});

const joinClubSchema = z.object({
  clubId: z.string().describe('ID of the club to join'),
  userId: z.string().describe('ID of the user joining the club'),
});

const getStravaActivitiesSchema = z.object({
  profileId: z.string().describe('ID of the profile to get Strava activities for'),
  page: z.number().optional().describe('Page number for pagination'),
  perPage: z.number().optional().describe('Number of activities per page'),
});

const importStravaActivitySchema = z.object({
  profileId: z.string().describe('ID of the profile to import activities for'),
  stravaActivityId: z.string().describe('Strava activity ID to import'),
});

const getActivityPointsSchema = z.object({
  activityId: z.string().describe('ID of the activity to calculate points for'),
  clubId: z.string().optional().describe('ID of the club to use for point calculation'),
  challengeId: z.string().optional().describe('ID of the challenge to use for point calculation'),
});

const getConversionRatesSchema = z.object({
  type: z.enum(['global', 'club', 'challenge']).describe('Type of conversion rates to get'),
  entityId: z.string().optional().describe('ID of the club or challenge (required for club/challenge types)'),
});

const updateConversionRatesSchema = z.object({
  type: z.enum(['global', 'club', 'challenge']).describe('Type of conversion rates to update'),
  entityId: z.string().optional().describe('ID of the club or challenge (required for club/challenge types)'),
  rates: z.array(z.object({
    activity_type: z.string(),
    unit: z.string(),
    rate: z.number(),
  })).describe('Array of conversion rates to update'),
});

const getUserStatsSchema = z.object({
  userId: z.string().describe('ID of the user to get stats for'),
});

// MCP Protocol types
interface MCPToolCallParams {
  name: string;
  arguments: Record<string, unknown>;
}

interface MCPResourceReadParams {
  uri: string;
}

interface MCPRequest {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: MCPToolCallParams | MCPResourceReadParams | Record<string, unknown>;
}

interface MCPToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface MCPResourceResult {
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
}

interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: {
    tools: Record<string, unknown>;
    resources: Record<string, unknown>;
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

interface MCPListResult {
  tools?: Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }>;
  resources?: Array<{
    uri: string;
    name: string;
    description: string;
    mimeType: string;
  }>;
}

interface MCPResponse {
  jsonrpc: string;
  id?: string | number;
  result?: MCPToolResult | MCPResourceResult | MCPInitializeResult | MCPListResult | { success: boolean };
  error?: {
    code: number;
    message: string;
    data?: string | Record<string, unknown>;
  };
}

// Tool implementations
const toolHandlers = {
  search_activities: async ({ query, limit = 10, startDate, endDate }: { 
    query?: string; limit?: number; startDate?: string; endDate?: string 
  }) => {
    let queryBuilder = supabase
      .from('activities')
      .select('*');

    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('date', startDate);
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('date', endDate);
    }

    const { data, error } = await queryBuilder
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  get_activity_details: async ({ activityId }: { activityId: string }) => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) throw error;
    return data;
  },

  create_activity: async ({ userId, name, type, value, unit, date, location, notes }: { 
    userId: string; name: string; type: string; value: number; unit: string; date: string; location?: string; notes?: string 
  }) => {
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        user_id: userId,
        name,
        type,
        value,
        unit,
        date,
        location,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  get_profile: async ({ profileId }: { profileId: string }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) throw error;
    return data;
  },

  update_profile: async ({ profileId, data }: { profileId: string; data: Record<string, unknown> }) => {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return updatedProfile;
  },

  search_challenges: async ({ query, limit = 10, isPublic }: { query?: string; limit?: number; isPublic?: boolean }) => {
    let queryBuilder = supabase
      .from('challenges')
      .select('*');

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (isPublic !== undefined) {
      queryBuilder = queryBuilder.eq('is_public', isPublic);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  get_challenge_details: async ({ challengeId }: { challengeId: string }) => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) throw error;
    return data;
  },

  create_challenge: async ({ creatorId, title, description, activityType, targetValue, unit, startDate, endDate, isPublic }: {
    creatorId: string; title: string; description: string; activityType?: string; targetValue: number; 
    unit: string; startDate: string; endDate: string; isPublic: boolean;
  }) => {
    const { data, error } = await supabase
      .from('challenges')
      .insert([{
        creator_id: creatorId,
        title,
        description,
        activity_type: activityType,
        target_value: targetValue,
        unit,
        start_date: startDate,
        end_date: endDate,
        is_public: isPublic,
        participant_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  search_clubs: async ({ query, limit = 10, isPrivate }: { query?: string; limit?: number; isPrivate?: boolean }) => {
    let queryBuilder = supabase
      .from('clubs')
      .select('*');

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (isPrivate !== undefined) {
      queryBuilder = queryBuilder.eq('is_private', isPrivate);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  get_club_details: async ({ clubId }: { clubId: string }) => {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (error) throw error;
    return data;
  },

  create_club: async ({ creatorId, name, description, isPrivate, imageUrl }: {
    creatorId: string; name: string; description: string; isPrivate: boolean; imageUrl?: string;
  }) => {
    const { data, error } = await supabase
      .from('clubs')
      .insert([{
        creator_id: creatorId,
        name,
        description,
        is_private: isPrivate,
        image_url: imageUrl,
        member_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('club_members')
      .insert([{
        club_id: data.id,
        user_id: creatorId,
        role: 'admin',
        joined_at: new Date().toISOString(),
      }]);

    if (memberError) throw memberError;
    return data;
  },

  join_club: async ({ clubId, userId }: { clubId: string; userId: string }) => {
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      throw new Error('User is already a member of this club');
    }

    // Add user as member
    const { data, error } = await supabase
      .from('club_members')
      .insert([{
        club_id: clubId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Update club member count
    const { error: updateError } = await supabase
      .rpc('increment_club_member_count', { club_id: clubId });

    if (updateError) throw updateError;

    return data;
  },

  get_strava_activities: async ({ profileId, page = 1, perPage = 30 }: { profileId: string; page?: number; perPage?: number }) => {
    // This would typically call the Strava API through your backend
    // For now, return activities from the database that have Strava IDs
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', profileId)
      .not('strava_id', 'is', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;
    return data;
  },

  import_strava_activity: async ({ profileId, stravaActivityId }: { profileId: string; stravaActivityId: string }) => {
    // This would typically call your Strava import API endpoint
    // For now, return a placeholder response
    return {
      message: `Would import Strava activity ${stravaActivityId} for profile ${profileId}`,
      profileId,
      stravaActivityId,
    };
  },

  get_activity_points: async ({ activityId, clubId, challengeId }: { activityId: string; clubId?: string; challengeId?: string }) => {
    // Get the activity
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    if (activityError) throw activityError;

    // Get conversion rates based on context
    let conversionRates;
    if (challengeId) {
      const { data, error } = await supabase
        .from('challenge_point_conversions')
        .select('*')
        .eq('challenge_id', challengeId);
      if (error) throw error;
      conversionRates = data;
    } else if (clubId) {
      const { data, error } = await supabase
        .from('club_point_conversions')
        .select('*')
        .eq('club_id', clubId);
      if (error) throw error;
      conversionRates = data;
    } else {
      const { data, error } = await supabase
        .from('activity_point_conversions')
        .select('*');
      if (error) throw error;
      conversionRates = data;
    }

    // Calculate points
    const rate = conversionRates?.find(r => r.activity_type === activity.type && r.unit === activity.unit);
    const points = rate ? activity.value * rate.rate : 0;

    return {
      activityId,
      activityType: activity.type,
      activityValue: activity.value,
      activityUnit: activity.unit,
      conversionRate: rate?.rate || 0,
      calculatedPoints: points,
      context: { clubId, challengeId },
    };
  },

  get_conversion_rates: async ({ type, entityId }: { type: 'global' | 'club' | 'challenge'; entityId?: string }) => {
    let tableName = 'activity_point_conversions';
    let whereClause = {};

    if (type === 'club') {
      if (!entityId) throw new Error('Club ID is required for club conversion rates');
      tableName = 'club_point_conversions';
      whereClause = { club_id: entityId };
    } else if (type === 'challenge') {
      if (!entityId) throw new Error('Challenge ID is required for challenge conversion rates');
      tableName = 'challenge_point_conversions';
      whereClause = { challenge_id: entityId };
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .match(whereClause);

    if (error) throw error;
    return data;
  },

  update_conversion_rates: async ({ type, entityId, rates }: { 
    type: 'global' | 'club' | 'challenge'; entityId?: string; rates: Array<{ activity_type: string; unit: string; rate: number }> 
  }) => {
    let tableName = 'activity_point_conversions';
    let additionalFields = {};

    if (type === 'club') {
      if (!entityId) throw new Error('Club ID is required for club conversion rates');
      tableName = 'club_point_conversions';
      additionalFields = { club_id: entityId };
    } else if (type === 'challenge') {
      if (!entityId) throw new Error('Challenge ID is required for challenge conversion rates');
      tableName = 'challenge_point_conversions';
      additionalFields = { challenge_id: entityId };
    }

    const ratesToInsert = rates.map(rate => ({
      ...rate,
      ...additionalFields,
    }));

    const { data, error } = await supabase
      .from(tableName)
      .upsert(ratesToInsert, { onConflict: type === 'global' ? 'activity_type,unit' : `${type}_id,activity_type,unit` })
      .select();

    if (error) throw error;
    return data;
  },

  get_user_stats: async ({ userId }: { userId: string }) => {
    // Get total activities
    const { count: totalActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (activitiesError) throw activitiesError;

         // Get total distance (sum of all distance-based activities)
     const { data: distanceData, error: distanceError } = await supabase
       .from('activities')
       .select('value, unit')
       .eq('user_id', userId)
       .in('unit', ['meters', 'kilometers']);

     if (distanceError) throw distanceError;

     const totalDistance = distanceData?.reduce((sum, activity) => {
       const value = activity.unit === 'kilometers' ? activity.value * 1000 : activity.value;
       return sum + value;
     }, 0) || 0;

    // Get completed challenges count
    const { count: completedChallenges, error: challengesError } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    if (challengesError) throw challengesError;

    return {
      userId,
      totalActivities: totalActivities || 0,
      totalDistance,
      totalChallengesCompleted: completedChallenges || 0,
    };
  },
};

// Available tools definition
const availableTools = [
  {
    name: 'search_activities',
    description: 'Search for activities based on name of the activity with optional date filtering',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for activities, for example: "run", "walk", "swim", "bike", "hike", "yoga", "pilates", "dance", "other"',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 10,
        },
        startDate: {
          type: 'string',
          description: 'Start date filter (ISO string format)',
        },
        endDate: {
          type: 'string', 
          description: 'End date filter (ISO string format)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_activity_details',
    description: 'Get detailed information about a specific activity',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'string',
          description: 'ID of the activity to retrieve',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: 'create_activity',
    description: 'Create a new activity',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user creating the activity',
        },
        name: {
          type: 'string',
          description: 'Name of the activity',
        },
        type: {
          type: 'string',
          description: 'Type of the activity (e.g., run, walk, swim)',
        },
        value: {
          type: 'number',
          description: 'Value of the activity (e.g., distance, duration)',
        },
        unit: {
          type: 'string',
          description: 'Unit of measurement (e.g., meters, minutes)',
        },
        date: {
          type: 'string',
          description: 'Date of the activity (ISO string)',
        },
        location: {
          type: 'string',
          description: 'Location where activity took place',
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the activity',
        },
      },
      required: ['userId', 'name', 'type', 'value', 'unit', 'date'],
    },
  },
  {
    name: 'get_profile',
    description: 'Get user profile information',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string',
          description: 'ID of the profile to retrieve',
        },
      },
      required: ['profileId'],
    },
  },
  {
    name: 'update_profile',
    description: 'Update user profile information',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string',
          description: 'ID of the profile to update',
        },
        data: {
          type: 'object',
          description: 'Profile data to update',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            preferences: { type: 'object' },
          },
        },
      },
      required: ['profileId', 'data'],
    },
  },
  {
    name: 'search_challenges',
    description: 'Search for challenges',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for challenges',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 10,
        },
        isPublic: {
          type: 'boolean',
          description: 'Filter by public challenges only',
        },
      },
    },
  },
  {
    name: 'get_challenge_details',
    description: 'Get detailed information about a specific challenge',
    inputSchema: {
      type: 'object',
      properties: {
        challengeId: {
          type: 'string',
          description: 'ID of the challenge to retrieve',
        },
      },
      required: ['challengeId'],
    },
  },
  {
    name: 'create_challenge',
    description: 'Create a new challenge',
    inputSchema: {
      type: 'object',
      properties: {
        creatorId: {
          type: 'string',
          description: 'ID of the user creating the challenge',
        },
        title: {
          type: 'string',
          description: 'Title of the challenge',
        },
        description: {
          type: 'string',
          description: 'Description of the challenge',
        },
        activityType: {
          type: 'string',
          description: 'Type of activity for the challenge',
        },
        targetValue: {
          type: 'number',
          description: 'Target value to achieve',
        },
        unit: {
          type: 'string',
          description: 'Unit of measurement',
        },
        startDate: {
          type: 'string',
          description: 'Start date of the challenge (ISO string)',
        },
        endDate: {
          type: 'string',
          description: 'End date of the challenge (ISO string)',
        },
        isPublic: {
          type: 'boolean',
          description: 'Whether the challenge is public',
        },
      },
      required: ['creatorId', 'title', 'description', 'targetValue', 'unit', 'startDate', 'endDate', 'isPublic'],
    },
  },
  {
    name: 'search_clubs',
    description: 'Search for clubs',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for clubs',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 10,
        },
        isPrivate: {
          type: 'boolean',
          description: 'Filter by private clubs only',
        },
      },
    },
  },
  {
    name: 'get_club_details',
    description: 'Get detailed information about a specific club',
    inputSchema: {
      type: 'object',
      properties: {
        clubId: {
          type: 'string',
          description: 'ID of the club to retrieve',
        },
      },
      required: ['clubId'],
    },
  },
  {
    name: 'create_club',
    description: 'Create a new club',
    inputSchema: {
      type: 'object',
      properties: {
        creatorId: {
          type: 'string',
          description: 'ID of the user creating the club',
        },
        name: {
          type: 'string',
          description: 'Name of the club',
        },
        description: {
          type: 'string',
          description: 'Description of the club',
        },
        isPrivate: {
          type: 'boolean',
          description: 'Whether the club is private',
        },
        imageUrl: {
          type: 'string',
          description: 'URL of the club image',
        },
      },
      required: ['creatorId', 'name', 'description', 'isPrivate'],
    },
  },
  {
    name: 'join_club',
    description: 'Join a club',
    inputSchema: {
      type: 'object',
      properties: {
        clubId: {
          type: 'string',
          description: 'ID of the club to join',
        },
        userId: {
          type: 'string',
          description: 'ID of the user joining the club',
        },
      },
      required: ['clubId', 'userId'],
    },
  },
  {
    name: 'get_strava_activities',
    description: 'Get Strava activities for a profile',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string',
          description: 'ID of the profile to get Strava activities for',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
          default: 1,
        },
        perPage: {
          type: 'number',
          description: 'Number of activities per page',
          default: 30,
        },
      },
      required: ['profileId'],
    },
  },
  {
    name: 'import_strava_activity',
    description: 'Import a specific Strava activity',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string',
          description: 'ID of the profile to import activities for',
        },
        stravaActivityId: {
          type: 'string',
          description: 'Strava activity ID to import',
        },
      },
      required: ['profileId', 'stravaActivityId'],
    },
  },
  {
    name: 'get_activity_points',
    description: 'Calculate points for an activity based on conversion rates',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'string',
          description: 'ID of the activity to calculate points for',
        },
        clubId: {
          type: 'string',
          description: 'ID of the club to use for point calculation',
        },
        challengeId: {
          type: 'string',
          description: 'ID of the challenge to use for point calculation',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: 'get_conversion_rates',
    description: 'Get activity point conversion rates',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['global', 'club', 'challenge'],
          description: 'Type of conversion rates to get',
        },
        entityId: {
          type: 'string',
          description: 'ID of the club or challenge (required for club/challenge types)',
        },
      },
      required: ['type'],
    },
  },
  {
    name: 'update_conversion_rates',
    description: 'Update activity point conversion rates',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['global', 'club', 'challenge'],
          description: 'Type of conversion rates to update',
        },
        entityId: {
          type: 'string',
          description: 'ID of the club or challenge (required for club/challenge types)',
        },
        rates: {
          type: 'array',
          description: 'Array of conversion rates to update',
          items: {
            type: 'object',
            properties: {
              activity_type: { type: 'string' },
              unit: { type: 'string' },
              rate: { type: 'number' },
            },
            required: ['activity_type', 'unit', 'rate'],
          },
        },
      },
      required: ['type', 'rates'],
    },
  },
  {
    name: 'get_user_stats',
    description: 'Get comprehensive statistics for a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user to get stats for',
        },
      },
      required: ['userId'],
    },
  },
];

// Available resources definition
const availableResources = [
  {
    uri: 'activities://list',
    name: 'Activities List',
    description: 'Collection of user activities',
    mimeType: 'application/json',
  },
  {
    uri: 'profiles://list',
    name: 'Profiles List', 
    description: 'User profile information',
    mimeType: 'application/json',
  },
  {
    uri: 'challenges://list',
    name: 'Challenges List',
    description: 'Collection of challenges',
    mimeType: 'application/json',
  },
  {
    uri: 'clubs://list',
    name: 'Clubs List',
    description: 'Collection of clubs',
    mimeType: 'application/json',
  },
];

// Handle MCP protocol methods
async function handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
  const { method, params, id } = request;

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {},
            },
            serverInfo: {
              name: 'scaffold-your-shape-mcp-server',
              version: '1.0.0',
            },
          },
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: availableTools,
          },
        };

             case 'tools/call':
         const toolCallParams = params as MCPToolCallParams;
         const { name: toolName, arguments: toolArgs } = toolCallParams;
         
         if (!toolHandlers[toolName as keyof typeof toolHandlers]) {
           return {
             jsonrpc: '2.0',
             id,
             error: {
               code: -32601,
               message: `Tool not found: ${toolName}`,
             },
           };
         }

         // Use a type-safe approach to call the tool handler
         const handler = toolHandlers[toolName as keyof typeof toolHandlers];
         const result = await handler(toolArgs as never);
         
         return {
           jsonrpc: '2.0',
           id,
           result: {
             content: [
               {
                 type: 'text',
                 text: JSON.stringify(result, null, 2),
               },
             ],
           },
         };

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resources: availableResources,
          },
        };

             case 'resources/read':
         const resourceParams = params as MCPResourceReadParams;
         const { uri } = resourceParams;
        
        if (uri === 'activities://list') {
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .limit(50);
          
          if (error) throw error;
          
          return {
            jsonrpc: '2.0',
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(data, null, 2),
                },
              ],
            },
          };
        }
        
                 if (uri === 'profiles://list') {
           const { data, error } = await supabase
             .from('profiles')
             .select('*')
             .limit(50);
           
           if (error) throw error;
           
           return {
             jsonrpc: '2.0',
             id,
             result: {
               contents: [
                 {
                   uri,
                   mimeType: 'application/json',
                   text: JSON.stringify(data, null, 2),
                 },
               ],
             },
           };
         }

         if (uri === 'challenges://list') {
           const { data, error } = await supabase
             .from('challenges')
             .select('*')
             .order('created_at', { ascending: false })
             .limit(50);
           
           if (error) throw error;
           
           return {
             jsonrpc: '2.0',
             id,
             result: {
               contents: [
                 {
                   uri,
                   mimeType: 'application/json',
                   text: JSON.stringify(data, null, 2),
                 },
               ],
             },
           };
         }

         if (uri === 'clubs://list') {
           const { data, error } = await supabase
             .from('clubs')
             .select('*')
             .order('created_at', { ascending: false })
             .limit(50);
           
           if (error) throw error;
           
           return {
             jsonrpc: '2.0',
             id,
             result: {
               contents: [
                 {
                   uri,
                   mimeType: 'application/json',
                   text: JSON.stringify(data, null, 2),
                 },
               ],
             },
           };
         }  

         return {
           jsonrpc: '2.0',
           id,
           error: {
             code: -32602,
             message: `Resource not found: ${uri}`,
           },
         };

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        };
    }
  } catch (error) {
    console.error('MCP Handler Error:', error);
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Handle MCP requests
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await handleMCPRequest(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('MCP Server Error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
          data: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 400 }
    );
  }
}

// Handle MCP health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    serverInfo: {
      name: 'scaffold-your-shape-mcp-server',
      version: '1.0.0',
    },
    capabilities: {
      tools: {},
      resources: {},
    },
  });
}

export async function DELETE(): Promise<NextResponse> {
  console.log('Received DELETE request to MCP endpoint');
  return NextResponse.json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed'
    },
    id: null
  }, { status: 405 });
} 