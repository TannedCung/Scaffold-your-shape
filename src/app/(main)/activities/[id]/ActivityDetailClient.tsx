'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid as MuiGrid, 
  Avatar, 
  Chip, 
  Divider, 
  IconButton, 
  Button,
  CircularProgress,
  Card,
  CardContent
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
  Room as LocationIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import ActivityEditDialog from '@/components/activities/ActivityEditDialog';
import { deleteActivity } from '@/services/activityService';
import { Activity } from '@/types';

interface ActivityDetailClientProps {
  id: string;
}

export default function ActivityDetailClient({ id }: ActivityDetailClientProps) {
  const router = useRouter();
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
        return <RunIcon fontSize="large" sx={{ color: '#3b82f6' }} />;
      case 'walk':
        return <WalkIcon fontSize="large" sx={{ color: '#10b981' }} />;
      case 'swim':
        return <SwimIcon fontSize="large" sx={{ color: '#06b6d4' }} />;
      case 'cycle':
        return <CycleIcon fontSize="large" sx={{ color: '#8b5cf6' }} />;
      case 'hike':
        return <HikeIcon fontSize="large" sx={{ color: '#f59e0b' }} />;
      case 'workout':
        return <WorkoutIcon fontSize="large" sx={{ color: '#ef4444' }} />;
      default:
        return <OtherIcon fontSize="large" sx={{ color: '#6b7280' }} />;
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Back to Activities
          </Button>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} sx={{ color: '#2da58e' }} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 4, bgcolor: '#fee2e2', borderRadius: 2, color: '#b91c1c' }}>
              <Typography>{error}</Typography>
            </Box>
          ) : activity ? (
            <>
              <Card sx={{ mb: 4, overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(45, 165, 142, 0.1)', 
                          color: '#2da58e',
                          width: 60,
                          height: 60 
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold">
                          {activity.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <CalendarIcon fontSize="small" sx={{ color: '#6b7280' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(activity.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({activity.timeAgo})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Button 
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button 
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <MuiGrid container spacing={3}>
                    <MuiGrid item xs={12} md={8}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Activity Details
                        </Typography>
                        
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            borderColor: 'rgba(0,0,0,0.12)',
                            bgcolor: '#fafafa'
                          }}
                        >
                          <Box 
                            sx={{ 
                              display: 'grid', 
                              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                              gap: 3 
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Type
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                                {activity.type}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Value
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 0.5 }}>
                                {activity.value} {activity.unit}
                              </Typography>
                            </Box>
                            
                            {activity.location && (
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Location
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <LocationIcon fontSize="small" sx={{ color: '#6b7280' }} />
                                  <Typography variant="body1">
                                    {activity.location}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                          
                          {activity.notes && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Notes
                              </Typography>
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 2, 
                                  mt: 1, 
                                  borderRadius: 1,
                                  bgcolor: 'white'
                                }}
                              >
                                <Typography variant="body1">
                                  {activity.notes}
                                </Typography>
                              </Paper>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    </MuiGrid>
                    
                    <MuiGrid item xs={12} md={4}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Stats
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            borderRadius: 2,
                            borderColor: 'rgba(0,0,0,0.12)',
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              p: 2,
                              bgcolor: '#2da58e',
                              color: 'white'
                            }}
                          >
                            <Typography variant="h3" fontWeight="bold">
                              {activity.value}
                            </Typography>
                            <Typography variant="subtitle1">
                              {activity.unit}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Date
                              </Typography>
                              <Typography variant="body2">
                                {new Date(activity.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Created
                              </Typography>
                              <Typography variant="body2">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Last Updated
                              </Typography>
                              <Typography variant="body2">
                                {new Date(activity.updatedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Box>
                    </MuiGrid>
                  </MuiGrid>
                </CardContent>
              </Card>
            </>
          ) : (
            <Box sx={{ p: 4, bgcolor: '#fee2e2', borderRadius: 2, color: '#b91c1c' }}>
              <Typography>Activity not found</Typography>
            </Box>
          )}
        </Box>
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