import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  
  // Redis configuration for rate limiting
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string().min(1),
  
  // MCP server configuration
  MCP_RATE_LIMIT: z.string().default('10'),
  MCP_RATE_WINDOW: z.string().default('10s'),
  MCP_MAX_TOKENS: z.string().default('4000'),
  MCP_TEMPERATURE: z.string().default('0.7'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// MCP server configuration
export const mcpConfig = {
  // Rate limiting
  rateLimit: {
    max: parseInt(env.MCP_RATE_LIMIT, 10),
    window: env.MCP_RATE_WINDOW,
  },
  
  // OpenAI settings
  openai: {
    maxTokens: parseInt(env.MCP_MAX_TOKENS, 10),
    temperature: parseFloat(env.MCP_TEMPERATURE),
  },
  
  // Resource limits
  limits: {
    maxActivitiesPerRequest: 50,
    maxProfileUpdatesPerMinute: 10,
    maxSearchResults: 20,
  },
  
  // Cache settings
  cache: {
    ttl: 60 * 5, // 5 minutes
    maxSize: 1000, // Maximum number of cached items
  },
  
  // Error handling
  errors: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: 'json',
  },
} as const;

// Type for the configuration
export type MCPConfig = typeof mcpConfig;

// Helper function to get configuration value
export function getMCPConfig<T extends keyof MCPConfig>(
  key: T
): MCPConfig[T] {
  return mcpConfig[key];
} 