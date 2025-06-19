import { useCallback, useState, useEffect, useRef } from 'react';

interface MCPResponse<T = unknown> {
  data?: T;
  error?: string;
  loading: boolean;
}

interface MCPStreamOptions {
  onChunk?: (chunk: unknown) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useMCP() {
  const [response, setResponse] = useState<MCPResponse>({ loading: false });
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const executeTool = useCallback(async <T = unknown>(
    toolName: string,
    params: Record<string, unknown>,
    options?: MCPStreamOptions
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Create MCP JSON-RPC request
      const mcpRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params,
        },
        id: Date.now(),
      };

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mcpRequest),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || 'MCP tool execution failed');
      }

      const toolResult = result.result as T;
      setResponse({ data: toolResult, loading: false });
      return { data: toolResult, loading: false };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return { loading: false };
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse({ error: errorMessage, loading: false });
      return { error: errorMessage, loading: false };
    }
  }, []);

  const getResource = useCallback(async <T = unknown>(
    resourceName: string,
    id?: string,
    options?: MCPStreamOptions
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Create MCP JSON-RPC request for reading resource
      const resourceUri = id ? `${resourceName}://${id}` : `${resourceName}://list`;
      const mcpRequest = {
        jsonrpc: '2.0',
        method: 'resources/read',
        params: {
          uri: resourceUri,
        },
        id: Date.now(),
      };

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mcpRequest),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || 'MCP resource read failed');
      }

      const resourceResult = result.result as T;
      setResponse({ data: resourceResult, loading: false });
      return { data: resourceResult, loading: false };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return { loading: false };
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse({ error: errorMessage, loading: false });
      return { error: errorMessage, loading: false };
    }
  }, []);

  const updateResource = useCallback(async <T = unknown>(
    resourceName: string,
    id: string,
    data: Record<string, unknown>,
    options?: MCPStreamOptions
  ): Promise<MCPResponse<T>> => {
    // For updating resources, we'll use the update_profile tool directly
    if (resourceName === 'profiles') {
      return executeTool<T>('update_profile', { profileId: id, data });
    }

    // For other resources, return an error as they're read-only
    const errorMessage = `Resource ${resourceName} is read-only`;
    setResponse({ error: errorMessage, loading: false });
    return { error: errorMessage, loading: false };
  }, [executeTool]);

  return {
    executeTool,
    getResource,
    updateResource,
    response,
  };
} 