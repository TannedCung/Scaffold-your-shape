'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid as MuiGrid, 
  Avatar, 
  Chip, 
  Divider, 
  IconButton, 
  Button,
  CircularProgress,
  Card,
  Tooltip,
  Paper
} from '@mui/material';
import { 
  DirectionsRun as RunIcon,
  DirectionsWalk as WalkIcon,
  Pool as SwimIcon,
  DirectionsBike as CycleIcon,
  Landscape as HikeIcon,
  FitnessCenter as WorkoutIcon,
  SportsTennis as OtherIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  Speed as PaceIcon,
  OpenInNew as OpenInNewIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import ActivityEditDialog from '@/components/activities/ActivityEditDialog';
import { deleteActivity } from '@/services/activityService';
import { Activity } from '@/types';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface ActivityDetailClientProps {
  id: string;
}

export default function ActivityDetailClient({ id }: ActivityDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    async function fetchActivityDetails() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          const formattedActivity: Activity = {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            name: data.name,
            date: data.date,
            value: data.value,
            unit: data.unit,
            location: data.location || undefined,
            notes: data.notes || undefined,
            strava_id: data.strava_id || undefined,
            source: data.source || undefined,
            url: data.url || undefined,
            created_at: data.created_at,
            updatedAt: data.updated_at,
            timeAgo: formatDistanceToNow(new Date(data.date), { addSuffix: true })
          };
          
          setActivity(formattedActivity);
        } else {
          throw new Error('Activity not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchActivityDetails();
    }
  }, [id]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!activity) return;
    
    setIsDeleting(true);
    try {
      await deleteActivity(activity.id);
      router.push('/activities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      setIsDeleting(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'run':
        return <RunIcon fontSize="large" />;
      case 'walk':
        return <WalkIcon fontSize="large" />;
      case 'swim':
        return <SwimIcon fontSize="large" />;
      case 'cycle':
        return <CycleIcon fontSize="large" />;
      case 'hike':
        return <HikeIcon fontSize="large" />;
      case 'workout':
        return <WorkoutIcon fontSize="large" />;
      default:
        return <OtherIcon fontSize="large" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'run':
        return '#fc5200';  // Using Strava orange for consistency
      case 'walk':
        return '#fc5200';
      case 'swim':
        return '#fc5200';
      case 'cycle':
        return '#fc5200';
      case 'hike':
        return '#fc5200';
      case 'workout':
        return '#fc5200';
      default:
        return '#fc5200';
    }
  };

  // Calculate pace from distance and time (placeholder logic)
  const calculatePace = (distance: number): string => {
    // Placeholder - in real app, would use activity duration
    return '13:54 /km';  
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="text"
          sx={{ mb: 2, color: '#666' }}
        >
          Back
        </Button>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} sx={{ color: '#fc5200' }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 2, color: '#b91c1c', border: '1px solid #fee2e2' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : activity ? (
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4
            }}
          >
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    {new Date(activity.date).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })} on {new Date(activity.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                    {activity.location && ` • ${activity.location}`}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {activity.source === 'Strava' && activity.url && (
                    <Button
                      variant="text"
                      component="a"
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<OpenInNewIcon />}
                      size="small"
                      sx={{
                        color: '#fc5200',
                        fontWeight: 500,
                      }}
                    >
                      View on Strava
                    </Button>
                  )}
                  
                  <IconButton 
                    size="small"
                    onClick={() => {}}
                    sx={{
                      color: '#666',
                      '&:hover': { 
                        color: '#333',
                        bgcolor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton 
                    size="small" 
                    onClick={handleEdit}
                    sx={{
                      color: '#666',
                      '&:hover': { 
                        color: '#333',
                        bgcolor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton 
                    size="small" 
                    onClick={handleDelete} 
                    disabled={isDeleting}
                    sx={{
                      color: '#666',
                      '&:hover': { 
                        color: '#ef4444',
                        bgcolor: 'rgba(239,68,68,0.04)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar 
                  src={session?.user?.image || undefined}
                  alt="User Profile"
                  sx={{ width: 64, height: 64 }}
                />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight={600} sx={{ mb: 0.5 }}>
                    {activity.name || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`}
                  </Typography>
                  <Typography variant="body1" component="span" color="text.secondary">
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    {activity.source && (
                      <Chip
                        size="small"
                        label={activity.source}
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: activity.source === 'Strava' ? '#fc520020' : '#2da58e20',
                          color: activity.source === 'Strava' ? '#fc5200' : '#2da58e',
                          borderColor: activity.source === 'Strava' ? '#fc5200' : '#2da58e',
                          fontWeight: 500
                        }}
                        variant="outlined"
                      />
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Stats */}
            <Box sx={{ px: 3, py: 4, bgcolor: '#fff' }}>
              <MuiGrid container spacing={4}>
                {/* Primary stats */}
                <MuiGrid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#2d2d2d', mb: 0 }}>
                      {activity.value < 1000 
                        ? activity.value 
                        : (activity.value / 1000).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.value < 1000 ? activity.unit : 'km'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Distance
                    </Typography>
                  </Box>
                </MuiGrid>
                
                <MuiGrid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#2d2d2d', mb: 0 }}>
                      16:09
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      &nbsp;
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Moving Time
                    </Typography>
                  </Box>
                </MuiGrid>
                
                <MuiGrid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#2d2d2d', mb: 0 }}>
                      {calculatePace(activity.value)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      &nbsp;
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pace
                    </Typography>
                  </Box>
                </MuiGrid>
              </MuiGrid>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Secondary stats */}
              <MuiGrid container spacing={3}>
                <MuiGrid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Elevation
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      3 m
                    </Typography>
                  </Box>
                </MuiGrid>
                
                <MuiGrid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Elapsed Time
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      16:09
                    </Typography>
                  </Box>
                </MuiGrid>
                
                <MuiGrid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Calories
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      —
                    </Typography>
                  </Box>
                </MuiGrid>
                
                <MuiGrid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Steps
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      1,670
                    </Typography>
                  </Box>
                </MuiGrid>
                
                {activity.source === 'Strava' && (
                  <MuiGrid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Source
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        Strava iPhone App
                      </Typography>
                    </Box>
                  </MuiGrid>
                )}
              </MuiGrid>
            </Box>
            
            {/* Notes */}
            {activity.notes && (
              <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb', bgcolor: '#fff' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {activity.notes}
                </Typography>
              </Box>
            )}
            
            {/* Map Placeholder */}
            <Box 
              sx={{ 
                height: 300, 
                bgcolor: '#f1f1f1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderTop: '1px solid #e5e7eb'
              }}
            >
              <Typography color="text.secondary">
                Map data not available
              </Typography>
            </Box>
            
            {/* Segments/Splits Placeholder */}
            <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Splits
              </Typography>
              
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600 }}>KM</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600 }}>Pace</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600 }}>Elev</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '8px 16px' }}>1</td>
                      <td style={{ padding: '8px 16px' }}>13:33 /km</td>
                      <td style={{ padding: '8px 16px' }}>-1 m</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 16px' }}>0.16</td>
                      <td style={{ padding: '8px 16px' }}>16:08 /km</td>
                      <td style={{ padding: '8px 16px' }}>2 m</td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 2, color: '#b91c1c', border: '1px solid #fee2e2' }}>
            <Typography>Activity not found</Typography>
          </Box>
        )}
      </Container>
      
      {activity && (
        <ActivityEditDialog 
          open={isEditDialogOpen} 
          activity={activity} 
          onClose={() => {
            setIsEditDialogOpen(false);
            // Refresh the data after editing
            router.refresh();
          }} 
        />
      )}
    </MainLayout>
  );
} 