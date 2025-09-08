'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  SportsScoreOutlined as RunIcon,
  PedalBikeOutlined as BikeIcon,
  PoolOutlined as SwimIcon,
  FitnessCenterOutlined as WorkoutIcon,
  SelfImprovementOutlined as WalkIcon,
  HikingOutlined as HikeIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  SportsGymnasticsOutlined as GymnasticsIcon,
  SportsOutlined as SportsIcon
} from '@mui/icons-material';
import { useClubActivities } from '@/hooks/useClubActivities';
import ActivityList from '@/components/activities/ActivityList';
import { useSession } from 'next-auth/react';

interface ClubMemberActivitiesProps {
  clubId: string;
}

const activityTypes = [
  { value: '', label: 'All Activities', icon: <SportsIcon /> },
  { value: 'run', label: 'Running', icon: <RunIcon /> },
  { value: 'cycle', label: 'Cycling', icon: <BikeIcon /> },
  { value: 'swim', label: 'Swimming', icon: <SwimIcon /> },
  { value: 'walk', label: 'Walking', icon: <WalkIcon /> },
  { value: 'hike', label: 'Hiking', icon: <HikeIcon /> },
  { value: 'workout', label: 'Workout', icon: <WorkoutIcon /> },
  { value: 'yoga', label: 'Yoga', icon: <GymnasticsIcon /> }
];





export default function ClubMemberActivities({ clubId }: ClubMemberActivitiesProps) {
  const theme = useTheme();
  const { data: session } = useSession();
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
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        maxWidth: { xs: 700, sm: 800, md: 900, lg: 1000 },
        mx: 'auto'
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
              minHeight: 56,
              px: 2,
              fontSize: '0.875rem'
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
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          maxWidth: { xs: 700, sm: 800, md: 900, lg: 1000 },
          mx: 'auto'
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
            <Box sx={{ 
              maxWidth: { xs: 700, sm: 800, md: 900, lg: 1000 }, 
              mx: 'auto'
            }}>
              <ActivityList
                activities={activities}
                loading={false}
                error={null}
                showSocial={true}
                userId={session?.user?.id}
              />
            </Box>

          {/* Load More */}
          {hasMore && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 4,
              maxWidth: { xs: 700, sm: 800, md: 900, lg: 1000 },
              mx: 'auto'
            }}>
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
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: theme.palette.primary.main + '10',
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Loading...' : `Load More (${pagination.total - activities.length} remaining)`}
              </Button>
            </Box>
          )}

          {/* Pagination Info */}
          <Box sx={{ 
            mt: 3, 
            textAlign: 'center',
            maxWidth: { xs: 700, sm: 800, md: 900, lg: 1000 },
            mx: 'auto'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Showing {activities.length} of {pagination.total} activities
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
} 