'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
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
import CreateClubForm from '@/components/club/CreateClubForm';
import ClubList from '@/components/club/ClubList';
import { motion } from 'framer-motion';
import { containerVariants, fadeInUp } from '@/utils/animations';
import { useClubs } from '@/hooks/useClubs';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

export default function ClubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { clubs, loading, error } = useClubs();

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

        <Box sx={{ mb: 4 }}>
          <CreateClubForm />
        </Box>
        <ClubList />

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
          {loading && <Typography>Loading...</Typography>}
          {error && <Typography color="error">{error}</Typography>}
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
