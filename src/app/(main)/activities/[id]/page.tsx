"use client";

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  IconButton, 
  Avatar,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PoolIcon from '@mui/icons-material/Pool';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import LandscapeIcon from '@mui/icons-material/Landscape';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { fetchActivityById, deleteActivity } from '@/services/activityService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActivityEditDialog from '@/components/activities/ActivityEditDialog';
import { Activity } from '@/types';
import { motion } from 'framer-motion';

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await fetchActivityById(params.id);
        if (data) {
          setActivity(data);
        } else {
          setError('Activity not found');
        }
      } catch (err) {
        setError('Failed to load activity');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [params.id]);

  const handleDelete = async () => {
    if (!activity) return;
    
    setDeleting(true);
    try {
      await deleteActivity(activity.id);
      router.push('/activities');
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
        return <DirectionsRunIcon sx={{ fontSize: 40, color: '#f59e0b' }} />;
      case 'walk':
        return <DirectionsWalkIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />;
      case 'swim':
        return <PoolIcon sx={{ fontSize: 40, color: '#3b82f6' }} />;
      case 'cycle':
        return <DirectionsBikeIcon sx={{ fontSize: 40, color: '#10b981' }} />;
      case 'hike':
        return <LandscapeIcon sx={{ fontSize: 40, color: '#ef4444' }} />;
      case 'workout':
        return <FitnessCenterIcon sx={{ fontSize: 40, color: '#2da58e' }} />;
      default:
        return <FitnessCenterIcon sx={{ fontSize: 40, color: '#6b7280' }} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
        return '#f59e0b';
      case 'walk':
        return '#8b5cf6';
      case 'swim':
        return '#3b82f6';
      case 'cycle':
        return '#10b981';
      case 'hike':
        return '#ef4444';
      case 'workout':
        return '#2da58e';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            component={Link}
            href="/activities"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Activities
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Activity Details
          </Typography>
          {!loading && activity && (
            <Box>
              <IconButton 
                onClick={() => setShowEditDialog(true)}
                sx={{ color: '#3b82f6', mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={() => setShowDeleteDialog(true)}
                sx={{ color: '#ef4444' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {loading ? (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Skeleton variant="circular" width={60} height={60} sx={{ mr: 2 }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="30%" height={40} />
                  <Skeleton variant="text" width="50%" height={30} />
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="60%" height={24} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="60%" height={24} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : error ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: '#fee2e2', 
              color: '#b91c1c',
              borderRadius: 2
            }}
          >
            <Typography variant="h6">{error}</Typography>
            <Button 
              component={Link}
              href="/activities"
              variant="contained" 
              sx={{ mt: 2, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
            >
              Return to Activities
            </Button>
          </Paper>
        ) : activity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box 
                sx={{ 
                  bgcolor: getActivityColor(activity.type), 
                  color: 'white',
                  p: 3,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: 'white', 
                    color: getActivityColor(activity.type),
                    mr: 2
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {activity.name || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {formatDate(activity.date)}
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="overline" color="text.secondary">
                        Activity Type
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} 
                          sx={{ 
                            bgcolor: `${getActivityColor(activity.type)}10`, 
                            color: getActivityColor(activity.type),
                            fontWeight: 'bold',
                            pl: 1,
                            pr: 1
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="overline" color="text.secondary">
                        Performance
                      </Typography>
                      <Typography variant="h3" component="div" fontWeight="bold" sx={{ mt: 1, color: getActivityColor(activity.type) }}>
                        {activity.value}
                        <Typography variant="body1" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                          {activity.unit}
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="overline" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {formatDate(activity.date)}
                      </Typography>
                    </Box>
                    
                    {activity.location && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {activity.location}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  
                  {activity.notes && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                          {activity.notes}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activity && (
          <ActivityEditDialog 
            open={showEditDialog} 
            activity={activity} 
            onClose={() => {
              setShowEditDialog(false);
              // Refresh the activity after edit
              fetchActivityById(params.id).then(data => {
                if (data) setActivity(data);
              });
            }} 
          />
        )}

        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        >
          <DialogTitle>Delete Activity</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this activity? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowDeleteDialog(false)} 
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
} 