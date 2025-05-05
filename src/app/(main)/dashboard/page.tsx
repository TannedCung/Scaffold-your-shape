'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Container
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as RunIcon,
  Timeline as TimelineIcon,
  EmojiEvents as ChallengesIcon
} from '@mui/icons-material';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivities from '@/components/dashboard/RecentActivities';
import MainLayout from '@/components/layout/MainLayout';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';

export default function DashboardPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Welcome back! Here&apos;s an overview of your fitness journey.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {/* Stats Cards */}
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            <StatCard 
              title="Workouts" 
              value="24" 
              subtitle="This month" 
              icon={<FitnessCenterIcon />}
              color="primary"
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            <StatCard 
              title="Distance" 
              value="42.5 km" 
              subtitle="This month" 
              icon={<RunIcon />}
              color="info"
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            <StatCard 
              title="Active Days" 
              value="18" 
              subtitle="This month" 
              icon={<TimelineIcon />}
              color="success"
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            <StatCard 
              title="Challenges" 
              value="3" 
              subtitle="In progress" 
              icon={<ChallengesIcon />}
              color="warning"
            />
          </Box>

          {/* Recent Activity */}
          <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 3 }}>
            <RecentActivities />
          </Box>

          {/* Upcoming Challenges */}
          <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Upcoming Challenges
                  </Typography>
                  <Button size="small" color="primary" sx={{ color: '#2da58e' }}>View All</Button>
                </Box>
                
                <Box sx={{ p: 2, backgroundColor: 'rgba(45, 165, 142, 0.1)', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    30-Day Push-up Challenge
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Complete 100 push-ups every day for 30 days
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Starts in 2 days
                    </Typography>
                    <Button size="small" variant="outlined" sx={{ borderColor: '#2da58e', color: '#2da58e' }}>Join</Button>
                  </Box>
                </Box>
                
                <Box sx={{ p: 2, backgroundColor: 'rgba(45, 165, 142, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    5K Running Event
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Virtual 5K running challenge with friends
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Starts in 5 days
                    </Typography>
                    <Button size="small" variant="outlined" sx={{ borderColor: '#2da58e', color: '#2da58e' }}>Join</Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Create Activity Dialog */}
        <CreateActivityDialog 
          open={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)} 
        />
      </Container>
    </MainLayout>
  );
}
