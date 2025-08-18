'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Box,
  Paper,
  useTheme,
  Grow
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  FitnessCenter as WorkoutIcon,
  Speed as SpeedIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { getActivityIcon, getActivityColor } from '@/utils/activityTypeUI';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityData {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  date: string;
  location?: string;
  notes?: string;
  distance?: number;
  elapsed_time?: number;
  average_speed?: number;
  total_elevation_gain?: number;
  memberProfile?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface ActivityCardProps {
  activity: ActivityData;
  index?: number;
  children?: React.ReactNode; // For social interactions
  onClick?: () => void;
  compact?: boolean;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function formatDistance(meters: number): string {
  if (!meters) return '';
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${meters.toFixed(0)} m`;
  }
}

function formatSpeed(speed: number): string {
  if (!speed) return '';
  
  const kmh = speed * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export default function ActivityCard({ 
  activity, 
  index = 0, 
  children, 
  onClick,
  compact = false 
}: ActivityCardProps) {
  const theme = useTheme();
  const activityColor = getActivityColor(activity.type);
  
  // Use either memberProfile or user (for different contexts)
  const profile = activity.memberProfile || activity.user;
  
  return (
    <Grow in timeout={1000 + index * 50}>
      <Card sx={{
        position: 'relative',
        overflow: 'visible',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transition: 'all 0.3s ease',
        mb: compact ? 1 : 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: onClick ? 'translateY(-2px)' : 'translateY(-1px)',
          boxShadow: `0 6px 20px ${activityColor}15`,
          border: `1px solid ${activityColor}40`,
        }
      }}
      onClick={onClick}
      >
        <CardContent sx={{ p: compact ? 2 : 3 }}>
          {/* Activity Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: compact ? 2 : 3 }}>
            <Avatar 
              src={profile?.avatar_url} 
              sx={{ 
                width: compact ? 40 : 56, 
                height: compact ? 40 : 56, 
                mr: 2,
                border: `3px solid ${activityColor}`,
                bgcolor: activityColor
              }}
            >
              {profile?.name?.[0] || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant={compact ? "subtitle1" : "h6"} sx={{ fontWeight: 700, mb: 0.5 }}>
                {profile?.name || 'Unknown User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={activity.type} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${activityColor}20`, 
                    color: activityColor, 
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }} 
                />
                <Chip 
                  label={`${activity.value} ${activity.unit}`} 
                  size="small" 
                  sx={{ 
                    bgcolor: theme.palette.primary.main + '20', 
                    color: theme.palette.primary.main, 
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }} 
                />
              </Box>
            </Box>
            <Box sx={{
              width: compact ? 40 : 56,
              height: compact ? 40 : 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${activityColor}, ${activityColor}DD)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${activityColor}30`
            }}>
              {getActivityIcon(activity.type, { sx: { color: 'white', fontSize: compact ? 20 : 28 } })}
            </Box>
          </Box>

          {/* Activity Title */}
          <Typography variant={compact ? "h6" : "h5"} sx={{ 
            fontWeight: 700, 
            mb: compact ? 2 : 3,
            color: activityColor,
            lineHeight: 1.3
          }}>
            {activity.name}
          </Typography>

          {/* Key Metrics in Horizontal Layout */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: compact ? 2 : 3, 
            mb: compact ? 2 : 3,
            p: compact ? 1.5 : 2,
            bgcolor: `${activityColor}08`,
            borderRadius: 2,
            border: `1px solid ${activityColor}15`,
            justifyContent: { xs: 'flex-start', sm: 'space-between', md: 'flex-start' }
          }}>
            {activity.elapsed_time && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: compact ? 100 : { xs: 120, sm: 140, md: 160 } }}>
                <Avatar sx={{ 
                  bgcolor: theme.palette.secondary.main + '20', 
                  width: compact ? 28 : 36, 
                  height: compact ? 28 : 36 
                }}>
                  <TimeIcon sx={{ color: theme.palette.secondary.main, fontSize: compact ? 16 : 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                    Duration
                  </Typography>
                  <Typography variant={compact ? "body2" : "body1"} sx={{ fontWeight: 700 }}>
                    {formatDuration(activity.elapsed_time)}
                  </Typography>
                </Box>
              </Box>
            )}
            
            {activity.distance && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: compact ? 100 : { xs: 120, sm: 140, md: 160 } }}>
                <Avatar sx={{ 
                  bgcolor: '#16a08520', 
                  width: compact ? 28 : 36, 
                  height: compact ? 28 : 36 
                }}>
                  <WorkoutIcon sx={{ color: '#16a085', fontSize: compact ? 16 : 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                    Distance
                  </Typography>
                  <Typography variant={compact ? "body2" : "body1"} sx={{ fontWeight: 700 }}>
                    {formatDistance(activity.distance)}
                  </Typography>
                </Box>
              </Box>
            )}
            
            {activity.average_speed && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: compact ? 100 : { xs: 120, sm: 140, md: 160 } }}>
                <Avatar sx={{ 
                  bgcolor: '#ef444420', 
                  width: compact ? 28 : 36, 
                  height: compact ? 28 : 36 
                }}>
                  <SpeedIcon sx={{ color: '#ef4444', fontSize: compact ? 16 : 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                    Avg Speed
                  </Typography>
                  <Typography variant={compact ? "body2" : "body1"} sx={{ fontWeight: 700 }}>
                    {formatSpeed(activity.average_speed)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Location */}
          {activity.location && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              mb: 2,
              p: compact ? 1.5 : 2,
              bgcolor: theme.palette.primary.main + '08',
              borderRadius: 2,
              border: `1px solid ${theme.palette.primary.main}15`
            }}>
              <PlaceIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                {activity.location}
              </Typography>
            </Box>
          )}

          {/* Notes */}
          {activity.notes && (
            <Paper sx={{ 
              mt: 2, 
              p: compact ? 2 : 3, 
              bgcolor: `${activityColor}08`,
              border: `1px solid ${activityColor}20`,
              borderRadius: 2
            }}>
              <Typography variant="body1" sx={{ 
                fontStyle: 'italic',
                color: 'text.primary',
                lineHeight: 1.6,
                fontSize: compact ? '0.875rem' : '0.95rem'
              }}>
                "{activity.notes}"
              </Typography>
            </Paper>
          )}
          
          {/* Social Interactions */}
          {children && (
            <Box sx={{ mt: 2 }}>
              {children}
            </Box>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
} 