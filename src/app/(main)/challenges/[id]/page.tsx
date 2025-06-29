'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  ExitToApp as LeaveIcon,
  Add as JoinIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import { challengeApi } from '@/lib/api';
import { Challenge, ChallengeLeaderboard } from '@/types';
import { useSession } from 'next-auth/react';

export default function ChallengeDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const challengeId = params?.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [updateProgressOpen, setUpdateProgressOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // User participation state
  const [userParticipation, setUserParticipation] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    if (challengeId) {
      fetchChallengeDetails();
    }
  }, [challengeId]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);
      // Skip loading leaderboard for now
      const challengeResponse = await challengeApi.getById(challengeId);

      if (challengeResponse.error) {
        throw new Error(challengeResponse.error);
      }

      setChallenge(challengeResponse.data || null);
      // Skip setting leaderboard - setLeaderboard(leaderboardResponse.data || []);

      // Check if current user is a participant
      if (session?.user?.id && challengeResponse.data && (challengeResponse.data as any).challenge_participants) {
        const userParticipant = (challengeResponse.data as any).challenge_participants.find(
          (p: any) => p.user_id === session.user.id
        );
        setUserParticipation(userParticipant);
        setIsParticipant(!!userParticipant);
        if (userParticipant) {
          setProgressValue(userParticipant.current_value);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!session?.user?.id) return;

    setActionLoading(true);
    try {
      const { error } = await challengeApi.join(challengeId);
      if (error) throw new Error(error);
      
      setJoinDialogOpen(false);
      await fetchChallengeDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!session?.user?.id) return;

    setActionLoading(true);
    try {
      const { error } = await challengeApi.updateProgress(challengeId, {
        currentValue: progressValue
      });
      if (error) throw new Error(error);
      
      setUpdateProgressOpen(false);
      await fetchChallengeDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveChallenge = async () => {
    if (!session?.user?.id) return;

    setActionLoading(true);
    try {
      const { error } = await challengeApi.leave(challengeId);
      if (error) throw new Error(error);
      
      await fetchChallengeDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave challenge');
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!challenge) return 0;
    const endDate = new Date(challenge.endDate);
    const today = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getProgressPercentage = () => {
    if (!userParticipation || !challenge) return 0;
    return Math.min(100, Math.round((userParticipation.current_value / challenge.targetValue) * 100));
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </MainLayout>
    );
  }

  if (error || !challenge) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            {error || 'Challenge not found'}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Card sx={{ mb: 4 }}>
          <Box
            sx={{
              height: 200,
              background: challenge.backgroundImageUrl 
                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${challenge.backgroundImageUrl})`
                : 'linear-gradient(135deg, #2da58e 0%, #1b7d6b 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              p: 3
            }}
          >
            <Box sx={{ color: 'white' }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {challenge.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${challenge.challengeType} Challenge`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label={challenge.difficultyLevel}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label={`${getDaysRemaining()} days left`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
          </Box>
          
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" paragraph>
                  {challenge.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlagIcon color="primary" />
                    <Typography variant="body2">
                      Goal: {challenge.targetValue} {challenge.unit}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon color="primary" />
                    <Typography variant="body2">
                      {challenge.participantCount} participants
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    <Typography variant="body2">
                      {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                {challenge.rules && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Rules & Guidelines</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {challenge.rules}
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  {isParticipant ? (
                    <Card sx={{ p: 3, bgcolor: '#f8fafc' }}>
                      <Typography variant="h6" gutterBottom>Your Progress</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {userParticipation?.current_value || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          of {challenge.targetValue} {challenge.unit}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProgressPercentage()}
                        sx={{ mb: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" gutterBottom>
                        {getProgressPercentage()}% Complete
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<UpdateIcon />}
                          onClick={() => setUpdateProgressOpen(true)}
                          sx={{ bgcolor: '#2da58e', '&:hover': { bgcolor: '#1b7d6b' } }}
                        >
                          Update Progress
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleLeaveChallenge}
                          disabled={actionLoading}
                          sx={{ minWidth: 'auto' }}
                        >
                          Leave
                        </Button>
                      </Box>
                    </Card>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<JoinIcon />}
                      onClick={() => setJoinDialogOpen(true)}
                      sx={{ 
                        bgcolor: '#2da58e',
                        '&:hover': { bgcolor: '#1b7d6b' },
                        py: 2,
                        px: 4
                      }}
                    >
                      Join Challenge
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon />
              Leaderboard
            </Typography>
            
            {leaderboard.length > 0 ? (
              <List>
                {leaderboard.map((participant, index) => (
                  <ListItem key={participant.userId} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          #{index + 1}
                        </Typography>
                        <Avatar src={participant.avatarUrl} alt={participant.userName}>
                          {participant.userName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={participant.userName}
                      secondary={`${participant.currentValue} ${challenge.unit} • ${participant.progressPercentage.toFixed(1)}% complete`}
                    />
                    {participant.completed && (
                      <TrophyIcon color="warning" />
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No participants yet. Be the first to join!
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
          <DialogTitle>Join Challenge</DialogTitle>
          <DialogContent>
            <Typography>
              Are you ready to take on the "{challenge.title}" challenge?
            </Typography>
          </DialogContent>
          <DialogActions>
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

        <Dialog open={updateProgressOpen} onClose={() => setUpdateProgressOpen(false)}>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={`Current Value (${challenge.unit})`}
              type="number"
              fullWidth
              value={progressValue}
              onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
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