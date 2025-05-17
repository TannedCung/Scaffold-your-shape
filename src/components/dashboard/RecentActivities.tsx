'use client';

import React, { useState } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box,
  Button,
  Skeleton,
  useTheme,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';
import { useSession } from 'next-auth/react';
import { SportIconMap, SportColorMap, SportType } from '@/types';

// Create motion components
const MotionCard = motion(Card);
const MotionListItem = motion(ListItem);

interface RecentActivitiesProps {
  userId?: string;
  limit?: number;
}

export default function RecentActivities({ userId, limit = 5 }: RecentActivitiesProps) {
  const theme = useTheme();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { activities, loading, error } = useActivities(userId);
  const { status } = useSession();

  // Take only the most recent activities up to the limit
  const recentActivities = activities.slice(0, limit);
  
  // Determine if we're still checking authentication
  const isAuthLoading = status === 'loading';

  const getActivityIcon = (type: string) => {
    // Try to map the string type to SportType enum
    const sportType = Object.values(SportType).find(
      sport => sport.toLowerCase() === type.toLowerCase()
    ) as SportType;
    
    // If found in our enum, use the SportIconMap
    if (sportType && SportIconMap[sportType]) {
      const IconComponent = SportIconMap[sportType];
      return <IconComponent />;
    }
    
    // Fallback to default icon
    const DefaultIcon = SportIconMap[SportType.Other];
    return <DefaultIcon />;
  };

  const getActivityColor = (type: string) => {
    // Try to map the string type to SportType enum
    const sportType = Object.values(SportType).find(
      sport => sport.toLowerCase() === type.toLowerCase()
    ) as SportType;
    
    // If found in our enum, use the SportColorMap
    if (sportType && SportColorMap[sportType]) {
      return SportColorMap[sportType];
    }
    
    // Fallback to default color
    return SportColorMap[SportType.Other];
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Within the last week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString([], { weekday: 'long' }) + ' at ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Older
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  };

  const renderLoadingState = () => (
    <Box sx={{ px: 2, py: 1 }}>
      {[...Array(3)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', my: 2, alignItems: 'center' }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="70%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderEmptyState = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="body1" color="text.secondary">
        No activities recorded yet.
      </Typography>
      <Button 
        component={Link} 
        href="/activities" 
        variant="outlined" 
        sx={{ mt: 2, color: '#2da58e', borderColor: '#2da58e' }}
      >
        Add Your First Activity
      </Button>
    </Box>
  );

  return (
    <MotionCard 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}
    >
      <CardHeader 
        title="Recent Activities" 
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{ 
                color: '#2da58e', 
                borderColor: '#2da58e',
                '&:hover': { borderColor: '#1a8a73', bgcolor: 'rgba(45, 165, 142, 0.08)' }
              }}
            >
              Log
            </Button>
            <Button 
              component={Link} 
              href="/activities" 
              size="small" 
              sx={{ color: '#2da58e' }}
            >
              View All
            </Button>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ px: 0, py: 0 }}>
        {loading || isAuthLoading ? (
          renderLoadingState()
        ) : error && !isAuthLoading ? (
          <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
        ) : recentActivities.length === 0 ? (
          renderEmptyState()
        ) : (
          <List 
            component={motion.ul}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ padding: 0 }}
          >
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <MotionListItem 
                  variants={itemVariants}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  sx={{ px: 2, py: 1.5, cursor: 'pointer' }}
                  onClick={() => router.push(`/activities/${activity.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar
                      component={motion.div}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      sx={{ 
                        bgcolor: `${getActivityColor(activity.type)}20`, 
                        color: getActivityColor(activity.type) 
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {activity.name || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Typography>
                        <Chip 
                          label={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} 
                          size="small" 
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: `${getActivityColor(activity.type)}10`, 
                            color: getActivityColor(activity.type),
                            borderColor: getActivityColor(activity.type)
                          }}
                          variant="outlined"
                        />
                        {activity.source === 'Strava' && (
                          <Chip
                            size="small"
                            label="Strava"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: '#fc520020',
                              color: '#fc5200',
                              borderColor: '#fc5200'
                            }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography 
                          variant="body2" 
                          color="text.primary" 
                          component="span"
                          sx={{ mb: 0.5 }}
                        >
                          <strong>{activity.value}</strong> {activity.unit}
                        </Typography>
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDate(activity.date)}
                          </Typography>
                          
                          {activity.source === 'Strava' && activity.url && (
                            <Box 
                              component="span" 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(activity.url, '_blank');
                              }}
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Typography 
                                variant="caption" 
                                component="span"
                                sx={{ 
                                  color: '#fc5200',
                                  fontWeight: 'bold',
                                  textDecoration: 'none',
                                  cursor: 'pointer',
                                  '&:hover': { textDecoration: 'underline' },
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <OpenInNewIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                View on Strava
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </MotionListItem>
                {index < recentActivities.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
            {activities.length > limit && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button 
                  component={Link} 
                  href="/activities"
                  size="small" 
                  variant="text" 
                  sx={{ color: '#2da58e' }}
                >
                  See {activities.length - limit} more activities
                </Button>
              </Box>
            )}
          </List>
        )}
      </CardContent>
      <CreateActivityDialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
      />
    </MotionCard>
  );
}
