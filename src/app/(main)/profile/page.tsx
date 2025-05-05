'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Avatar, 
  Button, 
  Tabs, 
  Tab, 
  Divider,
  LinearProgress,
  Stack,
  Chip
} from '@mui/material';
import { 
  FitnessCenter as WorkoutIcon,
  EmojiEvents as AchievementIcon,
  Groups as ClubsIcon,
  Timeline as StatsIcon
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import EditProfileForm from '@/components/profile/EditProfileForm';
import ActivityList from '@/components/activities/ActivityList';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';
import AddIcon from '@mui/icons-material/Add';

export default function ProfilePage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // TODO: Replace hardcoded userId with actual session user id from next-auth
  const userId = 'mock-user-id';
  // TODO: Replace hardcoded profile object with fetched profile data
  const profile = { id: userId, email: 'user@email.com', name: 'John Doe', bio: 'Fitness enthusiast focused on strength training and running. Working towards my first marathon!', avatar_url: 'https://source.unsplash.com/random/400x400/?portrait' };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <Card sx={{ mb: 4, overflow: 'visible' }}>
          <Box 
            sx={{ 
              height: 200, 
              background: '#2da58e',
              position: 'relative'
            }}
          />
          <CardContent 
            sx={{ 
              position: 'relative', 
              mt: -10,
              pb: 3
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '3fr 9fr' },
                gap: 3,
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Avatar 
                  src={profile.avatar_url}
                  alt="User Profile"
                  sx={{ 
                    width: 160,
                    height: 160,
                    border: '4px solid white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ mt: { xs: 2, md: 10 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-end' }, justifyContent: 'space-between' }}>
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                      {profile.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      @johndoe • Joined April 2025
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {profile.bio}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                    <EditProfileForm profile={profile} />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 3,
                mb: 3,
              }}
            >
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(45, 165, 142, 0.1)', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Workouts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  352km
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Distance
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981' }}>
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Challenges
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                  4
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clubs
                </Typography>
              </Box>
            </Box>
          </CardContent>
          
          {/* Profile Tabs */}
          <Box sx={{ px: 3 }}>
            <Tabs value={0}>
              <Tab icon={<WorkoutIcon />} label="Activities" />
              <Tab icon={<AchievementIcon />} label="Achievements" />
              <Tab icon={<ClubsIcon />} label="Clubs" />
              <Tab icon={<StatsIcon />} label="Stats" />
            </Tabs>
          </Box>
          <Divider />
        </Card>

        {/* Profile Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Activity Feed */}
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Recent Activities
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
                sx={{
                  backgroundColor: '#2da58e',
                  '&:hover': { backgroundColor: '#1a8a73' },
                  mb: 2
                }}
              >
                Log Activity
              </Button>
              <CreateActivityDialog 
                open={isCreateDialogOpen} 
                onClose={() => setIsCreateDialogOpen(false)} 
              />
            </Box>
            <ActivityList userId={userId} />
          </Box>

          {/* Sidebar Content */}
          <Box>
            {/* Current Challenges */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Current Challenges
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      30-Day Push-up Challenge
                    </Typography>
                    <Typography variant="body2" color="primary">
                      40%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={40} 
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    1,200 / 3,000 push-ups • 18 days left
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      Cycling Expedition
                    </Typography>
                    <Typography variant="body2" color="primary">
                      40%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={40} 
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    120 / 300 km • 8 days left
                  </Typography>
                </Box>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 1 }}
                >
                  View All Challenges
                </Button>
              </CardContent>
            </Card>
            
            {/* Achievements */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Achievements
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
                  <Chip 
                    icon={<AchievementIcon />} 
                    label="First 5K" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<AchievementIcon />} 
                    label="10K Steps Daily" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<AchievementIcon />} 
                    label="100 Push-ups" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<AchievementIcon />} 
                    label="First Challenge" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<AchievementIcon />} 
                    label="Club Joined" 
                    color="primary" 
                    variant="outlined"
                  />
                </Stack>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                >
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
            
            {/* My Clubs */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  My Clubs
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src="https://source.unsplash.com/random/100x100/?running" 
                      alt="Morning Runners"
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Morning Runners
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        45 members
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src="https://source.unsplash.com/random/100x100/?workout" 
                      alt="Weekend Warriors"
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Weekend Warriors
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        94 members
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                >
                  View All Clubs
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
