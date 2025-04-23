import React from 'react';
import { 
  Grid, 
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

export default function DashboardPage() {
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Welcome back! Here's an overview of your fitness journey.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              title="Workouts" 
              value="24" 
              subtitle="This month" 
              icon={<FitnessCenterIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              title="Distance" 
              value="42.5 km" 
              subtitle="This month" 
              icon={<RunIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              title="Active Days" 
              value="18" 
              subtitle="This month" 
              icon={<TimelineIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              title="Challenges" 
              value="3" 
              subtitle="In progress" 
              icon={<ChallengesIcon />}
              color="warning"
            />
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <RecentActivities activities={[]} />
          </Grid>

          {/* Upcoming Challenges */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Upcoming Challenges
                  </Typography>
                  <Button size="small" color="primary">View All</Button>
                </Box>
                
                <Box sx={{ p: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2, mb: 2 }}>
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
                    <Button size="small" variant="outlined">Join</Button>
                  </Box>
                </Box>
                
                <Box sx={{ p: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    10K Running Challenge
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Run a total of 10K within a week
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Starts in 5 days
                    </Typography>
                    <Button size="small" variant="outlined">Join</Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Overview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Weekly Progress
                </Typography>
                
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Chart component will be implemented here to show weekly progress
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
}
