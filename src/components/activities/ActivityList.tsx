"use client";

import React, { useState } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { 
  Box, 
  Typography, 
  IconButton, 
  Stack, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CardActionArea,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';
import ActivityEditDialog from './ActivityEditDialog';
import { deleteActivity } from '@/services/activityService';
import type { Activity } from '@/types';
import { SportIconMap, SportColorMap, SportType } from '@/types';
import { useRouter } from 'next/navigation';

const MotionCard = motion(Card);

interface ActivityListProps {
  activities?: Activity[];
  userId?: string;
  loading?: boolean;
  error?: string | null;
}

export default function ActivityList({ 
  activities: propActivities, 
  userId, 
  loading: propLoading, 
  error: propError 
}: ActivityListProps) {
  const router = useRouter();
  
  // If activities are provided via props, use them, else fetch them
  const fetchedData = useActivities(userId);
  
  const activities = propActivities || fetchedData.activities;
  const loading = propLoading !== undefined ? propLoading : fetchedData.loading;
  const error = propError !== undefined ? propError : fetchedData.error;
  const refresh = fetchedData.refresh;
  
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, activity: Activity) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActivity(null);
  };

  const handleEdit = () => {
    if (selectedActivity) {
      setEditActivity(selectedActivity);
      handleMenuClose();
    }
  };

  const handleDeleteClick = () => {
    if (selectedActivity) {
      setDeleteId(selectedActivity.id);
      handleMenuClose();
    }
  };

  const handleViewDetails = () => {
    if (selectedActivity) {
      router.push(`/activities/${selectedActivity.id}`);
      handleMenuClose();
    }
  };

  const handleActivityClick = (activity: Activity) => {
    router.push(`/activities/${activity.id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteActivity(deleteId);
      // Refresh will be triggered automatically by global event system
    } catch (error) {
      console.error('Error deleting activity:', error);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getActivityIcon = (type: string) => {
    // Try to match with SportType enum
    const sportType = Object.values(SportType).find(
      (sport) => sport.toLowerCase() === type.toLowerCase()
    );
    
    if (sportType && SportIconMap[sportType]) {
      const Icon = SportIconMap[sportType];
      return <Icon sx={{ color: SportColorMap[sportType] }} />;
    }
    
    // Fallback to default icon
    const DefaultIcon = SportIconMap[SportType.Other];
    return <DefaultIcon sx={{ color: SportColorMap[SportType.Other] }} />;
  };

  const getActivityColor = (type: string) => {
    // Try to match with SportType enum
    const sportType = Object.values(SportType).find(
      (sport) => sport.toLowerCase() === type.toLowerCase()
    );
    
    if (sportType && SportColorMap[sportType]) {
      return SportColorMap[sportType];
    }
    
    // Fallback to default color
    return SportColorMap[SportType.Other];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fee2e2', color: '#b91c1c' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {!loading && activities.length === 0 && (
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px dashed #cbd5e1'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: '#64748b' }}>
            No activities found
          </Typography>
          <Typography color="text.secondary">
            Start tracking your fitness journey by adding your first activity.
          </Typography>
        </Paper>
      )}
      
      <Grid container spacing={2}>
        {activities.map(activity => (
          <Grid size={{ xs: 12 }} key={activity.id}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              sx={{ borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => handleActivityClick(activity)}
            >
              <CardActionArea component="div">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${getActivityColor(activity.type)}20`, 
                          color: getActivityColor(activity.type) 
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {activity.name || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} 
                            size="small" 
                            sx={{ 
                              bgcolor: `${getActivityColor(activity.type)}10`, 
                              color: getActivityColor(activity.type),
                              borderColor: getActivityColor(activity.type)
                            }}
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon fontSize="small" />
                            {formatDate(activity.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, activity)}
                      aria-label="activity options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color={getActivityColor(activity.type)}>
                      {activity.value} <Typography component="span" variant="body2" color="text.secondary">{activity.unit}</Typography>
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: '#2da58e' }} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#3b82f6' }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ sx: { color: '#ef4444' } }} />
        </MenuItem>
      </Menu>

      <ActivityEditDialog 
        open={!!editActivity} 
        activity={editActivity} 
        onClose={() => setEditActivity(null)}
        onSuccess={refresh}
      />
      
      {deleteId && (
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete Activity?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this activity? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
