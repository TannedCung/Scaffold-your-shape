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
        case 'run': return 'https://source.unsplash.com/random/800x600/?running';
        case 'walk': return 'https://source.unsplash.com/random/800x600/?walking';
        case 'swim': return 'https://source.unsplash.com/random/800x600/?swimming';
        case 'cycle': return 'https://source.unsplash.com/random/800x600/?cycling';
        case 'hike': return 'https://source.unsplash.com/random/800x600/?hiking';
        default: return 'https://source.unsplash.com/random/800x600/?exercise';
      }
    }
    return 'https://source.unsplash.com/random/800x600/?fitness-challenge';
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="140"
          image={getChallengeImage()}
          alt={challenge.title}
        />
        {daysRemaining > 0 && (
          <Chip
            label={`${daysRemaining} days left`}
            size="small"
            color="primary"
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              color: theme.palette.primary.main,
              fontWeight: 600
            }}
          />
        )}
        {daysRemaining === 0 && (
          <Chip
            label="Ended"
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              color: theme.palette.error.main,
              fontWeight: 600
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
          {challenge.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {challenge.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrophyIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" fontWeight={500}>
            Goal: {challenge.targetValue} {challenge.unit}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DateIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {dateRange}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {challenge.participantCount} participants
          </Typography>
        </Box>
        
        {isParticipant && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                Your progress
              </Typography>
              <Typography variant="body2" color="primary" fontWeight={600}>
                {progressPercentage}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 30, height: 30 } }}>
            <Avatar alt="Participant 1" src="https://source.unsplash.com/random/100x100/?person-1" />
            <Avatar alt="Participant 2" src="https://source.unsplash.com/random/100x100/?person-2" />
            <Avatar alt="Participant 3" src="https://source.unsplash.com/random/100x100/?person-3" />
            <Avatar alt="Participant 4" src="https://source.unsplash.com/random/100x100/?person-4" />
          </AvatarGroup>
          
          <Link href={`/challenges/${challenge.id}`} passHref>
            <Button 
              variant={isParticipant ? "outlined" : "contained"} 
              size="small"
              color={isParticipant ? "secondary" : "primary"}
            >
              {isParticipant ? "View" : "Join"}
            </Button>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
}
