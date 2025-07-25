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
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  FitnessCenter as WorkoutIcon,
  Groups as ClubsIcon,
  Timeline as StatsIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Person as MemberIcon,
  BarChart as ChartIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import EditProfileForm from '@/components/profile/EditProfileForm';
import RecentActivities from '@/components/dashboard/RecentActivities';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';
import StravaActivityImporter from '@/components/strava/StravaActivityImporter';
import { useSession } from 'next-auth/react';
import { useUser } from '@/hooks/useUser';
import { useStrava } from '@/hooks/useStrava';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useUserClubs } from '@/hooks/useUserClubs';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import MonthlyActivityChart from '@/components/profile/charts/MonthlyActivityChart';
import ActivityTypeChart from '@/components/profile/charts/ActivityTypeChart';
import WeeklyActivityChart from '@/components/profile/charts/WeeklyActivityChart';
import DistanceOverTimeChart from '@/components/profile/charts/DistanceOverTimeChart';

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
  
  // Get profile statistics
  const { stats, loading: statsLoading, error: statsError } = useProfileStats(userId);
  
  // Get user clubs
  const { userClubs, loading: clubsLoading, error: clubsError } = useUserClubs();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Stats sub-tab state
  const [statsSubTab, setStatsSubTab] = useState(0);
  
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

  // Utility function to format distance
  const formatDistance = (distance: number) => {
    if (distance >= 1) {
      return `${distance.toFixed(2)}km`;
    }
    return `${(distance * 1000).toFixed(0)}m`;
  };

  // Utility function to calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
              <Box sx={{ position: 'relative' }}>
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
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      border: '2px solid white',
                      width: 36,
                      height: 36,
                      zIndex: 1
                    }}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
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
                <Tooltip 
                  title={isConnectedToStrava ? "Connected to Strava" : "Connect your Strava account"}
                  arrow
                  placement="top"
                >
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
                </Tooltip>
                
                {/* Connection Status Button */}
                {isConnectedToStrava && (
                  <Tooltip 
                    title="Disconnect from Strava"
                    arrow
                    placement="bottom"
                  >
                    <Button
                      variant="outlined"
                      onClick={disconnectFromStrava}
                      sx={{ 
                        borderColor: '#fc4c02',
                        color: '#fc4c02',
                        '&:hover': { 
                          backgroundColor: 'rgba(252, 76, 2, 0.04)',
                          borderColor: '#fc4c02'
                        },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.8rem',
                        px: 2,
                        py: 0.5
                      }}
                      disabled={stravaLoading}
                      size="small"
                    >
                      {stravaLoading ? (
                        <CircularProgress size={16} sx={{ color: 'inherit' }} />
                      ) : (
                        <>
                          <LinkOffIcon fontSize="small" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </Tooltip>
                )}
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
          {statsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {statsError}
            </Alert>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 3,
              mb: 3,
            }}
          >
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(45, 165, 142, 0.1)', borderRadius: 2 }}>
              {statsLoading ? (
                <CircularProgress size={24} sx={{ mb: 1 }} />
              ) : (
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stats.totalActivities}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Activities
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2 }}>
              {statsLoading ? (
                <CircularProgress size={24} sx={{ mb: 1 }} />
              ) : (
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  {formatDistance(stats.totalDistance)}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Distance
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
              {statsLoading ? (
                <CircularProgress size={24} sx={{ mb: 1 }} />
              ) : (
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981' }}>
                  {stats.totalChallenges}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Challenges
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
              {statsLoading ? (
                <CircularProgress size={24} sx={{ mb: 1 }} />
              ) : (
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                  {stats.totalClubs}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Clubs
              </Typography>
            </Box>
          </Box>
        </CardContent>
        
        {/* Profile Tabs */}
        <Box sx={{ px: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<WorkoutIcon />} label="Activities" />
            <Tab icon={<ClubsIcon />} label="Clubs" />
            <Tab icon={<StatsIcon />} label="Stats" />
          </Tabs>
        </Box>
        <Divider />
      </Card>

      {/* Profile Content */}
      <Box>
        {/* Activities Tab */}
        {activeTab === 0 && (
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
                  
                  {statsLoading ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : stats.activeChallenges.length > 0 ? (
                    <>
                      {stats.activeChallenges.map((challenge) => (
                        <Box key={challenge.id} sx={{ mb: 3, '&:last-child': { mb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {challenge.name}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {challenge.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={challenge.progress} 
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                          />
                                                            <Typography variant="body2" color="text.secondary">
                                    {challenge.progress}% complete • {getDaysRemaining(challenge.endDate)} days left
                                  </Typography>
                        </Box>
                      ))}
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No active challenges
                      </Typography>
                    </Box>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ mt: 1 }}
                    onClick={() => router.push('/challenges')}
                  >
                    View All Challenges
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Clubs Tab */}
        {activeTab === 1 && (
          <Box>
            {clubsError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {clubsError}
              </Alert>
            )}
            
            {clubsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : userClubs.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
                {userClubs.map((membership) => (
                  <Card key={membership.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                    <Box
                      sx={{
                        height: 200,
                        background: membership.club?.imageUrl 
                          ? `url(${membership.club.imageUrl})` 
                          : 'linear-gradient(135deg, #2da58e 0%, #1a8a73 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        p: 2,
                      }}
                      onClick={() => router.push(`/club/${membership.clubId}`)}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {membership.role === 'admin' ? (
                          <AdminIcon fontSize="small" color="primary" />
                        ) : (
                          <MemberIcon fontSize="small" color="action" />
                        )}
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                          {membership.role}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {membership.club?.name || 'Unknown Club'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {membership.club?.description || 'No description available'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ClubsIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {membership.club?.memberCount || 0} members
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Joined {new Date(membership.joinedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <CardContent>
                  <ClubsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Clubs Joined Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Join clubs to connect with other fitness enthusiasts and participate in group challenges.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => router.push('/club')}
                    startIcon={<AddIcon />}
                  >
                    Browse Clubs
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Stats Tab */}
        {activeTab === 2 && (
          <Box>
            {/* Stats Sub-tabs */}
            <Card sx={{ mb: 4 }}>
              <Box sx={{ px: 3, pt: 2 }}>
                <Tabs value={statsSubTab} onChange={(_, newValue) => setStatsSubTab(newValue)}>
                  <Tab label="Overview" />
                  <Tab label="Monthly Trend" />
                  <Tab label="Activity Types" />
                  <Tab label="Weekly Pattern" />
                  <Tab label="Distance Progress" />
                </Tabs>
              </Box>
              <Divider />
              
              <CardContent>
                {/* Overview Tab */}
                {statsSubTab === 0 && (
                  <Box>
                    {/* Statistics Tables */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
                      {/* Activities Statistics Table */}
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkoutIcon />
                          Activities Statistics
                        </Typography>
                        <Card variant="outlined">
                          <Box sx={{ overflow: 'hidden' }}>
                            {statsLoading ? (
                              <Box sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress />
                              </Box>
                            ) : (
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                                  <Typography variant="body1" fontWeight={500}>Total Activities</Typography>
                                  <Typography variant="h6" fontWeight="bold" color="primary">
                                    {stats.totalActivities}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                                  <Typography variant="body1" fontWeight={500}>Total Distance</Typography>
                                  <Typography variant="h6" fontWeight="bold" color="secondary">
                                    {formatDistance(stats.totalDistance)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                                  <Typography variant="body1" fontWeight={500}>Average Distance</Typography>
                                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#10b981' }}>
                                    {stats.totalActivities > 0 ? formatDistance(stats.totalDistance / stats.totalActivities) : '0.00km'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                                  <Typography variant="body1" fontWeight={500}>Challenges Participated</Typography>
                                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                                    {stats.totalChallenges}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Card>
                      </Box>

                      {/* Clubs Statistics Table */}
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ClubsIcon />
                          Clubs Joined
                        </Typography>
                        <Card variant="outlined">
                          <Box sx={{ overflow: 'hidden' }}>
                            {clubsLoading ? (
                              <Box sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress />
                              </Box>
                            ) : (
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                                  <Typography variant="body1" fontWeight={500}>Total Clubs</Typography>
                                  <Typography variant="h6" fontWeight="bold" color="primary">
                                    {userClubs.length}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                                  <Typography variant="body1" fontWeight={500}>Admin Roles</Typography>
                                  <Typography variant="h6" fontWeight="bold" color="secondary">
                                    {userClubs.filter(membership => membership.role === 'admin').length}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                                  <Typography variant="body1" fontWeight={500}>Member Roles</Typography>
                                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#10b981' }}>
                                    {userClubs.filter(membership => membership.role === 'member').length}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                                  <Typography variant="body1" fontWeight={500}>Total Network Size</Typography>
                                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                                    {userClubs.reduce((total, membership) => total + (membership.club?.memberCount || 0), 0)}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Card>
                      </Box>
                    </Box>

                    {/* Challenge Progress Section */}
                    {stats.activeChallenges.length > 0 && (
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon />
                          Current Challenge Progress
                        </Typography>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ space: 2 }}>
                              {stats.activeChallenges.map((challenge) => (
                                <Box key={challenge.id} sx={{ py: 2, borderBottom: '1px solid #e0e0e0', '&:last-child': { borderBottom: 'none' } }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body1" fontWeight={500}>
                                      {challenge.name}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight="bold">
                                      {challenge.progress}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={challenge.progress} 
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                  />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {challenge.currentValue} / {challenge.targetValue} {challenge.unit}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {getDaysRemaining(challenge.endDate)} days left
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Monthly Trend Chart */}
                {statsSubTab === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ChartIcon />
                      Monthly Activity Trend
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Track your activity count and distance over the last 12 months
                    </Typography>
                    <MonthlyActivityChart 
                      data={stats.monthlyActivityData} 
                      loading={statsLoading} 
                    />
                  </Box>
                )}

                {/* Activity Types Chart */}
                {statsSubTab === 2 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkoutIcon />
                      Activity Type Distribution
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      See the breakdown of your different activity types
                    </Typography>
                    <ActivityTypeChart 
                      data={stats.activityTypeDistribution} 
                      loading={statsLoading} 
                    />
                  </Box>
                )}

                {/* Weekly Pattern Chart */}
                {statsSubTab === 3 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon />
                      Weekly Activity Pattern
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Discover which days of the week you&apos;re most active
                    </Typography>
                    <WeeklyActivityChart 
                      data={stats.weeklyActivityData} 
                      loading={statsLoading} 
                    />
                  </Box>
                )}

                {/* Distance Progress Chart */}
                {statsSubTab === 4 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatsIcon />
                      Distance Over Time (Last 30 Days)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Monitor your daily distance and cumulative progress
                    </Typography>
                    <DistanceOverTimeChart 
                      data={stats.distanceOverTime} 
                      loading={statsLoading} 
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
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
