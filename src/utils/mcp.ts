import { z } from 'zod';
import { getMCPConfig } from '@/config/mcp';

// Type for MCP error response
export interface MCPError {
  code: string;
  message: string;
  details?: unknown;
}

// Type for MCP success response
export interface MCPSuccess<T = unknown> {
  data: T;
  metadata?: {
    cached?: boolean;
    processingTime?: number;
  };
}

// Type for MCP response
export type MCPResponse<T = unknown> = MCPSuccess<T> | { error: MCPError };

// Create MCP error
export function createMCPError(
  code: string,
  message: string,
  details?: unknown
): MCPError {
  return {
    code,
    message,
    details,
  };
}

// Create MCP success response
export function createMCPSuccess<T>(
  data: T,
  metadata?: MCPSuccess<T>['metadata']
): MCPSuccess<T> {
  return {
    data,
    metadata,
  };
}

// Validate MCP request
export function validateMCPRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: MCPError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: createMCPError(
          'VALIDATION_ERROR',
          'Invalid request data',
          (error as z.ZodError).errors
        ),
      };
    }
    return {
      success: false,
      error: createMCPError(
        'UNKNOWN_ERROR',
        'An unexpected error occurred'
      ),
    };
  }
}

// Cache key generator
export function generateCacheKey(
  resource: string,
  params: Record<string, unknown>
): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
    .join('|');
  
  return `mcp:${resource}:${sortedParams}`;
}

// Rate limit key generator
export function generateRateLimitKey(
  userId: string,
  action: string
): string {
  return `mcp:ratelimit:${userId}:${action}`;
}

// Check if response should be cached
export function shouldCacheResponse(
  method: string,
  resource: string
): boolean {
  const config = getMCPConfig('cache');
  return (
    method === 'GET' &&
    ['activities', 'profiles'].includes(resource) &&
    config.ttl > 0
  );
}

// Format processing time
export function formatProcessingTime(startTime: number): number {
  return Math.round(performance.now() - startTime);
}

// Sanitize error for response
export function sanitizeError(error: unknown): MCPError {
  if (error instanceof Error) {
    return createMCPError(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'production'
        ? 'An internal error occurred'
        : error.message
    );
  }
  
  if (typeof error === 'object' && error !== null) {
    return createMCPError(
      'INTERNAL_ERROR',
      'An internal error occurred',
      error
    );
  }
  
  return createMCPError(
    'INTERNAL_ERROR',
    'An internal error occurred'
  );
}

// Validate resource access
export function validateResourceAccess(
  userId: string,
  resourceId: string,
  resourceType: 'activities' | 'profiles'
): boolean {
  // Add your resource access validation logic here
  // For example, check if the user owns the resource
  return true;
}

// Format response metadata
export function formatResponseMetadata(
  startTime: number,
  cached: boolean
): MCPSuccess['metadata'] {
  return {
    processingTime: formatProcessingTime(startTime),
    cached,
  };
} 