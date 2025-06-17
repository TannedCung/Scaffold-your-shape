import { useCallback, useState, useEffect, useRef } from 'react';
import { MCPClient } from '@modelcontextprotocol/sdk';

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
  const eventSourceRef = useRef<EventSource | null>(null);
  const client = new MCPClient({
    baseUrl: '/api/mcp',
    transport: 'sse',
  });

  // Cleanup function for SSE connection
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const executeTool = useCallback(async <T = unknown>(
    toolName: string,
    params: Record<string, unknown>,
    options?: MCPStreamOptions
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });

    // If streaming is requested
    if (options?.onChunk) {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource
        const eventSource = new EventSource(
          `/api/mcp?tool=${toolName}&params=${encodeURIComponent(JSON.stringify(params))}`
        );
        eventSourceRef.current = eventSource;

        // Handle incoming chunks
        eventSource.onmessage = (event) => {
          try {
            const chunk = JSON.parse(event.data);
            options.onChunk?.(chunk);
          } catch (error) {
            options.onError?.(error instanceof Error ? error : new Error(String(error)));
          }
        };

        // Handle errors
        eventSource.onerror = () => {
          const error = new Error('EventSource failed');
          options.onError?.(error);
          eventSource.close();
          setResponse({ loading: false });
        };

        // Handle completion
        eventSource.addEventListener('complete', () => {
          options.onComplete?.();
          eventSource.close();
          setResponse({ loading: false });
        });

        return { loading: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setResponse({ error: errorMessage, loading: false });
        return { error: errorMessage, loading: false };
      }
    }

    // Handle non-streaming requests
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
    id?: string,
    options?: MCPStreamOptions
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });

    // If streaming is requested
    if (options?.onChunk) {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const eventSource = new EventSource(
          `/api/mcp?resource=${resourceName}${id ? `&id=${id}` : ''}`
        );
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const chunk = JSON.parse(event.data);
            options.onChunk?.(chunk);
          } catch (error) {
            options.onError?.(error instanceof Error ? error : new Error(String(error)));
          }
        };

        eventSource.onerror = () => {
          const error = new Error('EventSource failed');
          options.onError?.(error);
          eventSource.close();
          setResponse({ loading: false });
        };

        eventSource.addEventListener('complete', () => {
          options.onComplete?.();
          eventSource.close();
          setResponse({ loading: false });
        });

        return { loading: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setResponse({ error: errorMessage, loading: false });
        return { error: errorMessage, loading: false };
      }
    }

    // Handle non-streaming requests
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
    data: Record<string, unknown>,
    options?: MCPStreamOptions
  ): Promise<MCPResponse<T>> => {
    setResponse({ loading: true });

    // If streaming is requested
    if (options?.onChunk) {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const eventSource = new EventSource(
          `/api/mcp?resource=${resourceName}&id=${id}&data=${encodeURIComponent(JSON.stringify(data))}`
        );
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const chunk = JSON.parse(event.data);
            options.onChunk?.(chunk);
          } catch (error) {
            options.onError?.(error instanceof Error ? error : new Error(String(error)));
          }
        };

        eventSource.onerror = () => {
          const error = new Error('EventSource failed');
          options.onError?.(error);
          eventSource.close();
          setResponse({ loading: false });
        };

        eventSource.addEventListener('complete', () => {
          options.onComplete?.();
          eventSource.close();
          setResponse({ loading: false });
        });

        return { loading: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setResponse({ error: errorMessage, loading: false });
        return { error: errorMessage, loading: false };
      }
    }

    // Handle non-streaming requests
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