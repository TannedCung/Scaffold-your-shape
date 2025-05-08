'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  FitnessCenter as WorkoutIcon,
  EmojiEvents as AchievementIcon,
  Groups as ClubsIcon,
  Timeline as StatsIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Add as AddIcon
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import EditProfileForm from '@/components/profile/EditProfileForm';
import RecentActivities from '@/components/dashboard/RecentActivities';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';
import StravaActivityImporter from '@/components/strava/StravaActivityImporter';
import { useSession } from 'next-auth/react';
import { useUser } from '@/hooks/useUser';
import { useStrava } from '@/hooks/useStrava';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Create simplified type for profile to avoid TypeScript errors
type SimpleProfile = {
  id: string;
  name?: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
};

// Profile content component with searchParams access
function ProfileContent() {
  const { data: session, status: sessionStatus } = useSession();
  const { user, profile, loading: profileLoading } = useUser();
  const { connected: isConnectedToStrava, loading: stravaLoading, error: stravaError, connectToStrava, disconnectFromStrava } = useStrava();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Determine the user ID from either NextAuth session or Supabase user
  const userId = session?.user?.id || user?.id;
  
  // Check if we're still loading authentication
  const isLoading = sessionStatus === 'loading' || profileLoading || stravaLoading;

  useEffect(() => {
    // Check for Strava callback params
    const stravaConnected = searchParams?.get('strava_connected');
    if (stravaConnected === 'true') {
      setSuccessMessage('Successfully connected to Strava!');
      setShowSuccess(true);
    }
  }, [searchParams]);

  // Handle the refresh of activities after Strava import
  const handleStravaImport = (count: number) => {
    setSuccessMessage(`Successfully imported ${count} activities from Strava!`);
    setShowSuccess(true);
    router.refresh();
  };

  // Create safe profile object for the form
  const safeProfile: SimpleProfile | undefined = userId ? {
    id: userId,
    name: profile?.name || session?.user?.name || '',
    email: profile?.email || session?.user?.email || '',
    bio: profile?.bio,
    avatar_url: profile?.avatar_url || session?.user?.image || undefined
  } : undefined;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Profile Header */}
      <Card sx={{ mb: 4, overflow: 'visible' }}>
        <Box 
          sx={{ 
            height: 200, 
            background: 'linear-gradient(135deg, #2da58e 0%, #1a8a73 100%)',
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              <Avatar 
                src={profile?.avatar_url || session?.user?.image || undefined}
                alt="User Profile"
                sx={{ 
                  width: 160,
                  height: 160,
                  border: '4px solid white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              />
              <Tooltip title="Edit Profile">
                <IconButton 
                  onClick={() => setIsEditProfileOpen(true)}
                  sx={{ 
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              {/* Strava connect button */}
              {stravaError && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 2, width: '100%' }}
                >
                  {stravaError}
                </Alert>
              )}
              
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                gap: 2,
                width: '100%',
              }}>
                {/* Strava Logo */}
                <Box 
                  onClick={!stravaLoading ? (isConnectedToStrava ? undefined : connectToStrava) : undefined}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: stravaLoading || isConnectedToStrava ? 'default' : 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: stravaLoading || isConnectedToStrava ? 'none' : 'scale(1.03)'
                    },
                    opacity: isConnectedToStrava ? 0.6 : 1,
                    position: 'relative'
                  }}
                >
                  <Image 
                    src="/btn_strava_connect_with_white.svg" 
                    alt="Connect to Strava" 
                    width={200}
                    height={48} 
                    priority
                  />
                  {isConnectedToStrava && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        Connected
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Connection Status Circular Button */}
                <Button
                  variant={isConnectedToStrava ? "outlined" : "contained"}
                  onClick={isConnectedToStrava ? disconnectFromStrava : connectToStrava}
                  sx={{ 
                    backgroundColor: isConnectedToStrava ? 'transparent' : '#2da58e',
                    borderColor: isConnectedToStrava ? '#2da58e' : 'transparent',
                    color: isConnectedToStrava ? '#2da58e' : 'white',
                    '&:hover': { 
                      backgroundColor: isConnectedToStrava ? 'rgba(45, 165, 142, 0.04)' : '#259a83',
                      borderColor: isConnectedToStrava ? '#2da58e' : 'transparent'
                    },
                    minWidth: 'unset',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    p: 0
                  }}
                  disabled={stravaLoading}
                >
                  {stravaLoading ? (
                    <CircularProgress size={24} sx={{ color: 'inherit' }} />
                  ) : isConnectedToStrava ? (
                    <LinkOffIcon />
                  ) : (
                    <LinkIcon />
                  )}
                </Button>
              </Box>
              
              {/* Strava Activity Importer - only shown when connected to Strava */}
              {isConnectedToStrava && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <StravaActivityImporter onImportComplete={handleStravaImport} />
                </Box>
              )}
            </Box>
            <Box>
              <Box sx={{ mt: { xs: 2, md: 10 }, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {profile?.name || session?.user?.name || 'Your Profile'}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {profile?.email || session?.user?.email || 'User'} • Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {profile?.bio || 'Add a bio to tell others about yourself and your fitness journey.'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Left Column - Activities */}
        <Box>
          {userId ? (
            <RecentActivities userId={userId} limit={10} />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
              <Typography variant="body1" color="text.secondary">
                You need to be logged in to view your activities.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Column - Sidebar */}
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
        </Box>
      </Box>

      {/* Dialogs */}
      <EditProfileForm 
        profile={safeProfile}
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <CreateActivityDialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
      />
      
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

// Main profile page component with Suspense
export default function ProfilePage() {
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        }>
          <ProfileContent />
        </Suspense>
      </Container>
    </MainLayout>
  );
}
