import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
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
  Popover,
  Grid,
  ButtonBase,
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
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

// Enhanced message type
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Service type
interface Service {
  icon: React.ReactElement;
  name: string;
  description: string;
}

// Emoji categories
interface EmojiCategory {
  name: string;
  emojis: string[];
}

// Common emoji data
const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
  },
  {
    name: 'Fitness',
    emojis: ['💪', '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️', '🏋️‍♂️', '🏋️‍♀️', '🤸‍♂️', '🤸‍♀️', '🧘‍♂️', '🧘‍♀️', '🏊‍♂️', '🏊‍♀️', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊', '🏆', '🥇', '🥈', '🥉', '🎯', '⛹️‍♂️', '⛹️‍♀️']
  },
  {
    name: 'Health',
    emojis: ['❤️', '💚', '💙', '💜', '🧡', '💛', '🤍', '🖤', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🩺', '💊', '🏥', '🧬', '🔬', '⚗️', '🦠', '💉', '🩹', '🌡️']
  },
  {
    name: 'Food',
    emojis: ['🍎', '🍌', '🍊', '🍇', '🫐', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥', '🥑', '🍆', '🥒', '🥬', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳']
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👱‍♀️', '👱', '👱‍♂️', '🧔']
  },
  {
    name: 'Nature',
    emojis: ['🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒']
  },
];

// Enhanced escape sequence processor
const processEscapeSequences = (text: string): string => {
  if (!text) return '';
  
  let processed = text;
  
  // Standard escape sequences
  const escapeMap: Record<string, string> = {
    '\\n': '\n',        // Newline
    '\\t': '\t',        // Tab
    '\\r': '\r',        // Carriage return
    '\\b': '\b',        // Backspace
    '\\f': '\f',        // Form feed
    '\\v': '\v',        // Vertical tab
    '\\"': '"',         // Double quote
    "\\'": "'",         // Single quote
    '\\\\': '\\',       // Backslash
    '\\0': '\0',        // Null character
  };
  
  // Process standard escape sequences
  Object.entries(escapeMap).forEach(([escaped, actual]) => {
    processed = processed.replace(new RegExp(escaped.replace(/[\\]/g, '\\\\'), 'g'), actual);
  });
  
  // Process Unicode escape sequences (\uXXXX)
  processed = processed.replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch (error) {
      console.warn('Invalid Unicode escape sequence:', match);
      return match;
    }
  });
  
  // Process extended Unicode escape sequences (\u{XXXXX})
  processed = processed.replace(/\\u\{([0-9A-Fa-f]+)\}/g, (match, hex) => {
    try {
      const codePoint = parseInt(hex, 16);
      if (codePoint > 0x10FFFF) {
        console.warn('Invalid Unicode code point:', match);
        return match;
      }
      return String.fromCodePoint(codePoint);
    } catch (error) {
      console.warn('Invalid Unicode escape sequence:', match);
      return match;
    }
  });
  
  // Process hexadecimal escape sequences (\xXX)
  processed = processed.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch (error) {
      console.warn('Invalid hex escape sequence:', match);
      return match;
    }
  });
  
  // Process octal escape sequences (\ooo)
  processed = processed.replace(/\\([0-7]{1,3})/g, (match, octal) => {
    try {
      const charCode = parseInt(octal, 8);
      if (charCode > 255) {
        console.warn('Invalid octal escape sequence:', match);
        return match;
      }
      return String.fromCharCode(charCode);
    } catch (error) {
      console.warn('Invalid octal escape sequence:', match);
      return match;
    }
  });
  
  return processed;
};

const ChatPopup: React.FC = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  
  // Message history for keyboard navigation
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Emoji picker state
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<number>(0);
  
  const textFieldRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Enhanced utility function to clean streaming content while preserving unicode and emojis
  const cleanStreamingContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    // Don't process single characters or very short content - likely actual content
    if (rawContent.length <= 2) {
      return processEscapeSequences(rawContent);
    }
    
    // Don't process if it's clearly actual content (no JSON structure indicators)
    if (!rawContent.includes('"') && !rawContent.includes('{') && !rawContent.includes('}')) {
      return processEscapeSequences(rawContent);
    }
    
    let cleaned = rawContent;
    
    // Only remove very specific OpenAI streaming JSON patterns
    // These patterns are only applied if they match exactly
    
    // Remove complete OpenAI streaming wrapper (only if it's the complete pattern)
    if (cleaned.match(/^\{"choices":\[\{"delta":\{"content":".*"\}\}\]\}$/)) {
      cleaned = cleaned.replace(/^\{"choices":\[\{"delta":\{"content":"/, '');
      cleaned = cleaned.replace(/"\}\}\]\}$/, '');
    }
    
    // Remove finish_reason patterns (only complete patterns)
    cleaned = cleaned.replace(/^\{"choices":\[\{"delta":\{\},"finish_reason":"stop"\}\]\}$/, '');
    cleaned = cleaned.replace(/^\{"finish_reason":"stop"\}$/, '');
    cleaned = cleaned.replace(/^"finish_reason":"stop"$/, '');
    
    // Only remove if it's EXACTLY a technical term (nothing else)
    if (/^(null|undefined|stop|\[DONE\]|\{\}|\[\])$/.test(cleaned.trim())) {
      return '';
    }
    
    // Remove wrapping quotes ONLY if the entire string is wrapped and contains no internal quotes
    if (cleaned.length > 2 && cleaned.startsWith('"') && cleaned.endsWith('"')) {
      const inner = cleaned.slice(1, -1);
      if (!inner.includes('"')) {
        cleaned = inner;
      }
    }
    
    // Process all escape sequences and unicode
    return processEscapeSequences(cleaned);
  };

  // Emoji picker functions
  const handleEmojiPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiPickerAnchor(event.currentTarget);
  };

  const handleEmojiPickerClose = useCallback(() => {
    setEmojiPickerAnchor(null);
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textFieldRef.current?.querySelector('textarea');
    if (textarea) {
      const cursorPosition = textarea.selectionStart || message.length;
      const beforeCursor = message.substring(0, cursorPosition);
      const afterCursor = message.substring(cursorPosition);
      const newMessage = beforeCursor + emoji + afterCursor;
      
      setMessage(newMessage);
      
      // Set cursor position after the inserted emoji
      setTimeout(() => {
        const newCursorPosition = cursorPosition + emoji.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);
    } else {
      // Fallback: append to end
      setMessage(prev => prev + emoji);
      setTimeout(() => textFieldRef.current?.focus(), 0);
    }
    
    handleEmojiPickerClose();
  };

  const isEmojiPickerOpen = Boolean(emojiPickerAnchor);

  // Handle keyboard navigation for message history
  const handleSendMessage = useCallback(async () => {
    if (message.trim() === '' || isLoading) return;

    const userMessage = message.trim();
    
    // Add to message history for keyboard navigation
    setMessageHistory(prev => {
      const newHistory = [userMessage, ...prev.slice(0, 49)]; // Keep last 50 messages
      return newHistory;
    });
    setHistoryIndex(-1);

    const newMessage: Message = {
      id: new Date().toISOString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
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
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ 
          message: userMessage,
          stream: true // Request streaming response
        }),
        credentials: 'include', // Important for session auth
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/event-stream') || contentType?.includes('text/plain')) {
        // Handle OpenAI streaming response format
        console.log('Handling OpenAI streaming response from Pili proxy');
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8'); // Explicitly specify UTF-8 for unicode support
        let accumulatedText = '';
        
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                console.log('Streaming completed');
                break;
              }
              
              const chunk = decoder.decode(value, { stream: true }); // Enable streaming mode for proper unicode handling
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (trimmedLine === 'data: [DONE]') {
                  console.log('Streaming finished with [DONE] marker');
                  break;
                }
                
                if (trimmedLine.startsWith('data: ')) {
                  try {
                    const jsonData = trimmedLine.substring(6).trim();
                    if (jsonData === '[DONE]') break;
                    
                    const data = JSON.parse(jsonData);
                    
                    // Handle different OpenAI response formats
                    let content = '';
                    
                    if (data.choices && data.choices[0]) {
                      const choice = data.choices[0];
                      if (choice.delta && choice.delta.content) {
                        content = choice.delta.content;
                      } else if (choice.text) {
                        content = choice.text;
                      }
                    } else if (data.content) {
                      content = data.content;
                    } else if (typeof data === 'string') {
                      content = data;
                    }
                    
                    if (content) {
                      // NEVER clean individual streaming chunks - just accumulate them raw
                      // This preserves all spaces, characters, and content as-is during streaming
                      accumulatedText += content;
                      
                      // Process escape sequences for real-time display while preserving streaming integrity
                      const displayText = processEscapeSequences(accumulatedText);
                      
                      // Update the bot message with processed text for display
                      setChatMessages((prevMessages) => 
                        prevMessages.map((msg) => 
                          msg.id === botMessageId 
                            ? { ...msg, text: displayText }
                            : msg
                        )
                      );
                    }
                  } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError, 'Line:', trimmedLine);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
        
        // After streaming is complete, clean the final accumulated text if it contains JSON artifacts
        if (accumulatedText && (accumulatedText.includes('{"') || accumulatedText.includes('"finish_reason"'))) {
          const finalCleanedText = cleanStreamingContent(accumulatedText);
          if (finalCleanedText !== accumulatedText) {
            console.log('Final cleanup applied:', { 
              original: accumulatedText, 
              cleaned: finalCleanedText 
            });
            
            // Update with final cleaned text
            setChatMessages((prevMessages) => 
              prevMessages.map((msg) => 
                msg.id === botMessageId 
                  ? { ...msg, text: finalCleanedText }
                  : msg
              )
            );
          }
        }
        
        // If no text was accumulated, show an error
        if (!accumulatedText.trim()) {
          setChatMessages((prevMessages) => 
            prevMessages.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, text: 'I\'m having trouble generating a response. Please try again. 🤔' }
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
                text: 'Sorry, I\'m having trouble connecting to my brain right now. Please try again in a moment or contact our support team if the issue persists. 😅' 
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      // Refocus the input field after sending
      setTimeout(() => {
        textFieldRef.current?.focus();
      }, 100);
    }
  }, [message, isLoading]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (messageHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < messageHistory.length) {
          setHistoryIndex(newIndex);
          setMessage(messageHistory[messageHistory.length - 1 - newIndex]);
        }
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setMessage(messageHistory[messageHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setMessage('');
      }
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Escape') {
      if (isEmojiPickerOpen) {
        handleEmojiPickerClose();
      } else {
        setHistoryIndex(-1);
      }
    }
  }, [messageHistory, historyIndex, handleSendMessage, isEmojiPickerOpen, handleEmojiPickerClose]);

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      // Initialize with a welcome message if chat is empty
      if (chatMessages.length === 0) {
        setChatMessages([
          {
            id: 'welcome',
            text: 'Hello! I\'m Pili, your AI fitness assistant 🏋️‍♀️ How can I help you with your fitness journey today? 💪',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
      // Focus the input field when chat opens
      setTimeout(() => {
        textFieldRef.current?.focus();
      }, 100);
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
            Pili 🤖
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
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontFamily: 'inherit',
                              fontSize: '0.875rem',
                              lineHeight: 1.4,
                              margin: 0,
                              '&:not(:last-child)': {
                                marginBottom: 1,
                              },
                            }}
                          >
                            {children}
                          </Typography>
                        ),
                        strong: ({ children }) => (
                          <Box component="strong" sx={{ fontWeight: 'bold', color: 'inherit' }}>
                            {children}
                          </Box>
                        ),
                        em: ({ children }) => (
                          <Box component="em" sx={{ fontStyle: 'italic', color: 'inherit' }}>
                            {children}
                          </Box>
                        ),
                        code: ({ children }) => (
                          <Box 
                            component="code" 
                            sx={{ 
                              bgcolor: 'rgba(0,0,0,0.05)',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              fontFamily: 'monospace',
                              fontSize: '0.85em',
                              color: 'inherit',
                            }}
                          >
                            {children}
                          </Box>
                        ),
                        ul: ({ children }) => (
                          <Box component="ul" sx={{ margin: '8px 0', paddingLeft: '20px' }}>
                            {children}
                          </Box>
                        ),
                        ol: ({ children }) => (
                          <Box component="ol" sx={{ margin: '8px 0', paddingLeft: '20px' }}>
                            {children}
                          </Box>
                        ),
                        li: ({ children }) => (
                          <Box 
                            component="li" 
                            sx={{ 
                              fontSize: '0.875rem',
                              lineHeight: 1.4,
                              marginBottom: '4px',
                            }}
                          >
                            {children}
                          </Box>
                        ),
                        blockquote: ({ children }) => (
                          <Box 
                            component="blockquote" 
                            sx={{ 
                              borderLeft: '3px solid #2da58e',
                              paddingLeft: '12px',
                              margin: '8px 0',
                              fontStyle: 'italic',
                              opacity: 0.8,
                            }}
                          >
                            {children}
                          </Box>
                        ),
                        h1: ({ children }) => (
                          <Typography variant="h6" sx={{ fontWeight: 'bold', margin: '8px 0 4px 0', fontSize: '1rem' }}>
                            {children}
                          </Typography>
                        ),
                        h2: ({ children }) => (
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', margin: '6px 0 3px 0', fontSize: '0.9rem' }}>
                            {children}
                          </Typography>
                        ),
                        h3: ({ children }) => (
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', margin: '4px 0 2px 0', fontSize: '0.85rem' }}>
                            {children}
                          </Typography>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap', // Preserve newlines and wrap text
                        wordBreak: 'break-word', // Handle long words
                        fontFamily: 'inherit', // Use system font that supports unicode
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {msg.text}
                    </Typography>
                  )}
                  
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
                      Pili is thinking... 🤔
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1.5, bgcolor: '#e0f0ed', flexWrap: 'nowrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%', gap: 1 }}>
            <TextField 
              inputRef={textFieldRef}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Type your message... (Enter to send, Shift+Enter for new line, ↑↓ for history)"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setHistoryIndex(-1); // Reset history navigation when typing
              }}
              disabled={isLoading}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={4}
              sx={{
                bgcolor: '#fff',
                borderRadius: theme.shape.borderRadius,
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.shape.borderRadius,
                  fontFamily: 'inherit', // Ensure unicode support
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'inherit', // Ensure unicode support
                }
              }}
              inputProps={{
                style: {
                  unicodeBidi: 'plaintext', // Better unicode text handling
                }
              }}
            />
            
            <IconButton 
              ref={emojiButtonRef}
              onClick={handleEmojiPickerOpen}
              disabled={isLoading}
              sx={{
                color: '#2da58e',
                '&:hover': {
                  bgcolor: 'rgba(45, 165, 142, 0.1)',
                },
                '&.Mui-disabled': {
                  color: theme.palette.action.disabled,
                }
              }}
              title="Insert emoji"
            >
              <EmojiEmotionsIcon />
            </IconButton>
            
            <IconButton 
              color="primary"
              onClick={handleSendMessage} 
              disabled={!message.trim() || isLoading}
              sx={{
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
          </Box>
          
          {/* Emoji Picker Popover */}
          <Popover
            open={isEmojiPickerOpen}
            anchorEl={emojiPickerAnchor}
            onClose={handleEmojiPickerClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 400,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(45, 165, 142, 0.2)',
              }
            }}
          >
            <Box sx={{ p: 2 }}>
              {/* Category tabs */}
              <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                  {EMOJI_CATEGORIES.map((category, index) => (
                    <Button
                      key={category.name}
                      size="small"
                      variant={selectedEmojiCategory === index ? 'contained' : 'text'}
                      onClick={() => setSelectedEmojiCategory(index)}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                        bgcolor: selectedEmojiCategory === index ? '#2da58e' : 'transparent',
                        color: selectedEmojiCategory === index ? '#fff' : '#2da58e',
                        '&:hover': {
                          bgcolor: selectedEmojiCategory === index ? '#22796a' : 'rgba(45, 165, 142, 0.1)',
                        },
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </Stack>
              </Box>
              
              {/* Emoji grid */}
              <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: 0.5,
                  }}
                >
                  {EMOJI_CATEGORIES[selectedEmojiCategory].emojis.map((emoji, index) => (
                    <ButtonBase
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      sx={{
                        width: '100%',
                        height: 40,
                        borderRadius: 1,
                        fontSize: '1.5rem',
                        '&:hover': {
                          bgcolor: 'rgba(45, 165, 142, 0.1)',
                        },
                        '&:active': {
                          bgcolor: 'rgba(45, 165, 142, 0.2)',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {emoji}
                    </ButtonBase>
                  ))}
                </Box>
              </Box>
            </Box>
          </Popover>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatPopup; 