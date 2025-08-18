'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
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
  useTheme
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
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useChallengeDetail } from '@/hooks/useChallengeDetail';
import { fadeInUp } from '@/utils/animations';

interface ChallengeHeaderProps {
  challengeId: string;
}

const MotionCard = motion(Card);
const MotionChip = motion(Chip);

export default function ChallengeHeader({ challengeId }: ChallengeHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  
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
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);



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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error || !challenge) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Challenge not found'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
          sx={{ color: theme.palette.primary.main }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <>
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

      {/* Hero Section */}
      <MotionCard 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ 
          mb: 4,
          background: challenge.backgroundImageUrl 
            ? `linear-gradient(135deg, rgba(45,165,142,0.9) 0%, rgba(27,125,107,0.9) 100%), url(${challenge.backgroundImageUrl})`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Back Button integrated in header */}
        <IconButton
          onClick={() => router.back()}
          sx={{
            position: 'absolute',
            top: 30,
            left: 20,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            zIndex: 2
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <CardContent sx={{ p: 4, pt: 5, pl: 6 }}>
          <Stack spacing={3}>
            {/* Title and Status */}
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {/* 16 px to the right of the title */}
                <Box sx={{ ml: 3 }}>
                  {challenge.title || 'Untitled Challenge'}
                </Box>
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

            {/* Progress for Participants */}
            {challenge.isParticipant && (
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2, 
                p: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                  Your Progress: {challenge.currentProgress || 0} / {challenge.targetValue || 0} {challenge.unit || 'units'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={challenge.progressPercentage || 0}
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#fff' }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">
                    {challenge.progressPercentage || 0}% Complete
                  </Typography>
                  {challenge.userParticipation?.completed && (
                    <Chip
                      label="🏆 Completed!"
                      size="small"
                      sx={{ bgcolor: '#ffd700', color: '#000', fontWeight: 'bold' }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {challenge.isParticipant ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLeaveChallenge}
                  disabled={actionLoading}
                  startIcon={<LeaveIcon />}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': { 
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Leave
                </Button>
              ) : (
                getChallengeStatus() === 'active' && (
                  !(challenge.maxParticipants && challenge.participantCount >= challenge.maxParticipants) && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<JoinIcon />}
                      onClick={() => setJoinDialogOpen(true)}
                      disabled={actionLoading}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: 'white',
                        py: 1.5
                      }}
                    >
                      Join Challenge
                    </Button>
                  )
                )
              )}
            </Stack>
          </Stack>
        </CardContent>
      </MotionCard>

      {/* Dialogs */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
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
            sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Join Challenge'}
          </Button>
        </DialogActions>
      </Dialog>


    </>
  );
} 




