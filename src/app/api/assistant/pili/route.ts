import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions);
    
    // Parse request body
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare request to Pili chatbot
    const piliEndpoint = process.env.PILI_API_ENDPOINT || 'http://0.0.0.0:8991/api/chat';
    const requestBody = {
      user_id: session?.user?.id || 'anonymous',
      message: message,
      stream: true // Enable streaming for real-time responses
    };

    console.log('Proxying request to Pili (streaming):', { endpoint: piliEndpoint, body: requestBody });

    // Make request to Pili chatbot
    const response = await fetch(piliEndpoint, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Pili API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to get response from AI assistant' },
        { status: 502 }
      );
    }

    // Check if response is streaming
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('text/plain') || contentType?.includes('text/event-stream')) {
      // Handle streaming response      
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      const stream = new ReadableStream({
        start(controller) {
          const reader = response.body?.getReader();
          
          function pump(): Promise<void> {
            return reader!.read().then(({ done, value }) => {
              if (done) {
                // Send final message to indicate streaming is complete
                const finalData = JSON.stringify({ 
                  type: 'done', 
                  timestamp: new Date().toISOString() 
                });
                controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                controller.close();
                return;
              }
              
              // Decode the chunk and send as SSE
              const chunk = decoder.decode(value);              
              // Filter and clean the content - be very conservative
              let cleanedContent = chunk;
              
              // Only remove specific formatting artifacts, preserve all content spaces
              cleanedContent = cleanedContent
                .replace(/^data:\s*/g, '') // Remove 'data:' prefix if present
                .replace(/\n\n$/g, ''); // Remove trailing double newlines only
              
              // Don't trim here - spaces might be part of the actual content!
              
              // Handle special cases
              if (cleanedContent === '[DONE]') {
                // Skip the [DONE] marker
                return pump();
              }
              
              // Try to parse as JSON first (in case Pili sends structured data)
              try {
                const parsedChunk = JSON.parse(cleanedContent);
                
                // Extract content from complex Pili response structure
                let extractedContent = '';
                
                // Handle OpenAI-style streaming format
                if (parsedChunk.choices && Array.isArray(parsedChunk.choices)) {
                  for (const choice of parsedChunk.choices) {
                    if (choice.delta && choice.delta.content) {
                      extractedContent += choice.delta.content;
                    } else if (choice.message && choice.message.content) {
                      extractedContent += choice.message.content;
                    }
                  }
                }
                
                // Handle custom Pili format
                if (!extractedContent && parsedChunk.content) {
                  extractedContent = parsedChunk.content;
                } else if (!extractedContent && parsedChunk.message) {
                  extractedContent = parsedChunk.message;
                } else if (!extractedContent && parsedChunk.text) {
                  extractedContent = parsedChunk.text;
                } else if (!extractedContent && parsedChunk.response) {
                  extractedContent = parsedChunk.response;
                }
                
                // Handle nested structure with metadata
                if (!extractedContent && parsedChunk.data) {
                  if (parsedChunk.data.content) {
                    extractedContent = parsedChunk.data.content;
                  } else if (parsedChunk.data.message) {
                    extractedContent = parsedChunk.data.message;
                  }
                }
                
                cleanedContent = extractedContent || '';
                
                // Clean up the extracted content - preserve spaces
                if (cleanedContent) {
                  cleanedContent = cleanedContent
                    .replace(/^"([^"]*)"$/, '$1') // Remove surrounding quotes only
                    .replace(/\\n/g, '\n') // Convert escaped newlines to actual newlines
                    .replace(/\\"/g, '"'); // Convert escaped quotes
                    // Don't trim - preserve leading/trailing spaces that might be meaningful
                }
                
              } catch {
                // If not JSON, treat as plain text content - preserve all spaces and characters
                // Only remove actual control characters that could break the response
                cleanedContent = cleanedContent
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove only dangerous control chars, keep \n (\x0A)
                  // Don't remove any other characters - preserve spaces, punctuation, unicode, etc.
              }
              
              // Only send non-empty, meaningful content
              if (cleanedContent && 
                  cleanedContent.length > 0 && 
                  cleanedContent !== '' &&
                  !cleanedContent.includes('finish_reason') &&
                  !cleanedContent.includes('metadata') &&
                  !cleanedContent.includes('llm_provider')) {                
                // Format as Server-Sent Events
                const sseData = JSON.stringify({ 
                  type: 'chunk', 
                  content: cleanedContent,
                  timestamp: new Date().toISOString()
                });
                controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
              } else {
              }
              
              return pump();
            });
          }
          
          return pump();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } else {
      // Handle JSON response (fallback)
      const responseData = await response.json();
      console.log('Pili JSON response:', responseData);

      // Handle different possible response formats from Pili
      let botReplyText = '';
      if (typeof responseData === 'string') {
        botReplyText = responseData;
      } else if (responseData.reply) {
        botReplyText = responseData.reply;
      } else if (responseData.response) {
        botReplyText = responseData.response;
      } else if (responseData.message) {
        botReplyText = responseData.message;
      } else if (responseData.content) {
        botReplyText = responseData.content;
      } else {
        botReplyText = 'I received your message but couldn\'t process it properly. Please try again.';
      }

      return NextResponse.json({
        reply: botReplyText,
        timestamp: new Date().toISOString(),
        status: 'success'
      });
    }

  } catch (error) {
    console.error('Error proxying to Pili:', error);
    return NextResponse.json(
      { error: 'Internal server error while connecting to AI assistant' },
      { status: 500 }
    );
  }
} 