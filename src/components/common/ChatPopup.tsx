import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // Placeholder for service
import GroupIcon from '@mui/icons-material/Group'; // Placeholder for service
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Placeholder for service
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Chatbot icon

// Placeholder for a more complex message type
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Placeholder for service type
interface Service {
  icon: React.ReactElement;
  name: string;
  description: string;
}

const ChatPopup: React.FC = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]); // Placeholder for chat history
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Utility function to clean streaming content
  const cleanStreamingContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    let cleaned = rawContent;
    
    // Only remove specific streaming artifacts, preserve emojis, \n, apostrophes
    cleaned = cleaned
      // Remove SSE prefixes
      .replace(/^data:\s*/gi, '')
      .replace(/^event:\s*/gi, '')
      
      // Remove specific technical metadata patterns
      .replace(/"finish_reason":\s*(null|"[^"]*")/gi, '')
      .replace(/"metadata":\s*\{[^}]*\}/gi, '')
      .replace(/"llm_provider":\s*"[^"]*"/gi, '')
      .replace(/"confidence":\s*[\d.]+/gi, '')
      .replace(/"intent":\s*"[^"]*"/gi, '')
      .replace(/"extracted_info":\s*\{[^}]*\}/gi, '')
      
      // Remove OpenAI streaming format artifacts
      .replace(/"choices":\s*\[[^\]]*\]/gi, '')
      .replace(/"delta":\s*\{\}/gi, '')
      .replace(/"index":\s*\d+/gi, '')
      .replace(/"created":\s*\d+/gi, '')
      .replace(/"model":\s*"[^"]*"/gi, '')
      .replace(/"object":\s*"[^"]*"/gi, '')
      .replace(/"id":\s*"[^"]*"/gi, '')
      
      // Remove instruction tokens
      .replace(/^\[INST\]|\[\/INST\]/g, '')
      .replace(/^<\|.*?\|>/g, '')
      .replace(/^<s>|<\/s>/g, '')
      
      // Remove system prefixes
      .replace(/^(Assistant|AI|Bot|System):\s*/gi, '')
      .replace(/^Response:\s*/gi, '')
      
      // Clean up leftover JSON commas and brackets
      .replace(/,\s*}/g, '}')
      .replace(/{\s*,/g, '{')
      .replace(/,\s*,/g, ',')
      .replace(/^\s*[{}]+\s*$/g, '')
      .trim();
    
    // Remove surrounding quotes if entire content is quoted
    if (/^".*"$/.test(cleaned) && cleaned.length > 2) {
      const inner = cleaned.slice(1, -1);
      // Only remove quotes if there are no unescaped quotes inside
      if (!inner.includes('"') || inner.replace(/\\"/g, '').indexOf('"') === -1) {
        cleaned = inner.replace(/\\"/g, '"');
      }
    }
    
    // Remove only standalone technical terms
    const standaloneTechnical = /^(null|undefined|stop|finish_reason|metadata)$/i;
    if (standaloneTechnical.test(cleaned.trim())) {
      return '';
    }
    
    // Return cleaned content (preserves emojis, \n, apostrophes, etc.)
    return cleaned;
  };

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      // Initialize with a welcome message if chat is empty
      if (chatMessages.length === 0) {
        setChatMessages([
          {
            id: 'welcome',
            text: 'Hello! I\'m Pili, your AI fitness assistant. How can I help you with your fitness journey today?',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '' || isLoading) return;

    const newMessage: Message = {
      id: new Date().toISOString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    // Create a placeholder bot message for streaming
    const botMessageId = new Date().toISOString() + '-bot';
    const initialBotMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
    };
    setChatMessages((prevMessages) => [...prevMessages, initialBotMessage]);
    setStreamingMessageId(botMessageId);

    try {
      // Use proxy API route to communicate with Pili chatbot
      const response = await fetch('/api/assistant/pili', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ message: userMessage }),
        credentials: 'include', // Important for session auth
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response with Server-Sent Events
        console.log('Handling streaming response from Pili proxy');
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                console.log('Streaming completed');
                break;
              }
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6));
                    
                    if (data.type === 'chunk' && data.content) {
                      // Clean the content using our utility function
                      const cleanContent = cleanStreamingContent(data.content);
                      
                      // Debug logging to track content filtering
                      if (data.content !== cleanContent) {
                        console.log('Content filtered:', { 
                          original: data.content, 
                          cleaned: cleanContent 
                        });
                      }
                      
                      // Only add if content is meaningful
                      if (cleanContent) {
                        // Add spacing if we're appending to existing text and the content doesn't start with punctuation
                        if (accumulatedText && 
                            !cleanContent.match(/^[.,!?;:\s]/) && 
                            !accumulatedText.match(/[\s-]$/)) {
                          accumulatedText += ' ';
                        }
                        
                        accumulatedText += cleanContent;
                        
                        // Update the bot message with accumulated text
                        setChatMessages((prevMessages) => 
                          prevMessages.map((msg) => 
                            msg.id === botMessageId 
                              ? { ...msg, text: accumulatedText }
                              : msg
                          )
                        );
                      } else {
                        // Log when content is completely filtered out
                        console.log('Content completely filtered out:', data.content);
                      }
                    } else if (data.type === 'done') {
                      console.log('Streaming finished, final text:', accumulatedText);
                      break;
                    }
                  } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
        
        // If no text was accumulated, show an error
        if (!accumulatedText.trim()) {
          setChatMessages((prevMessages) => 
            prevMessages.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, text: 'I\'m having trouble generating a response. Please try again.' }
                : msg
            )
          );
        }
      } else {
        // Handle regular JSON response (fallback)
        const responseData = await response.json();
        console.log('Pili proxy JSON response:', responseData);
        
        if (responseData.reply) {
          // Update the placeholder bot message with the response
          setChatMessages((prevMessages) => 
            prevMessages.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, text: responseData.reply }
                : msg
            )
          );
        } else if (responseData.error) {
          throw new Error(responseData.error);
        } else {
          throw new Error('No reply received from AI assistant');
        }
      }
    } catch (error) {
      console.error('Failed to send message to Pili:', error);
      
      // Update the placeholder bot message with error text
      setChatMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === botMessageId 
            ? { 
                ...msg, 
                text: 'Sorry, I\'m having trouble connecting to my brain right now. Please try again in a moment or contact our support team if the issue persists.' 
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  // Placeholder services - replace with actual application services
  const services: Service[] = [
    { 
      icon: <FitnessCenterIcon sx={{ color: theme.palette.primary.main }} />,
      name: 'Personalized Workout Plans',
      description: 'Get AI-generated workout plans tailored to your fitness goals.'
    },
    { 
      icon: <GroupIcon sx={{ color: theme.palette.primary.main }} />,
      name: 'Community Clubs',
      description: 'Join or create fitness clubs to connect with like-minded individuals.'
    },
    { 
      icon: <EmojiEventsIcon sx={{ color: theme.palette.primary.main }} />,
      name: 'Fitness Challenges',
      description: 'Participate in challenges and compete with others to stay motivated.'
    },
  ];

  const contactInfo = {
    email: 'tannedcung@scaffoldyourshape.com',
    phone: '+1 (555) 123-4567',
    faqUrl: '/faq' // Example FAQ link
  };

  return (
    <>
      <Tooltip title="Chat with our AI Assistant" placement="left">
        <Box
          sx={{
            position: 'fixed',
            bottom: isMobile ? 70 : 30,
            right: isMobile ? 20 : 30,
          }}
        >
          <Badge
            badgeContent={!open && chatMessages.length > 1 ? '1' : 0}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.7,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              },
            }}
          >
            <Fab 
              color="primary"
              aria-label="chat with AI assistant"
              onClick={handleToggle}
              sx={{
                bgcolor: '#2da58e',
                '&:hover': {
                  bgcolor: '#22796a',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 4px 20px rgba(45, 165, 142, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(45, 165, 142, 0.3) 0%, transparent 70%)',
                  animation: !open ? 'chatbotPulse 3s ease-in-out infinite' : 'none',
                  zIndex: -1,
                },
                '@keyframes chatbotPulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  },
                  '50%': {
                    transform: 'scale(1.3)',
                    opacity: 0.3,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  },
                },
              }}
            >
              {open ? <CloseIcon /> : <SmartToyIcon />}
            </Fab>
          </Badge>
        </Box>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleToggle}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 400,
            height: isMobile ? '100%' : '80vh',
            maxHeight: isMobile ? '100%' : 700,
            position: 'fixed',
            bottom: isMobile ? 0 : 30,
            right: isMobile ? 0 : 30,
            m: 0, // Reset margin for fixed positioning
            borderTopLeftRadius: isMobile ? 0 : theme.shape.borderRadius,
            borderTopRightRadius: isMobile ? 0 : theme.shape.borderRadius,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f7faf9', // Light background for the chat window
          }
        }}
        TransitionProps={{ onEnter: () => { /* Optional: focus input */ } }}
      >
        <DialogTitle sx={{ bgcolor: '#2da58e', color: '#fff', p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#fff', color: '#2da58e', mr: 1.5}}>
            <SmartToyIcon />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Pili
          </Typography>
          <IconButton onClick={handleToggle} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ flexGrow: 1, p: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {chatMessages.map((msg) => (
              <Box 
                key={msg.id} 
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: msg.sender === 'user' ? '#2da58e' : '#e0f0ed',
                    color: msg.sender === 'user' ? '#fff' : theme.palette.text.primary,
                    borderRadius: msg.sender === 'user' ? '15px 15px 5px 15px' : '15px 15px 15px 5px',
                    maxWidth: '80%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
                    position: 'relative',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap', // Preserve newlines and wrap text
                      wordBreak: 'break-word' // Handle long words
                    }}
                  >
                    {msg.text}
                  </Typography>
                  
                  {/* Streaming indicator for bot messages */}
                  {msg.sender === 'bot' && streamingMessageId === msg.id && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#2da58e',
                        animation: 'streamingPulse 1s infinite ease-in-out',
                        '@keyframes streamingPulse': {
                          '0%': { opacity: 0.3, transform: 'scale(1)' },
                          '50%': { opacity: 1, transform: 'scale(1.2)' },
                          '100%': { opacity: 0.3, transform: 'scale(1)' }
                        }
                      }}
                    />
                  )}
                  
                  <Typography variant="caption" sx={{ display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left', fontSize: '0.65rem', opacity: 0.7, mt: 0.5 }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender === 'bot' && streamingMessageId === msg.id && (
                      <span style={{ marginLeft: '4px', fontStyle: 'italic' }}>• streaming</span>
                    )}
                  </Typography>
                </Paper>
              </Box>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: '#e0f0ed',
                    borderRadius: '15px 15px 15px 5px',
                    maxWidth: '80%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Box 
                        sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          bgcolor: '#2da58e',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '0s',
                          '@keyframes typing': {
                            '0%, 80%, 100%': { opacity: 0.3 },
                            '40%': { opacity: 1 }
                          }
                        }} 
                      />
                      <Box 
                        sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          bgcolor: '#2da58e',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '0.2s',
                          '@keyframes typing': {
                            '0%, 80%, 100%': { opacity: 0.3 },
                            '40%': { opacity: 1 }
                          }
                        }} 
                      />
                      <Box 
                        sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          bgcolor: '#2da58e',
                          animation: 'typing 1.4s infinite ease-in-out',
                          animationDelay: '0.4s',
                          '@keyframes typing': {
                            '0%, 80%, 100%': { opacity: 0.3 },
                            '40%': { opacity: 1 }
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                      Pili is thinking...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1.5, bgcolor: '#e0f0ed' }}>
          <TextField 
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            sx={{
              bgcolor: '#fff',
              borderRadius: theme.shape.borderRadius,
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.shape.borderRadius,
              }
            }}
          />
          <IconButton 
            color="primary"
            onClick={handleSendMessage} 
            disabled={!message.trim() || isLoading}
            sx={{
              ml: 1,
              bgcolor: '#2da58e',
              color: '#fff',
              '&:hover': {
                bgcolor: '#22796a',
              },
              '&.Mui-disabled': {
                bgcolor: theme.palette.action.disabledBackground,
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatPopup; 