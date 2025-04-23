import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
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
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Challenges
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              Create Challenge
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Join challenges to compete with others and track your progress.
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs value={0}>
            <Tab label="Discover" />
            <Tab label="My Challenges" />
            <Tab label="Completed" />
          </Tabs>
          <Divider />
        </Box>

        {/* Search and Filter */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
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
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2}>
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
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Trending Challenges Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Trending Challenges
          </Typography>
          <Grid container spacing={3}>
            {challenges.slice(0, 3).map((challenge) => {
              const participation = myChallenges.find(mc => mc.challengeId === challenge.id);
              return (
                <Grid item key={challenge.id} xs={12} sm={6} md={4}>
                  <ChallengeCard 
                    challenge={challenge} 
                    isParticipant={!!participation}
                    currentProgress={participation?.progress || 0}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Upcoming Challenges Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Upcoming Challenges
          </Typography>
          <Grid container spacing={3}>
            {challenges.slice(2, 5).map((challenge) => {
              const participation = myChallenges.find(mc => mc.challengeId === challenge.id);
              return (
                <Grid item key={challenge.id} xs={12} sm={6} md={4}>
                  <ChallengeCard 
                    challenge={challenge} 
                    isParticipant={!!participation}
                    currentProgress={participation?.progress || 0}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* All Challenges Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            All Challenges
          </Typography>
          <Grid container spacing={3}>
            {challenges.map((challenge) => {
              const participation = myChallenges.find(mc => mc.challengeId === challenge.id);
              return (
                <Grid item key={challenge.id} xs={12} sm={6} md={4}>
                  <ChallengeCard 
                    challenge={challenge} 
                    isParticipant={!!participation}
                    currentProgress={participation?.progress || 0}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
}
