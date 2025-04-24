'use client';

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
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
  activities: Activity[];
}

export default function RecentActivities({ activities = [] }: RecentActivitiesProps) {
  const theme = useTheme();

  // Use sample data if no activities are provided
  const sampleActivities: Activity[] = [
    { 
      id: '1', 
      type: 'workout', 
      name: 'Push-ups', 
      date: '2025-04-23T10:30:00', 
      value: 50, 
      unit: 'reps',
      timeAgo: '2 hours ago'
    },
    { 
      id: '2', 
      type: 'run', 
      name: 'Morning Run', 
      date: '2025-04-23T07:15:00', 
      value: 5000, 
      unit: 'meters',
      timeAgo: '5 hours ago'
    },
    { 
      id: '3', 
      type: 'workout', 
      name: 'Pull-ups', 
      date: '2025-04-22T18:45:00', 
      value: 15, 
      unit: 'reps',
      timeAgo: '1 day ago'
    },
    { 
      id: '4', 
      type: 'swim', 
      name: 'Evening Swim', 
      date: '2025-04-22T19:30:00', 
      value: 1000, 
      unit: 'meters',
      timeAgo: '1 day ago'
    },
    { 
      id: '5', 
      type: 'bike', 
      name: 'Weekend Ride', 
      date: '2025-04-21T10:00:00', 
      value: 15000, 
      unit: 'meters',
      timeAgo: '2 days ago'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : sampleActivities;

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

  return (
    <Card>
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
        <List disablePadding>
          {displayActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                <ListItemAvatar>
                  <Avatar 
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
              </ListItem>
              {index < displayActivities.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
