'use client';

import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField,
  InputAdornment,
  Button,
  Tab, 
  Tabs,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import { Challenge } from '@/types';
import { motion } from 'framer-motion';
import { 
  containerVariants, 
  fadeInUp, 
  itemVariants, 
  staggerChildren 
} from '@/utils/animations';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

export default function ChallengesPage() {
  // Sample challenges data
  const challenges: Challenge[] = [
    {
      id: '1',
      title: '30-Day Push-up Challenge',
      description: 'Push yourself to the limit with 100 push-ups every day for 30 days.',
      creatorId: 'user1',
      exerciseId: 'push-up',
      targetValue: 3000,
      unit: 'reps',
      startDate: '2025-05-01T00:00:00Z',
      endDate: '2025-05-30T23:59:59Z',
      isPublic: true,
      participantCount: 124,
      createdAt: '2025-04-15T00:00:00Z',
      updatedAt: '2025-04-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'May Marathon',
      description: 'Run a full marathon (42.2km) during the month of May at your own pace.',
      creatorId: 'user2',
      activityType: 'run',
      targetValue: 42200,
      unit: 'meters',
      startDate: '2025-05-01T00:00:00Z',
      endDate: '2025-05-31T23:59:59Z',
      isPublic: true,
      participantCount: 89,
      createdAt: '2025-04-10T00:00:00Z',
      updatedAt: '2025-04-10T00:00:00Z'
    },
    {
      id: '3',
      title: 'Summer Swimming Sprint',
      description: 'Swim a total of 10km during the summer months.',
      creatorId: 'user3',
      activityType: 'swim',
      targetValue: 10000,
      unit: 'meters',
      startDate: '2025-06-01T00:00:00Z',
      endDate: '2025-08-31T23:59:59Z',
      isPublic: true,
      participantCount: 67,
      createdAt: '2025-04-20T00:00:00Z',
      updatedAt: '2025-04-20T00:00:00Z'
    },
    {
      id: '4',
      title: 'Weekly Pull-Up Challenge',
      description: 'Complete 100 pull-ups each week for 4 weeks.',
      creatorId: 'user4',
      exerciseId: 'pull-up',
      targetValue: 400,
      unit: 'reps',
      startDate: '2025-05-01T00:00:00Z',
      endDate: '2025-05-28T23:59:59Z',
      isPublic: true,
      participantCount: 45,
      createdAt: '2025-04-15T00:00:00Z',
      updatedAt: '2025-04-15T00:00:00Z'
    },
    {
      id: '5',
      title: 'Cycling Expedition',
      description: 'Cycle 300km in one month to build endurance and improve cardiovascular health.',
      creatorId: 'user5',
      activityType: 'cycle',
      targetValue: 300000,
      unit: 'meters',
      startDate: '2025-05-01T00:00:00Z',
      endDate: '2025-05-31T23:59:59Z',
      isPublic: true,
      participantCount: 112,
      createdAt: '2025-04-05T00:00:00Z',
      updatedAt: '2025-04-05T00:00:00Z'
    },
    {
      id: '6',
      title: 'Walking for Wellness',
      description: 'Walk 10,000 steps every day for 30 days to improve health and wellbeing.',
      creatorId: 'user6',
      activityType: 'walk',
      targetValue: 300000,
      unit: 'meters',
      startDate: '2025-05-01T00:00:00Z',
      endDate: '2025-05-30T23:59:59Z',
      isPublic: true,
      participantCount: 203,
      createdAt: '2025-04-12T00:00:00Z',
      updatedAt: '2025-04-12T00:00:00Z'
    }
  ];

  // My challenges (sample data)
  const myChallenges: { challengeId: string; progress: number }[] = [
    { challengeId: '1', progress: 1200 },
    { challengeId: '5', progress: 120000 }
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <MotionBox 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          sx={{ mb: 4 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <MotionTypography 
              variant="h4" 
              fontWeight="bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Challenges
            </MotionTypography>
            <MotionButton 
              variant="contained" 
              startIcon={<AddIcon />}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              sx={{ 
                borderRadius: 2,
                bgcolor: '#2da58e',
                '&:hover': {
                  bgcolor: '#1b7d6b',
                }
              }}
            >
              Create Challenge
            </MotionButton>
          </Box>
          <MotionTypography 
            variant="body1" 
            color="text.secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Join challenges to compete with others and track your progress.
          </MotionTypography>
        </MotionBox>

        {/* Tabs */}
        <MotionBox 
          sx={{ mb: 4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs 
            value={0}
            TabIndicatorProps={{
              style: {
                backgroundColor: '#2da58e',
              }
            }}
            sx={{
              '& .MuiTab-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: '#2da58e',
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab label="Discover" />
            <Tab label="My Challenges" />
            <Tab label="Completed" />
          </Tabs>
          <Divider />
        </MotionBox>

        {/* Search and Filter */}
        <MotionBox 
          sx={{ mb: 4 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: { xs: '100%', md: 'auto' }, flexGrow: 1 }}>
              <TextField
                fullWidth
                placeholder="Search challenges..."
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="activity-type-label">Activity Type</InputLabel>
                <Select
                  labelId="activity-type-label"
                  label="Activity Type"
                  defaultValue="all"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Activities</MenuItem>
                  <MenuItem value="run">Running</MenuItem>
                  <MenuItem value="swim">Swimming</MenuItem>
                  <MenuItem value="cycle">Cycling</MenuItem>
                  <MenuItem value="walk">Walking</MenuItem>
                  <MenuItem value="exercise">Exercises</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<FilterIcon />} sx={{ borderRadius: 2 }}>
                Filters
              </Button>
            </Box>
          </Box>
        </MotionBox>

        {/* Trending Challenges Section */}
        <MotionBox 
          sx={{ mb: 5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Trending Challenges
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
            {challenges.slice(0, 3).map((challenge) => {
              const participation = myChallenges.find(mc => mc.challengeId === challenge.id);
              return (
                <Box key={challenge.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 2 }}>
                  <ChallengeCard 
                    challenge={challenge} 
                    isParticipant={!!participation}
                    currentProgress={participation?.progress || 0}
                  />
                </Box>
              );
            })}
          </Box>
        </MotionBox>

        {/* Upcoming Challenges Section */}
        <MotionBox 
          sx={{ mb: 5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Upcoming Challenges
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
            {challenges.slice(2, 5).map((challenge) => {
              const participation = myChallenges.find(mc => mc.challengeId === challenge.id);
              return (
                <Box key={challenge.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 2 }}>
                  <ChallengeCard 
                    challenge={challenge} 
                    isParticipant={!!participation}
                    currentProgress={participation?.progress || 0}
                  />
                </Box>
              );
            })}
          </Box>
        </MotionBox>

        {/* All Challenges Section */}
        <MotionBox 
          sx={{ mb: 4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            All Challenges
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
            {challenges.map((challenge) => {
              const participation = myChallenges.find(mc => mc.challengeId === challenge.id);
              return (
                <Box key={challenge.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 2 }}>
                  <ChallengeCard 
                    challenge={challenge} 
                    isParticipant={!!participation}
                    currentProgress={participation?.progress || 0}
                  />
                </Box>
              );
            })}
          </Box>
        </MotionBox>
      </Container>
    </MainLayout>
  );
}
