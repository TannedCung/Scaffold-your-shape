import { useCallback, useState } from 'react';
import { MCPClient } from '@modelcontextprotocol/sdk';

interface MCPResponse<T = unknown> {
  data?: T;
  error?: string;
  loading: boolean;
}

export function useMCP() {
  const [response, setResponse] = useState<MCPResponse>({ loading: false });
  const client = new MCPClient({
    baseUrl: '/api/mcp',
  });

  const executeTool = useCallback(async <T = unknown>(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });
    try {
      const result = await client.executeTool(toolName, params);
      setResponse({ data: result, loading: false });
      return { data: result, loading: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse({ error: errorMessage, loading: false });
      return { error: errorMessage, loading: false };
    }
  }, []);

  const getResource = useCallback(async <T = unknown>(
    resourceName: string,
    id?: string
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });
    try {
      const result = await client.getResource(resourceName, id);
      setResponse({ data: result, loading: false });
      return { data: result, loading: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse({ error: errorMessage, loading: false });
      return { error: errorMessage, loading: false };
    }
  }, []);

  const updateResource = useCallback(async <T = unknown>(
    resourceName: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });
    try {
      const result = await client.updateResource(resourceName, id, data);
      setResponse({ data: result, loading: false });
      return { data: result, loading: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse({ error: errorMessage, loading: false });
      return { error: errorMessage, loading: false };
    }
  }, []);

  return {
    executeTool,
    getResource,
    updateResource,
    response,
  };
} 