'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  Card,
  CardContent,
  Divider,
  Grid
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useChallengeDetail } from '@/hooks/useChallengeDetail';
import { DetailPageContent, DetailPageSection } from '@/components/common/DetailPageLayout';
import { UnifiedCard, UnifiedCardContent, CardHeader } from '@/components/common/UnifiedCard';
import ChallengeLeaderboard from './ChallengeLeaderboard';
import ChallengeActivities from './ChallengeActivities';

const MotionCard = motion(Card);

interface ChallengeDetailContentProps {
  challengeId: string;
}

export default function ChallengeDetailContent({ challengeId }: ChallengeDetailContentProps) {
  const theme = useTheme();
  const { challenge, loading, error } = useChallengeDetail(challengeId);

  if (loading || error || !challenge) {
    return null;
  }

  const mainContent = (
    <UnifiedCard variant="default" size="large">
      <UnifiedCardContent>
        <CardHeader
          title="Challenge Leaderboard"
          avatar={<TrophyIcon sx={{ color: theme.palette.primary.main }} />}
        />
        <ChallengeLeaderboard challengeId={challengeId} />
      </UnifiedCardContent>
    </UnifiedCard>
  );

  const sidebar = (
    <Stack spacing={3}>
          
          {/* Challenge Description */}
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About This Challenge
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {challenge.description || 'No description available.'}
              </Typography>
              
              {/* Challenge Details */}
              <Stack spacing={1}>
                <Chip
                  icon={<CalendarIcon />}
                  label={`${challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : 'No start date'} - ${challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : 'No end date'}`}
                  variant="outlined"
                  size="small"
                />
                {challenge.activityType && (
                  <Chip
                    label={`Activity: ${challenge.activityType}`}
                    variant="outlined"
                    size="small"
                  />
                )}
                {challenge.rewardType && (
                  <Chip
                    icon={<TrophyIcon />}
                    label={`${challenge.rewardType}: ${challenge.rewardValue}`}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
            </CardContent>
          </MotionCard>

          {/* Rules */}
          {challenge.rules && (
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Rules & Guidelines
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {challenge.rules}
                </Typography>
              </CardContent>
            </MotionCard>
          )}

          {/* Challenge Stats */}
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CardContent sx={{ p: 3 }}>
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

          {/* Recent Activities */}
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activities
              </Typography>
              <ChallengeActivities challengeId={challengeId} compact />
            </CardContent>
          </MotionCard>

    </Stack>
  );

  return (
    <Grid container spacing={4}>
      {/* Main Content - Leaderboard (takes 2/3 of space) */}
      <Grid size={{ xs: 12, lg: 8 }}>
        {mainContent}
      </Grid>

      {/* Sidebar (takes 1/3 of space) */}
      <Grid size={{ xs: 12, lg: 4 }}>
        {sidebar}
      </Grid>
    </Grid>
  );
} 


