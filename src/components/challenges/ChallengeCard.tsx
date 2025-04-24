'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button, 
  LinearProgress, 
  Chip, 
  Avatar, 
  AvatarGroup,
  useTheme
} from '@mui/material';
import { 
  DateRange as DateIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { Challenge } from '@/types';
import { motion } from 'framer-motion';

// Create motion components
const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionChip = motion(Chip);

interface ChallengeCardProps {
  challenge: Challenge;
  isParticipant?: boolean;
  currentProgress?: number;
}

export default function ChallengeCard({ 
  challenge, 
  isParticipant = false, 
  currentProgress = 0 
}: ChallengeCardProps) {
  const theme = useTheme();
  
  // Calculate days remaining
  const endDate = new Date(challenge.endDate);
  const today = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Format date range
  const startDate = new Date(challenge.startDate);
  const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  
  // Calculate progress percentage
  const progressPercentage = isParticipant ? Math.min(100, Math.round((currentProgress / challenge.targetValue) * 100)) : 0;
  
  // Get image based on activity type or exercise
  const getChallengeImage = () => {
    if (challenge.activityType) {
      switch (challenge.activityType) {
        case 'run':
          return '/images/running.jpg';
        case 'cycle':
          return '/images/cycling.jpg';
        case 'swim':
          return '/images/swimming.jpg';
        case 'walk':
          return '/images/walking.jpg';
        default:
          return '/images/fitness.jpg';
      }
    } else {
      // Exercise-based challenge
      return '/images/fitness.jpg';
    }
  };
  
  // Badge color
  const getBadgeColor = () => {
    if (daysRemaining === 0) {
      return '#ef4444'; // red
    } else if (daysRemaining <= 3) {
      return '#f59e0b'; // amber
    } else {
      return '#2da58e'; // teal
    }
  };

  return (
    <MotionCard 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="140"
          image={getChallengeImage()}
          alt={challenge.title}
          sx={{ 
            objectFit: 'cover',
            filter: 'brightness(0.85)'
          }}
        />
        
        {/* Status badge */}
        <MotionChip
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          label={daysRemaining === 0 ? 'Ending today' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: getBadgeColor(),
            color: 'white',
            fontWeight: 500,
          }}
        />
        
        {/* Participant count */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          sx={{ 
            position: 'absolute',
            bottom: 12,
            left: 12,
            display: 'flex',
            alignItems: 'center', 
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            borderRadius: 4,
            px: 1,
            py: 0.5,
          }}
        >
          <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {challenge.participantCount} participants
          </Typography>
        </MotionBox>
      </Box>
      
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          component={motion.h3}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 1, 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {challenge.title}
        </Typography>
        
        <Typography 
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {challenge.description}
        </Typography>
        
        <Box 
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5, 
            color: 'text.secondary' 
          }}
        >
          <DateIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {dateRange}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {isParticipant ? 'Your progress' : 'Challenge goal'}
            </Typography>
            <Typography variant="body2" fontWeight="500">
              {isParticipant ? `${currentProgress}/${challenge.targetValue}` : `${challenge.targetValue}`} {challenge.unit}
            </Typography>
          </Box>
          {isParticipant && (
            <MotionBox
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              sx={{ transformOrigin: 'left' }}
            >
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(45, 165, 142, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#2da58e',
                  }
                }} 
              />
            </MotionBox>
          )}
        </Box>
        
        <Button 
          component={motion.button}
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          variant={isParticipant ? "outlined" : "contained"}
          fullWidth 
          sx={{ 
            mt: 1,
            borderRadius: 2,
            py: 1,
            bgcolor: isParticipant ? 'transparent' : '#2da58e',
            borderColor: isParticipant ? '#2da58e' : 'transparent',
            color: isParticipant ? '#2da58e' : 'white',
            '&:hover': {
              bgcolor: isParticipant ? 'rgba(45, 165, 142, 0.05)' : '#1b7d6b',
              borderColor: isParticipant ? '#2da58e' : 'transparent',
            }
          }}
        >
          {isParticipant ? "View Challenge" : "Join Challenge"}
        </Button>
      </CardContent>
    </MotionCard>
  );
}
