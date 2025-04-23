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
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon 
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import ClubCard from '@/components/club/ClubCard';
import { Club } from '@/types';

export default function ClubPage() {
  // Sample club data
  const clubs: Club[] = [
    {
      id: '1',
      name: 'Morning Runners',
      description: 'A club for early birds who love to start their day with a refreshing run.',
      creatorId: 'user1',
      imageUrl: 'https://source.unsplash.com/random/800x600/?running',
      memberCount: 45,
      isPrivate: false,
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Fitness Enthusiasts',
      description: 'Dedicated to all aspects of fitness, from strength training to cardio workouts.',
      creatorId: 'user2',
      imageUrl: 'https://source.unsplash.com/random/800x600/?gym',
      memberCount: 138,
      isPrivate: false,
      createdAt: '2024-12-10T00:00:00Z',
      updatedAt: '2025-04-05T00:00:00Z'
    },
    {
      id: '3',
      name: 'Yoga Masters',
      description: 'Find your inner peace through mindful practice and connect with other yoga lovers.',
      creatorId: 'user3',
      imageUrl: 'https://source.unsplash.com/random/800x600/?yoga',
      memberCount: 87,
      isPrivate: false,
      createdAt: '2025-02-20T00:00:00Z',
      updatedAt: '2025-03-15T00:00:00Z'
    },
    {
      id: '4',
      name: 'Elite Athletes',
      description: 'For serious athletes looking to push their limits and achieve peak performance.',
      creatorId: 'user4',
      imageUrl: 'https://source.unsplash.com/random/800x600/?athlete',
      memberCount: 52,
      isPrivate: true,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-04-10T00:00:00Z'
    },
    {
      id: '5',
      name: 'Weekend Warriors',
      description: 'Balancing work and fitness - maximize your weekend workouts with like-minded people.',
      creatorId: 'user5',
      imageUrl: 'https://source.unsplash.com/random/800x600/?workout',
      memberCount: 94,
      isPrivate: false,
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-04-12T00:00:00Z'
    },
    {
      id: '6',
      name: 'Swimmers Club',
      description: 'Dive into a community of swimming enthusiasts, from beginners to competitive swimmers.',
      creatorId: 'user6',
      imageUrl: 'https://source.unsplash.com/random/800x600/?swimming',
      memberCount: 63,
      isPrivate: false,
      createdAt: '2025-02-10T00:00:00Z',
      updatedAt: '2025-03-30T00:00:00Z'
    }
  ];

  // My clubs (sample data)
  const myClubs: Club[] = [
    clubs[0],
    clubs[4]
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Clubs
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              Create Club
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Join fitness communities that match your interests and goals.
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs value={0}>
            <Tab label="Discover" />
            <Tab label="My Clubs" />
            <Tab label="Nearby" />
          </Tabs>
          <Divider />
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search clubs..."
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

        {/* Popular Clubs Section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Popular Clubs
          </Typography>
          <Grid container spacing={3}>
            {clubs.slice(0, 3).map((club) => (
              <Grid item key={club.id} xs={12} sm={6} md={4}>
                <ClubCard club={club} isMember={myClubs.some(c => c.id === club.id)} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* All Clubs Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            All Clubs
          </Typography>
          <Grid container spacing={3}>
            {clubs.map((club) => (
              <Grid item key={club.id} xs={12} sm={6} md={4}>
                <ClubCard club={club} isMember={myClubs.some(c => c.id === club.id)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
}
