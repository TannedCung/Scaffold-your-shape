'use client';

import React from 'react';
import { useActivities } from '@/hooks/useActivities';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Box,
  Button,
} from '@mui/material';
import { 
  Add as AddIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ActivityList from '../activities/ActivityList';
import CreateActivityDialog from '../activities/CreateActivityDialog';
import { useSession } from 'next-auth/react';

const MotionCard = motion(Card);

interface RecentActivitiesProps {
  userId?: string;
  limit?: number;
}

export default function RecentActivities({ userId, limit = 5 }: RecentActivitiesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { activities, loading, error, refresh } = useActivities(userId);
  const { status } = useSession();

  const recentActivities = activities.slice(0, limit);
  const isAuthLoading = status === 'loading';

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
      <CardContent>
        <ActivityList
          activities={recentActivities}
          loading={loading || isAuthLoading}
          error={error}
          showSocial={true}
          userId={userId}
        />
      </CardContent>
      <CreateActivityDialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        onSuccess={refresh}
      />
    </MotionCard>
  );
}
