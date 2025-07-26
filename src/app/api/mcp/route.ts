import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';


// Define tool schemas for the allowed MCP tools only
const searchActivitiesSchema = z.object({
  query: z.string().optional().describe('Search query for activity name'),
  limit: z.number().optional().describe('Maximum number of results to return'),
  startDate: z.string().optional().describe('Start date filter (ISO string)'),
  endDate: z.string().optional().describe('End date filter (ISO string)'),
});

const getActivityDetailsSchema = z.object({
  activityId: z.string().describe('ID of the activity to retrieve'),
});

const createActivitySchema = z.object({
  userId: z.string().describe('ID of the user creating the activity'),
  name: z.string().describe('Name of the activity'),
  type: z.string().describe('Type of the activity'),
  value: z.number().describe('Value of the activity (e.g., distance, duration, repetitions)'),
  unit: z.string().describe('Unit of measurement'),
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

const searchClubsSchema = z.object({
  query: z.string().optional().describe('Search query for clubs'),
  limit: z.number().optional().describe('Maximum number of results to return'),
  isPrivate: z.boolean().optional().describe('Filter by private clubs only'),
});

const getClubDetailsSchema = z.object({
  clubId: z.string().describe('ID of the club to retrieve'),
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

// Tool implementations - only for allowed MCP tools
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

  get_user_stats: async ({ userId }: { userId: string }) => {
    // Get all activities for detailed analysis
    const { data: allActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (activitiesError) throw activitiesError;

    const activities = allActivities || [];
    const totalActivities = activities.length;

    // Calculate total distance (sum of all distance-based activities)
    const totalDistance = activities.reduce((sum, activity) => {
      if (['meters', 'kilometers', 'miles'].includes(activity.unit)) {
        let value = activity.value;
        if (activity.unit === 'kilometers') value *= 1000;
        else if (activity.unit === 'miles') value *= 1609.34;
        return sum + value;
      }
      return sum;
    }, 0);

    // Calculate total time (sum of all time-based activities in minutes)
    const totalTime = activities.reduce((sum, activity) => {
      if (['minutes', 'hours'].includes(activity.unit)) {
        let value = activity.value;
        if (activity.unit === 'hours') value *= 60;
        return sum + value;
      }
      return sum;
    }, 0);

    // Calculate total calories
    const totalCalories = activities.reduce((sum, activity) => {
      if (activity.unit === 'calories') {
        return sum + activity.value;
      }
      return sum;
    }, 0);

    // Calculate total reps
    const totalReps = activities.reduce((sum, activity) => {
      if (activity.unit === 'reps') {
        return sum + activity.value;
      }
      return sum;
    }, 0);

    // Activity type breakdown
    const activityTypeBreakdown = activities.reduce((breakdown, activity) => {
      breakdown[activity.type] = (breakdown[activity.type] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    // Unit breakdown
    const unitBreakdown = activities.reduce((breakdown, activity) => {
      breakdown[activity.unit] = (breakdown[activity.unit] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    // Recent activity trends
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activitiesLastWeek = activities.filter(a => new Date(a.date) >= lastWeek).length;
    const activitiesLastMonth = activities.filter(a => new Date(a.date) >= lastMonth).length;

    // Find most recent activity
    const mostRecentActivity = activities.length > 0 ? {
      name: activities[0].name,
      type: activities[0].type,
      date: activities[0].date,
      value: activities[0].value,
      unit: activities[0].unit
    } : null;

    // Calculate average values by unit
    const averagesByUnit = Object.keys(unitBreakdown).reduce((averages, unit) => {
      const activitiesWithUnit = activities.filter(a => a.unit === unit);
      const totalValue = activitiesWithUnit.reduce((sum, a) => sum + a.value, 0);
      averages[unit] = activitiesWithUnit.length > 0 ? totalValue / activitiesWithUnit.length : 0;
      return averages;
    }, {} as Record<string, number>);

    // Get challenge participation stats
    const { data: challengeParticipations, error: participationError } = await supabase
      .from('challenge_participants')
      .select('completed')
      .eq('user_id', userId);

    if (participationError) throw participationError;

    const totalChallengeParticipations = challengeParticipations?.length || 0;
    const completedChallenges = challengeParticipations?.filter(p => p.completed).length || 0;

    // Get club memberships count
    const { count: clubMemberships, error: clubError } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (clubError) throw clubError;

    // Calculate activity streak (consecutive days with activities)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (activities.length > 0) {
      const activityDates = [...new Set(activities.map(a => a.date.split('T')[0]))].sort().reverse();
      const today = now.toISOString().split('T')[0];
      
      // Check current streak
      const baseDate = new Date(today);
      for (let dayOffset = 0; dayOffset < activityDates.length; dayOffset++) {
        const checkDate = new Date(baseDate);
        checkDate.setDate(baseDate.getDate() - dayOffset);
        const actDate = checkDate.toISOString().split('T')[0];
        if (activityDates.includes(actDate)) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      for (let i = 0; i < activityDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(activityDates[i - 1]);
          const currDate = new Date(activityDates[i]);
          const diffDays = Math.abs((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      userId,
      summary: {
        totalActivities,
        totalDistance: Math.round(totalDistance), // in meters
        totalTime: Math.round(totalTime), // in minutes
        totalCalories: Math.round(totalCalories),
        totalReps: Math.round(totalReps),
      },
      breakdowns: {
        byActivityType: activityTypeBreakdown,
        byUnit: unitBreakdown,
        averagesByUnit: Object.keys(averagesByUnit).reduce((rounded, unit) => {
          rounded[unit] = Math.round(averagesByUnit[unit] * 100) / 100;
          return rounded;
        }, {} as Record<string, number>),
      },
      trends: {
        activitiesLastWeek,
        activitiesLastMonth,
        currentStreak,
        longestStreak,
      },
      challenges: {
        totalParticipations: totalChallengeParticipations,
        completed: completedChallenges,
        completionRate: totalChallengeParticipations > 0 ? 
          Math.round((completedChallenges / totalChallengeParticipations) * 100) : 0,
      },
      memberships: {
        totalClubs: clubMemberships || 0,
      },
      mostRecentActivity,
      generatedAt: new Date().toISOString(),
    };
  },
};

// Available tools definition - only allowed MCP tools with detailed descriptions
const availableTools = [
  {
    name: 'search_activities',
    description: 'Search for user activities by name with optional date filtering. Returns a list of matching activities with their details including type, value, unit, date, and location. Useful for finding specific workouts or activities within a date range. Sample request: {"query": "morning run", "limit": 5, "startDate": "2024-01-01T00:00:00Z", "endDate": "2024-01-31T23:59:59Z"}',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for activity names (e.g., "morning run", "yoga session", "bike ride")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
        startDate: {
          type: 'string',
          description: 'Start date filter in ISO string format (e.g., "2024-01-01T00:00:00Z")',
        },
        endDate: {
          type: 'string', 
          description: 'End date filter in ISO string format (e.g., "2024-01-31T23:59:59Z")',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_activity_details',
    description: 'Get detailed information about a specific activity including all stored data like type, value, unit, date, location, notes, and any Strava integration data if available. Sample request: {"activityId": "550e8400-e29b-41d4-a716-446655440000"}',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'string',
          description: 'Unique identifier of the activity to retrieve',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: 'create_activity',
    description: 'Create a new activity record in the system, ones those are already happened. Supports all activity types with proper units. Activity types must be one of: Run, TrailRun, Track, VirtualRun, Treadmill, Ride, MountainBikeRide, GravelRide, VirtualRide, EBikeRide, VeloMobile, Handcycle, Wheelchair, Swim, OpenWaterSwim, Walk, Hike, AlpineSki, BackcountrySki, NordicSki, Snowboard, IceSkate, Snowshoe, Kayaking, Rowing, StandUpPaddling, Surfing, Windsurf, Sail, WeightTraining, Workout, Crossfit, Elliptical, StairStepper, Pushup, Situp, PullUp, ParallelBars, Yoga, RockClimbing, Golf, InlineSkate, Other. Units must be one of: reps, meters, kilometers, miles, minutes, hours, calories. Sample request: {"userId": "user123", "name": "Morning 5K Run", "type": "Run", "value": 5, "unit": "kilometers", "date": "2024-01-15T07:00:00Z", "location": "Central Park", "notes": "Great weather today!"}',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user creating the activity',
        },
        name: {
          type: 'string',
          description: 'Descriptive name for the activity (e.g., "Morning 5K Run", "HIIT Workout")',
        },
        type: {
          type: 'string',
          enum: ['Run', 'TrailRun', 'Track', 'VirtualRun', 'Treadmill', 'Ride', 'MountainBikeRide', 'GravelRide', 'VirtualRide', 'EBikeRide', 'VeloMobile', 'Handcycle', 'Wheelchair', 'Swim', 'OpenWaterSwim', 'Walk', 'Hike', 'AlpineSki', 'BackcountrySki', 'NordicSki', 'Snowboard', 'IceSkate', 'Snowshoe', 'Kayaking', 'Rowing', 'StandUpPaddling', 'Surfing', 'Windsurf', 'Sail', 'WeightTraining', 'Workout', 'Crossfit', 'Elliptical', 'StairStepper', 'Pushup', 'Situp', 'PullUp', 'ParallelBars', 'Yoga', 'RockClimbing', 'Golf', 'InlineSkate', 'Other'],
          description: 'Type of activity - must be exactly one of the allowed values',
        },
        value: {
          type: 'number',
          description: 'Numeric value for the activity (distance, duration, repetitions, etc.)',
        },
        unit: {
          type: 'string',
          enum: ['reps', 'meters', 'kilometers', 'miles', 'minutes', 'hours', 'calories'],
          description: 'Unit of measurement - must be exactly one of the allowed values',
        },
        date: {
          type: 'string',
          description: 'Date and time of the activity in ISO string format (e.g., "2024-01-15T07:00:00Z")',
        },
        location: {
          type: 'string',
          description: 'Optional location where the activity took place (e.g., "Central Park", "Home Gym")',
        },
        notes: {
          type: 'string',
          description: 'Optional additional notes about the activity',
        },
      },
      required: ['userId', 'name', 'type', 'value', 'unit', 'date'],
    },
  },
  {
    name: 'search_challenges',
    description: 'Search for challenges by title or description with optional filtering by public/private status. Returns challenge details including title, description, target values, and dates. Sample request: {"query": "running", "limit": 5, "isPublic": true}',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for challenge titles or descriptions (e.g., "running", "weight loss", "monthly")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
        isPublic: {
          type: 'boolean',
          description: 'Filter by public challenges only (true) or include private challenges (false/undefined)',
        },
      },
    },
  },
  {
    name: 'get_challenge_details',
    description: 'Get comprehensive details about a specific challenge including all metadata, participants, and progress tracking information. Sample request: {"challengeId": "550e8400-e29b-41d4-a716-446655440001"}',
    inputSchema: {
      type: 'object',
      properties: {
        challengeId: {
          type: 'string',
          description: 'Unique identifier of the challenge to retrieve',
        },
      },
      required: ['challengeId'],
    },
  },
  {
    name: 'search_clubs',
    description: 'Search for clubs by name or description with optional filtering by private status. Returns club information including name, description, member count, and privacy settings. Sample request: {"query": "running club", "limit": 10, "isPrivate": false}',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for club names or descriptions (e.g., "running club", "fitness", "cycling")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
        isPrivate: {
          type: 'boolean',
          description: 'Filter by private clubs only (true) or public clubs (false/undefined)',
        },
      },
    },
  },
  {
    name: 'get_club_details',
    description: 'Get detailed information about a specific club including all metadata, member information, and club-specific settings. Sample request: {"clubId": "550e8400-e29b-41d4-a716-446655440002"}',
    inputSchema: {
      type: 'object',
      properties: {
        clubId: {
          type: 'string',
          description: 'Unique identifier of the club to retrieve',
        },
      },
      required: ['clubId'],
    },
  },
  {
    name: 'get_user_stats',
    description: 'Get comprehensive and detailed statistics for a user including: activity summaries (total count, distance in meters, time in minutes, calories, reps), activity breakdowns by type and unit, average values per unit, recent activity trends (last week/month), activity streaks (current and longest), challenge participation stats with completion rates, club memberships count, and most recent activity details. Provides a complete overview of user engagement, progress, and activity patterns. Sample request: {"userId": "user123"}',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'Unique identifier of the user to get comprehensive statistics for',
        },
      },
      required: ['userId'],
    },
  },
];

// Available resources definition - only for allowed MCP tools
const availableResources = [
  {
    uri: 'activities://list',
    name: 'Activities List',
    description: 'Collection of user activities with details',
    mimeType: 'application/json',
  },
  {
    uri: 'challenges://list',
    name: 'Challenges List',
    description: 'Collection of challenges available in the system',
    mimeType: 'application/json',
  },
  {
    uri: 'clubs://list',
    name: 'Clubs List',
    description: 'Collection of clubs available in the system',
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