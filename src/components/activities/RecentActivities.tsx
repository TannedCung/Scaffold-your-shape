'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Activity } from '@/types';
import { activityApi } from '@/lib/api';
import { getActivityIcon, getActivityColor } from '@/utils/activityTypeUI';
import { formatDistance, formatDuration } from '@/utils/formatUtils';

export default function RecentActivities() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const { data, error } = await activityApi.getAll();
        
        if (error) {
          throw new Error(error);
        }

        // Sort activities by date in descending order and take the most recent ones
        const sortedActivities = (data || [])
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5); // Show only the 5 most recent activities

        setActivities(sortedActivities);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load recent activities');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No recent activities</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {activities.map((activity) => (
        <Paper
          key={activity.id}
          elevation={0}
          sx={{
            p: 2,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            bgcolor: '#f7faf9',
            borderRadius: 2,
          }}
          onClick={() => router.push(`/activities/${activity.id}`)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: getActivityColor(activity.type),
                width: 48,
                height: 48,
              }}
            >
              {getActivityIcon(activity.type, { sx: { color: '#fff', fontSize: 24 } })}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {activity.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label={activity.type}
                  size="small"
                  sx={{
                    bgcolor: getActivityColor(activity.type),
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                {activity.distance && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDistance(activity.distance)}
                  </Typography>
                )}
                {activity.elapsedTime && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDuration(activity.elapsedTime)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
} 