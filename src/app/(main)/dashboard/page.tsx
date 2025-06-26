'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Container,
  Skeleton,
  Alert
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
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useChallenges } from '@/hooks/useChallenges';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { challenges, loading: challengesLoading } = useChallenges();
  const router = useRouter();

  // Filter upcoming challenges (start date in the future)
  const upcomingChallenges = challenges
    .filter(challenge => new Date(challenge.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 2);

  const formatDistance = (distance: number) => {
    if (distance >= 1) {
      return `${distance} km`;
    }
    return `${(distance * 1000).toFixed(0)} m`;
  };

  const getTimeUntilStart = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Starts today';
    if (diffDays === 1) return 'Starts tomorrow';
    return `Starts in ${diffDays} days`;
  };

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

        {statsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {statsError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {/* Stats Cards */}
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            {statsLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard 
                title="Activities" 
                value={stats.last365DaysActivities.toString()}
                subtitle="Last 365 days" 
                icon={<FitnessCenterIcon />}
                color="primary"
              />
            )}
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            {statsLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard 
                title="Distance" 
                value={formatDistance(stats.last365DaysDistance)}
                subtitle="Last 365 days" 
                icon={<RunIcon />}
                color="info"
              />
            )}
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            {statsLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard 
                title="Active Days" 
                value={stats.last365DaysActiveDays.toString()}
                subtitle="Last 365 days" 
                icon={<TimelineIcon />}
                color="success"
              />
            )}
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, px: 1.5, mb: 3 }}>
            {statsLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard 
                title="Challenges" 
                value={stats.challengesCount.toString()}
                subtitle="In progress" 
                icon={<ChallengesIcon />}
                color="warning"
              />
            )}
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
                  <Button 
                    size="small" 
                    color="primary" 
                    sx={{ color: '#2da58e' }}
                    onClick={() => router.push('/challenges')}
                  >
                    View All
                  </Button>
                </Box>
                
                {challengesLoading ? (
                  <Box>
                    {[1, 2].map((i) => (
                      <Box key={i} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                      </Box>
                    ))}
                  </Box>
                ) : upcomingChallenges.length > 0 ? (
                  upcomingChallenges.map((challenge) => (
                    <Box 
                      key={challenge.id}
                      sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(45, 165, 142, 0.1)', 
                        borderRadius: 2, 
                        mb: 2,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {challenge.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {challenge.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {getTimeUntilStart(challenge.startDate)}
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ borderColor: '#2da58e', color: '#2da58e' }}
                          onClick={() => router.push(`/challenges/${challenge.id}`)}
                        >
                          View
                        </Button>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No upcoming challenges
                    </Typography>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      sx={{ borderColor: '#2da58e', color: '#2da58e' }}
                      onClick={() => router.push('/challenges')}
                    >
                      Browse Challenges
                    </Button>
                  </Box>
                )}
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
