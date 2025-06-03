import React, { useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]); // Placeholder for chat history
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      // Initialize with a welcome message if chat is empty
      if (chatMessages.length === 0) {
        setChatMessages([
          {
            id: 'welcome',
            text: 'Hello! How can we help you with Scaffold Your Shape today?',
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

    // API call to send message using environment variable
    try {
      const chatbotEndpoint = process.env.NEXT_PUBLIC_CHATBOT_API_ENDPOINT || '/api/chat/send-message';
      const response = await fetch(chatbotEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          userId: 'current_user_id' // This should be replaced with actual user ID from auth
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.reply) {
        const botReply: Message = {
          id: new Date().toISOString() + '-bot',
          text: responseData.reply,
          sender: 'bot',
          timestamp: new Date(),
        };
        setChatMessages((prevMessages) => [...prevMessages, botReply]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add a bot message indicating failure
      const errorReply: Message = {
        id: new Date().toISOString() + '-error',
        text: 'Sorry, I encountered an error. Please try again later or contact our support team.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setChatMessages((prevMessages) => [...prevMessages, errorReply]);
    } finally {
      setIsLoading(false);
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
    email: 'support@scaffoldyourshape.com',
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
                    boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left', fontSize: '0.65rem', opacity: 0.7, mt: 0.5 }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                    AI is thinking...
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Services Section - Initially collapsed or integrated subtly */}
          {/* Could be a button that reveals this, or part of initial messages */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center'}}>
              <InfoIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Our Services
            </Typography>
            <List dense disablePadding>
              {services.map(service => (
                <ListItem key={service.name} sx={{ p: 0, mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>{service.icon}</ListItemIcon>
                  <ListItemText primary={service.name} secondary={service.description} primaryTypographyProps={{fontSize: '0.875rem'}} secondaryTypographyProps={{fontSize: '0.75rem'}}/>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Contact Info Section */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center'}}>
              <ContactMailIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Contact Us
            </Typography>
            <Typography variant="body2" component="div" sx={{ fontSize: '0.8rem' }}>
              Email: <a href={`mailto:${contactInfo.email}`} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>{contactInfo.email}</a><br/>
              {/* Phone: {contactInfo.phone} <br/> */}
              <a href={contactInfo.faqUrl} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>View FAQs</a>
            </Typography>
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