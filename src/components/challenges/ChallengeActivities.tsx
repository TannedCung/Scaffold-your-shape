'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  Chip,
  Paper,
  Button
} from '@mui/material';
import {
  DirectionsRun as RunIcon,
  DirectionsBike as BikeIcon,
  Pool as SwimIcon,
  FitnessCenter as WorkoutIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getActivityIcon, getActivityColor } from '@/utils/activityTypeUI';
import ActivityCard from '@/components/activities/ActivityCard';
import { useChallengeActivities } from '@/hooks/useChallengeActivities';

interface ChallengeActivitiesProps {
  challengeId: string;
  compact?: boolean;
}

const MotionBox = motion(Box);

export default function ChallengeActivities({ challengeId, compact = false }: ChallengeActivitiesProps) {
  const theme = useTheme();
  const { activities, loading, error, hasMore, loadMore, refresh } = useChallengeActivities({
    challengeId,
    limit: compact ? 5 : 10
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={compact ? 24 : 32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontSize: compact ? '0.875rem' : '1rem' }}>
        {error}
      </Alert>
    );
  }

  if (activities.length === 0) {
    return (
      <Paper sx={{ 
        p: compact ? 2 : 3, 
        textAlign: 'center', 
        bgcolor: theme.palette.grey[50] 
      }}>
        <RunIcon sx={{ 
          fontSize: compact ? 32 : 48, 
          color: theme.palette.grey[400], 
          mb: 1 
        }} />
        <Typography 
          variant={compact ? 'body2' : 'h6'} 
          color="text.secondary" 
          gutterBottom
        >
          No activities yet
        </Typography>
        <Typography 
          variant={compact ? 'caption' : 'body2'} 
          color="text.secondary"
        >
          Activities from challenge participants will appear here
        </Typography>
      </Paper>
    );
  }

  if (compact) {
    return (
      <Stack spacing={1.5}>
        {activities.slice(0, 5).map((activity, index) => {
          const profile = activity.memberProfile;
          const activityIcon = getActivityIcon(activity.type);
          
          return (
            <MotionBox
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper 
                sx={{ 
                  p: 2, 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={profile?.avatar_url}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: getActivityColor(activity.type)
                    }}
                  >
                    {profile?.name ? profile.name[0] : activityIcon}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {activity.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {profile?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.value} {activity.unit}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      icon={activityIcon}
                      label={activity.type}
                      size="small"
                      sx={{ 
                        bgcolor: getActivityColor(activity.type) + '20',
                        color: getActivityColor(activity.type),
                        fontSize: '0.75rem',
                        height: 20
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </MotionBox>
          );
        })}
        
        {activities.length > 5 && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 1 }}>
            +{activities.length - 5} more activities
          </Typography>
        )}
        
        {/* Refresh Button for compact view */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={refresh}
            startIcon={<RefreshIcon />}
            sx={{ fontSize: '0.75rem' }}
          >
            Refresh
          </Button>
        </Box>
      </Stack>
    );
  }

  // Full view for main content area (if needed)
  return (
    <Stack spacing={2}>
      {activities.map((activity, index) => {
        const profile = activity.memberProfile;
        
        return (
          <MotionBox
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ActivityCard 
              activity={{
                ...activity,
                user: profile ? {
                  id: profile.id,
                  name: profile.name,
                  avatar_url: profile.avatar_url
                } : undefined
              }} 
              compact 
            />
          </MotionBox>
        );
      })}
      
      {/* Load More Button */}
      {hasMore && !compact && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            startIcon={<RefreshIcon />}
          >
            Load More Activities
          </Button>
        </Box>
      )}
    </Stack>
  );
} 