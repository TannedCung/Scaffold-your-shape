import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id: string | number | null;
}

interface MCPResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: string | number | null;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// Available tools
const tools: MCPTool[] = [
  {
    name: 'search_activities',
    description: 'Search for activities based on query',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for activities'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 10
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_activity_details',
    description: 'Get detailed information about a specific activity',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'string',
          description: 'ID of the activity to retrieve'
        }
      },
      required: ['activityId']
    }
  },
  {
    name: 'get_profile',
    description: 'Get user profile information',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string',
          description: 'ID of the profile to retrieve'
        }
      },
      required: ['profileId']
    }
  },
  {
    name: 'update_profile',
    description: 'Update user profile information',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string',
          description: 'ID of the profile to update'
        },
        data: {
          type: 'object',
          description: 'Profile data to update',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            preferences: { type: 'object' }
          }
        }
      },
      required: ['profileId', 'data']
    }
  }
];

// Available resources
const resources: MCPResource[] = [
  {
    uri: 'activities://list',
    name: 'Activities',
    description: 'Collection of user activities',
    mimeType: 'application/json'
  },
  {
    uri: 'profiles://list',
    name: 'Profiles',
    description: 'User profile information',
    mimeType: 'application/json'
  }
];

async function handleToolCall(name: string, params: Record<string, unknown>): Promise<unknown> {
  console.log(`Executing tool: ${name} with params:`, params);
  
  try {
    switch (name) {
      case 'search_activities': {
        const { query, limit = 10 } = params;
        console.log(`Searching activities with query: ${query}, limit: ${limit}`);
        
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .or(`name.ilike.%${query}%, type.ilike.%${query}%, notes.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(Number(limit));

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Supabase error: ${error.message}`);
        }
        
        console.log(`Found ${data?.length || 0} activities`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case 'get_activity_details': {
        const { activityId } = params;
        console.log(`Getting activity details for ID: ${activityId}`);
        
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Supabase error: ${error.message}`);
        }
        
        console.log('Activity details retrieved successfully');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case 'get_profile': {
        const { profileId } = params;
        console.log(`Getting profile for ID: ${profileId}`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Supabase error: ${error.message}`);
        }
        
        console.log('Profile retrieved successfully');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case 'update_profile': {
        const { profileId, data: updateData } = params;
        console.log(`Updating profile ${profileId} with data:`, updateData);
        
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profileId)
          .select()
          .single();

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Supabase error: ${error.message}`);
        }
        
        console.log('Profile updated successfully');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      default:
        console.error(`Unknown tool: ${name}`);
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Tool execution failed for ${name}:`, error);
    throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleResourceRead(uri: string): Promise<unknown> {
  console.log(`Reading resource: ${uri}`);
  
  try {
    switch (uri) {
      case 'activities://list': {
        console.log('Querying activities table...');
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Supabase error: ${error.message}`);
        }
        
        console.log(`Retrieved ${data?.length || 0} activities`);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case 'profiles://list': {
        console.log('Querying profiles table...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(50);

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Supabase error: ${error.message}`);
        }
        
        console.log(`Retrieved ${data?.length || 0} profiles`);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      default:
        console.error(`Unknown resource: ${uri}`);
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    console.error(`Resource read failed for ${uri}:`, error);
    throw new Error(`Resource read failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
  console.log(`Handling MCP request: ${request.method}`, request.params);
  
  try {
    switch (request.method) {
      case 'initialize':
        console.log('Initializing MCP server');
        return {
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {}
            },
            serverInfo: {
              name: 'scaffold-your-shape-server',
              version: '1.0.0'
            }
          },
          id: request.id
        };

      case 'tools/list':
        console.log('Listing available tools');
        return {
          jsonrpc: '2.0',
          result: {
            tools
          },
          id: request.id
        };

      case 'tools/call': {
        const params = request.params as { name: string; arguments: Record<string, unknown> };
        if (!params || !params.name) {
          throw new Error('Missing tool name in tools/call request');
        }
        
        const toolResult = await handleToolCall(params.name, params.arguments || {});
        console.log('Tool call completed successfully');
        return {
          jsonrpc: '2.0',
          result: toolResult,
          id: request.id
        };
      }

      case 'resources/list':
        console.log('Listing available resources');
        return {
          jsonrpc: '2.0',
          result: {
            resources
          },
          id: request.id
        };

      case 'resources/read': {
        const params = request.params as { uri: string };
        if (!params || !params.uri) {
          throw new Error('Missing URI in resources/read request');
        }
        
        const resourceResult = await handleResourceRead(params.uri);
        console.log('Resource read completed successfully');
        return {
          jsonrpc: '2.0',
          result: resourceResult,
          id: request.id
        };
      }

      default:
        console.error(`Method not found: ${request.method}`);
        return {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          },
          id: request.id
        };
    }
  } catch (error) {
    console.error('MCP request handling error:', error);
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      },
      id: request.id
    };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('Received POST request to MCP endpoint');
  
  try {
    const body = await request.json() as MCPRequest;
    console.log('Request body:', body);
    
    if (body.jsonrpc !== '2.0') {
      console.error('Invalid JSON-RPC version:', body.jsonrpc);
      return NextResponse.json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request: JSON-RPC version must be 2.0'
        },
        id: null
      }, { status: 400 });
    }

    const response = await handleMCPRequest(body);
    console.log('Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('POST request error:', error);
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error',
        data: error instanceof Error ? error.message : 'Unknown error'
      },
      id: null
    }, { status: 400 });
  }
}

export async function GET(): Promise<NextResponse> {
  console.log('Received GET request to MCP endpoint');
  return NextResponse.json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed'
    },
    id: null
  }, { status: 405 });
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