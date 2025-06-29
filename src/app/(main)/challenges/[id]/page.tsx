'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Update as UpdateIcon,
  ExitToApp as LeaveIcon,
  Add as JoinIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { useChallengeDetail } from '@/hooks/useChallengeDetail';
import { fadeInUp } from '@/utils/animations';

// Create motion components
const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionChip = motion(Chip);

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params?.id as string;

  const {
    challenge,
    loading,
    error,
    actionLoading,
    joinChallenge,
    leaveChallenge,
    updateProgress,
    getChallengeStatus,
    getDaysRemaining
  } = useChallengeDetail(challengeId);

  // Dialog states
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [updateProgressOpen, setUpdateProgressOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Set initial progress value when challenge loads
  React.useEffect(() => {
    if (challenge?.userParticipation) {
      setProgressValue(challenge.userParticipation.currentValue);
    }
  }, [challenge]);

  const handleJoinChallenge = async () => {
    const result = await joinChallenge();
    if (result.error) {
      setAlertMessage({ type: 'error', message: result.error });
    } else {
      setAlertMessage({ type: 'success', message: 'Successfully joined the challenge!' });
    }
    setJoinDialogOpen(false);
  };

  const handleLeaveChallenge = async () => {
    const result = await leaveChallenge();
    if (result.error) {
      setAlertMessage({ type: 'error', message: result.error });
    } else {
      setAlertMessage({ type: 'success', message: 'Left the challenge successfully.' });
    }
  };

  const handleUpdateProgress = async () => {
    const result = await updateProgress(progressValue, progressNotes);
    if (result.error) {
      setAlertMessage({ type: 'error', message: result.error });
    } else {
      setAlertMessage({ type: 'success', message: 'Progress updated successfully!' });
    }
    setUpdateProgressOpen(false);
    setProgressNotes('');
  };

  const formatStatusText = (status: string) => {
    if (!status || typeof status !== 'string') return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'ended': return 'error';
      case 'upcoming': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#2da58e' }} />
        </Container>
      </MainLayout>
    );
  }

  if (error || !challenge) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Challenge not found'}
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.back()}
            sx={{ color: '#2da58e' }}
          >
            Go Back
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Alert Messages */}
        {alertMessage && (
          <Alert 
            severity={alertMessage.type} 
            sx={{ mb: 3 }}
            onClose={() => setAlertMessage(null)}
          >
            {alertMessage.message}
          </Alert>
        )}

        {/* Header with Back Button */}
        <MotionBox 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ mb: 3 }}
        >
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.back()}
            sx={{ 
              color: '#2da58e',
              mb: 2,
              '&:hover': { bgcolor: 'rgba(45, 165, 142, 0.1)' }
            }}
          >
            Back to Challenges
          </Button>
        </MotionBox>

        {/* Hero Section */}
        <MotionCard 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ 
            mb: 4,
            background: challenge.backgroundImageUrl 
              ? `linear-gradient(135deg, rgba(45,165,142,0.9) 0%, rgba(27,125,107,0.9) 100%), url(${challenge.backgroundImageUrl})`
              : 'linear-gradient(135deg, #2da58e 0%, #1b7d6b 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              {/* Title and Status */}
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {challenge.title || 'Untitled Challenge'}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <MotionChip
                    label={formatStatusText(getChallengeStatus())}
                    color={getStatusColor(getChallengeStatus()) as 'success' | 'info' | 'error' | 'warning' | 'default'}
                    variant="filled"
                    whileHover={{ scale: 1.05 }}
                  />
                  <MotionChip
                    label={`${challenge.challengeType || 'Unknown'} Challenge`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    whileHover={{ scale: 1.05 }}
                  />
                  <MotionChip
                    label={challenge.difficultyLevel || 'Unknown'}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    whileHover={{ scale: 1.05 }}
                  />
                  {challenge.featured && (
                    <MotionChip
                      icon={<StarIcon />}
                      label="Featured"
                      sx={{ bgcolor: '#ffd700', color: '#000' }}
                      whileHover={{ scale: 1.05 }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Quick Stats */}
              <Stack direction="row" spacing={4} flexWrap="wrap">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlagIcon />
                  <Typography variant="body1" fontWeight="medium">
                    Goal: {challenge.targetValue || 0} {challenge.unit || 'units'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  <Typography variant="body1" fontWeight="medium">
                    {challenge.participantCount || 0} participants
                    {challenge.maxParticipants && ` / ${challenge.maxParticipants}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  <Typography variant="body1" fontWeight="medium">
                    {getDaysRemaining()} days left
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </MotionCard>

        {/* Main Content Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
          
          {/* Left Column - Challenge Info */}
          <Stack spacing={3}>
            
            {/* Description */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  About This Challenge
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {challenge.description || 'No description available.'}
                </Typography>
                
                {/* Challenge Details */}
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip
                    icon={<CalendarIcon />}
                    label={`${challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : 'No start date'} - ${challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : 'No end date'}`}
                    variant="outlined"
                  />
                  {challenge.activityType && (
                    <Chip
                      label={`Activity: ${challenge.activityType}`}
                      variant="outlined"
                    />
                  )}
                  {challenge.rewardType && (
                    <Chip
                      icon={<TrophyIcon />}
                      label={`${challenge.rewardType}: ${challenge.rewardValue}`}
                      variant="outlined"
                    />
                  )}
                </Stack>
              </CardContent>
            </MotionCard>

            {/* Rules */}
            {challenge.rules && (
              <MotionCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Rules & Guidelines
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {challenge.rules}
                  </Typography>
                </CardContent>
              </MotionCard>
            )}
          </Stack>

          {/* Right Column - Participation & Progress */}
          <Stack spacing={3}>
            
            {/* Participation Card */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              sx={{ 
                border: challenge.isParticipant ? '2px solid #2da58e' : '1px solid #e0e0e0',
                bgcolor: challenge.isParticipant ? '#f8fafc' : 'background.paper'
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                {challenge.isParticipant ? (
                  <Stack spacing={2}>
                    <Box>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#2da58e', 
                          width: 56, 
                          height: 56, 
                          mx: 'auto',
                          mb: 1
                        }}
                      >
                        <TrophyIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h6" color="success.main" fontWeight="bold">
                        You&apos;re Participating!
                      </Typography>
                    </Box>

                    {/* Progress Display */}
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {challenge.currentProgress || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        of {challenge.targetValue || 0} {challenge.unit || 'units'}
                      </Typography>
                      
                      <LinearProgress
                        variant="determinate"
                        value={challenge.progressPercentage || 0}
                        sx={{ 
                          mt: 1, 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(45, 165, 142, 0.1)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#2da58e' }
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                        {challenge.progressPercentage || 0}% Complete
                      </Typography>
                      
                      {challenge.userParticipation?.completed && (
                        <Chip
                          label="🏆 Completed!"
                          color="success"
                          sx={{ mt: 1, fontWeight: 'bold' }}
                        />
                      )}
                    </Paper>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<UpdateIcon />}
                        onClick={() => setUpdateProgressOpen(true)}
                        disabled={actionLoading || getChallengeStatus() !== 'active'}
                        sx={{ 
                          bgcolor: '#2da58e', 
                          '&:hover': { bgcolor: '#1b7d6b' },
                          flex: 1
                        }}
                      >
                        Update Progress
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleLeaveChallenge}
                        disabled={actionLoading}
                        startIcon={<LeaveIcon />}
                      >
                        Leave
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#e0e0e0', 
                        width: 56, 
                        height: 56, 
                        mx: 'auto'
                      }}
                    >
                      <JoinIcon fontSize="large" />
                    </Avatar>
                    
                    {getChallengeStatus() === 'active' ? (
                      <>
                        {challenge.maxParticipants && challenge.participantCount >= challenge.maxParticipants ? (
                          <Alert severity="warning">
                            Challenge is full ({challenge.maxParticipants} participants)
                          </Alert>
                        ) : (
                          <>
                            <Typography variant="h6" gutterBottom>
                              Ready to Join?
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Take on this challenge and track your progress with others.
                            </Typography>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<JoinIcon />}
                              onClick={() => setJoinDialogOpen(true)}
                              disabled={actionLoading}
                              sx={{ 
                                bgcolor: '#2da58e',
                                '&:hover': { bgcolor: '#1b7d6b' },
                                py: 1.5
                              }}
                            >
                              Join Challenge
                            </Button>
                          </>
                        )}
                      </>
                    ) : getChallengeStatus() === 'upcoming' ? (
                      <Alert severity="info">
                        Challenge starts on {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : 'Unknown date'}
                      </Alert>
                    ) : getChallengeStatus() === 'ended' ? (
                      <Alert severity="error">
                        Challenge has ended
                      </Alert>
                    ) : (
                      <Alert severity="info">
                        Challenge is {formatStatusText(getChallengeStatus())}
                      </Alert>
                    )}
                  </Stack>
                )}
              </CardContent>
            </MotionCard>

            {/* Challenge Stats */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Challenge Stats
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Participants</Typography>
                    <Typography variant="body2" fontWeight="medium">{challenge.participantCount || 0}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Challenge Type</Typography>
                    <Typography variant="body2" fontWeight="medium">{challenge.challengeType || 'Unknown'}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Difficulty</Typography>
                    <Typography variant="body2" fontWeight="medium">{challenge.difficultyLevel || 'Unknown'}</Typography>
                  </Box>
                  {challenge.maxParticipants && (
                    <>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Max Participants</Typography>
                        <Typography variant="body2" fontWeight="medium">{challenge.maxParticipants}</Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </MotionCard>
          </Stack>
        </Box>

        {/* Dialogs */}
        <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2da58e', color: 'white' }}>
            Join Challenge
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
                             Are you ready to take on the &quot;{challenge?.title || 'this'}&quot; challenge?
            </Typography>
            <Typography variant="body2" color="text.secondary">
                              By joining, you&apos;ll be able to track your progress and compete with other participants.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleJoinChallenge}
              variant="contained"
              disabled={actionLoading}
              sx={{ bgcolor: '#2da58e', '&:hover': { bgcolor: '#1b7d6b' } }}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Join Challenge'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={updateProgressOpen} onClose={() => setUpdateProgressOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2da58e', color: 'white' }}>
            Update Progress
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2}>
              <TextField
                autoFocus
                label={`Current Value (${challenge?.unit || 'units'})`}
                type="number"
                fullWidth
                value={progressValue}
                onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Notes (optional)"
                multiline
                rows={3}
                fullWidth
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                placeholder="Add any notes about your progress..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setUpdateProgressOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateProgress}
              variant="contained"
              disabled={actionLoading}
              sx={{ bgcolor: '#2da58e', '&:hover': { bgcolor: '#1b7d6b' } }}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Update Progress'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
} 