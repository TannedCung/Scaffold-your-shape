'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  useTheme
} from '@mui/material';
import {
  DirectionsRun as RunIcon,
  DirectionsBike as BikeIcon,
  Pool as SwimIcon,
  FitnessCenter as WorkoutIcon,
  DirectionsWalk as WalkIcon,
  Landscape as HikeIcon,
  AccessTime as TimeIcon,
  Speed as SpeedIcon,
  Place as PlaceIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useClubActivities } from '@/hooks/useClubActivities';
import { getActivityIcon, getActivityColor } from '@/utils/activityTypeUI';
import { formatDistanceToNow } from 'date-fns';

interface ClubMemberActivitiesProps {
  clubId: string;
}

const activityTypes = [
  { value: '', label: 'All Activities', icon: <WorkoutIcon /> },
  { value: 'run', label: 'Running', icon: <RunIcon /> },
  { value: 'cycle', label: 'Cycling', icon: <BikeIcon /> },
  { value: 'swim', label: 'Swimming', icon: <SwimIcon /> },
  { value: 'walk', label: 'Walking', icon: <WalkIcon /> },
  { value: 'hike', label: 'Hiking', icon: <HikeIcon /> },
  { value: 'workout', label: 'Workout', icon: <WorkoutIcon /> }
];

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

interface ActivityCardProps {
  activity: any;
  index: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index }) => {
  const theme = useTheme();
  const activityColor = getActivityColor(activity.type);
  
  return (
    <Grow in timeout={1000 + index * 100}>
      <Card sx={{
        position: 'relative',
        overflow: 'visible',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${activityColor}20`,
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          {/* Activity Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={activity.memberProfile.avatar_url} 
              sx={{ 
                width: 48, 
                height: 48, 
                mr: 2,
                border: `2px solid ${activityColor}`,
                bgcolor: activityColor
              }}
            >
              {activity.memberProfile.name?.[0] || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {activity.memberProfile.name || 'Unknown Member'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
              </Typography>
            </Box>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${activityColor}, ${activityColor}CC)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${activityColor}30`
            }}>
              {getActivityIcon(activity.type, { sx: { color: 'white', fontSize: 24 } })}
            </Box>
          </Box>

          {/* Activity Details */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              mb: 1,
              color: activityColor,
              lineHeight: 1.2
            }}>
              {activity.name}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={activity.type} 
                size="small" 
                sx={{ 
                  bgcolor: `${activityColor}15`, 
                  color: activityColor, 
                  fontWeight: 600,
                  border: `1px solid ${activityColor}30`
                }} 
              />
              <Chip 
                label={`${activity.value} ${activity.unit}`} 
                size="small" 
                sx={{ 
                  bgcolor: theme.palette.primary.main + '15', 
                  color: theme.palette.primary.main, 
                  fontWeight: 700
                }} 
              />
            </Box>
          </Box>

                     {/* Key Metrics */}
           <Grid container spacing={2}>
             {activity.elapsed_time && (
               <Grid size={{ xs: 6, sm: 4 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <TimeIcon sx={{ color: theme.palette.secondary.main, fontSize: 18 }} />
                   <Box>
                     <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                       Duration
                     </Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600 }}>
                       {formatDuration(activity.elapsed_time)}
                     </Typography>
                   </Box>
                 </Box>
               </Grid>
             )}
             
             {activity.distance && (
               <Grid size={{ xs: 6, sm: 4 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <WorkoutIcon sx={{ color: '#16a085', fontSize: 18 }} />
                   <Box>
                     <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                       Distance
                     </Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600 }}>
                       {formatDistance(activity.distance)}
                     </Typography>
                   </Box>
                 </Box>
               </Grid>
             )}
             
             {activity.average_speed && (
               <Grid size={{ xs: 6, sm: 4 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <SpeedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                   <Box>
                     <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                       Avg Speed
                     </Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600 }}>
                       {formatSpeed(activity.average_speed)}
                     </Typography>
                   </Box>
                 </Box>
               </Grid>
             )}
             
             {activity.location && (
               <Grid size={{ xs: 12 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                   <PlaceIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                     {activity.location}
                   </Typography>
                 </Box>
               </Grid>
             )}
           </Grid>

          {/* Notes */}
          {activity.notes && (
            <Paper sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: `${activityColor}08`,
              border: `1px solid ${activityColor}20`,
              borderRadius: 2
            }}>
              <Typography variant="body2" sx={{ 
                fontStyle: 'italic',
                color: 'text.secondary',
                lineHeight: 1.4
              }}>
                "{activity.notes}"
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

export default function ClubMemberActivities({ clubId }: ClubMemberActivitiesProps) {
  const theme = useTheme();
  const [selectedActivityType, setSelectedActivityType] = useState('');
  
  const { 
    activities, 
    loading, 
    error, 
    pagination, 
    loadMore, 
    hasMore, 
    refresh 
  } = useClubActivities({ 
    clubId, 
    activityType: selectedActivityType || undefined,
    limit: 12 
  });

  const handleActivityTypeChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedActivityType(newValue);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 800, 
            color: theme.palette.primary.main,
            mb: 0.5
          }}>
            Member Activities
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Recent activities from all club members
          </Typography>
        </Box>
        
        <Tooltip title="Refresh Activities">
          <IconButton 
            onClick={refresh}
            disabled={loading}
            sx={{ 
              bgcolor: theme.palette.primary.main + '15',
              '&:hover': { bgcolor: theme.palette.primary.main + '25' }
            }}
          >
            <RefreshIcon sx={{ color: theme.palette.primary.main }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Activity Type Filter */}
      <Paper sx={{ 
        mb: 4, 
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Tabs
          value={selectedActivityType}
          onChange={handleActivityTypeChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 64,
              px: 3
            },
            '& .Mui-selected': {
              color: theme.palette.primary.main + ' !important'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3
            }
          }}
        >
          {activityTypes.map((type) => (
            <Tab
              key={type.value}
              value={type.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {type.icon}
                  {type.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Activities Grid */}
      {loading && activities.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : activities.length === 0 ? (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <WorkoutIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
            No Activities Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Member activities will appear here once they start logging their workouts.
          </Typography>
        </Paper>
      ) : (
        <>
                     <Grid container spacing={3}>
             {activities.map((activity, index) => (
               <Grid size={{ xs: 12, md: 6, lg: 4 }} key={activity.id}>
                 <ActivityCard activity={activity} index={index} />
               </Grid>
             ))}
           </Grid>

          {/* Load More */}
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <ExpandMoreIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.main + '10',
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                {loading ? 'Loading...' : `Load More (${pagination.total - activities.length} remaining)`}
              </Button>
            </Box>
          )}

          {/* Pagination Info */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Showing {activities.length} of {pagination.total} activities
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
} 