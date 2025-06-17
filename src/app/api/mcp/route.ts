import { MCPServer, MCPTool, MCPResource } from '@modelcontextprotocol/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { headers } from 'next/headers';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define tool schemas
const searchActivitiesSchema = z.object({
  query: z.string().describe('Search query for activities'),
  limit: z.number().optional().describe('Maximum number of results to return'),
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

// Create MCP tools
const tools: MCPTool[] = [
  {
    name: 'search_activities',
    description: 'Search for activities based on query',
    schema: searchActivitiesSchema,
    handler: async ({ query, limit = 10 }: { query: string; limit?: number }) => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_activity_details',
    description: 'Get detailed information about a specific activity',
    schema: getActivityDetailsSchema,
    handler: async ({ activityId }: { activityId: string }) => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_profile',
    description: 'Get user profile information',
    schema: getProfileSchema,
    handler: async ({ profileId }: { profileId: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data;
    },
  },
  {
    name: 'update_profile',
    description: 'Update user profile information',
    schema: updateProfileSchema,
    handler: async ({ profileId, data }: { profileId: string; data: Record<string, unknown> }) => {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return updatedProfile;
    },
  },
];

// Create MCP resources
const resources: MCPResource[] = [
  {
    name: 'activities',
    description: 'Collection of user activities',
    schema: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      type: z.string(),
      duration: z.number(),
      distance: z.number().optional(),
      calories: z.number().optional(),
      created_at: z.string(),
      user_id: z.string(),
    }),
  },
  {
    name: 'profiles',
    description: 'User profile information',
    schema: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      preferences: z.record(z.unknown()),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  },
];

// Create MCP server instance
const mcpServer = new MCPServer({
  tools,
  resources,
  openai,
  supabase,
  transport: 'sse', // Enable SSE transport
});

// Handle MCP requests
export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const accept = headersList.get('accept') || '';

    // Check if client accepts SSE
    if (accept.includes('text/event-stream')) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const body = await req.json();
            const responseStream = await mcpServer.handleStreamingRequest(body);

            for await (const chunk of responseStream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle regular JSON requests
    const body = await req.json();
    const response = await mcpServer.handleRequest(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('MCP Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Handle MCP health check
export async function GET() {
  return NextResponse.json({ status: 'ok' });
} 