'use client';

import React from 'react';
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
  useTheme
} from '@mui/material';
import { 
  DirectionsRun as RunIcon,
  FitnessCenter as WorkoutIcon,
  Pool as SwimIcon,
  DirectionsBike as BikeIcon,
  DirectionsWalk as WalkIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Create motion components
const MotionCard = motion(Card);
const MotionListItem = motion(ListItem);

type Activity = {
  id: string;
  type: 'workout' | 'run' | 'swim' | 'bike' | 'walk';
  name: string;
  date: string;
  value: number;
  unit: string;
  timeAgo: string;
};

interface RecentActivitiesProps {
  userId?: string;
}

export default function RecentActivities({ userId }: RecentActivitiesProps) {
  const theme = useTheme();
  const { activities, loading, error } = useActivities(userId);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <WorkoutIcon />;
      case 'run':
        return <RunIcon />;
      case 'swim':
        return <SwimIcon />;
      case 'bike':
        return <BikeIcon />;
      case 'walk':
        return <WalkIcon />;
      default:
        return <TimeIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'workout':
        return theme.palette.primary.main;
      case 'run':
        return '#f59e0b'; // amber
      case 'swim':
        return '#3b82f6'; // blue
      case 'bike':
        return '#10b981'; // green
      case 'walk':
        return '#8b5cf6'; // purple
      default:
        return theme.palette.secondary.main;
    }
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

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <MotionCard 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      sx={{ height: '100%' }}
    >
      <CardHeader 
        title="Recent Activities" 
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={
          <Link href="/activities" passHref>
            <Button size="small" color="primary">View All</Button>
          </Link>
        }
      />
      <Divider />
      <CardContent sx={{ px: 0, py: 0 }}>
        <List 
          component={motion.ul}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ padding: 0 }}
        >
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <MotionListItem 
                variants={itemVariants}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                sx={{ px: 2, py: 1.5 }}
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
                    <Typography variant="subtitle2" fontWeight={600}>
                      {activity.name}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="body2" 
                        color="text.primary" 
                        component="span"
                        sx={{ mb: 0.5 }}
                      >
                        {activity.value} {activity.unit}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {activity.timeAgo}
                      </Typography>
                    </Box>
                  }
                />
              </MotionListItem>
              {index < activities.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </MotionCard>
  );
}
