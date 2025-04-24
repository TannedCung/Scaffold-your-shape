'use client';

import React, { useState } from 'react';
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
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon 
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import ClubCard from '@/components/club/ClubCard';
import { Club } from '@/types';
import { motion } from 'framer-motion';
import { containerVariants, fadeInUp, itemVariants } from '@/utils/animations';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

export default function ClubPage() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample club data
  const clubs: Club[] = [
    {
      id: '1',
      name: 'Morning Runners',
      description: 'A club for early birds who love to start their day with a refreshing run.',
      creatorId: 'user1',
      imageUrl: '/images/running-club.jpg',
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
      imageUrl: '/images/gym-club.jpg',
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
      imageUrl: '/images/yoga-club.jpg',
      memberCount: 87,
      isPrivate: false,
      createdAt: '2025-02-20T00:00:00Z',
      updatedAt: '2025-04-10T00:00:00Z'
    },
    {
      id: '4',
      name: 'Elite Athletes',
      description: 'For serious athletes looking to push their limits and achieve peak performance.',
      creatorId: 'user4',
      imageUrl: '/images/athlete-club.jpg',
      memberCount: 52,
      isPrivate: true,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-03-15T00:00:00Z'
    },
    {
      id: '5',
      name: 'Weekend Warriors',
      description: 'Balancing work and fitness - maximize your weekend workouts with like-minded people.',
      creatorId: 'user5',
      imageUrl: '/images/workout-club.jpg',
      memberCount: 94,
      isPrivate: false,
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-04-15T00:00:00Z'
    },
    {
      id: '6',
      name: 'Swimmers Club',
      description: 'Dive into a community of swimming enthusiasts, from beginners to competitive swimmers.',
      creatorId: 'user6',
      imageUrl: '/images/swimming-club.jpg',
      memberCount: 63,
      isPrivate: false,
      createdAt: '2025-02-10T00:00:00Z',
      updatedAt: '2025-03-30T00:00:00Z'
    }
  ];
  
  // Filter clubs based on search term
  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Clubs
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
              Create Club
            </MotionButton>
          </Box>
          <MotionTypography 
            variant="body1" 
            color="text.secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Join clubs to connect with like-minded fitness enthusiasts and share your journey.
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
            <Tab label="My Clubs" />
            <Tab label="Recently Active" />
          </Tabs>
          <Divider />
        </MotionBox>

        {/* Search */}
        <MotionBox 
          sx={{ mb: 4 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <TextField
            fullWidth
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </MotionBox>

        {/* Clubs Grid */}
        <MotionBox 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            },
            gap: 3,
            pb: 5
          }}
        >
          {filteredClubs.map((club) => (
            <Box
              key={club.id}
              sx={{ height: '100%' }}
            >
              <ClubCard club={club} />
            </Box>
          ))}
        </MotionBox>
      </Container>
    </MainLayout>
  );
}
