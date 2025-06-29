'use client';

import React from 'react';
import { useChallengesWithParticipations } from '@/hooks/useChallengesWithParticipations';
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
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import CreateChallengeForm from '@/components/challenges/CreateChallengeForm';
import ChallengeList from '@/components/challenges/ChallengeList';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

export default function ChallengesPage() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const { challenges, loading, error, refreshParticipations } = useChallengesWithParticipations();

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
              onClick={() => setCreateOpen(true)}
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

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2da58e', color: '#fff' }}>Create Challenge</DialogTitle>
          <DialogContent>
            <CreateChallengeForm onSuccess={() => { 
              setCreateOpen(false); 
              refreshParticipations();
              window.location.reload(); 
            }} />
          </DialogContent>
        </Dialog>
        <ChallengeList />

        {loading && <Typography>Loading...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

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
            {challenges.slice(0, 3).map((challenge) => (
              <Box key={challenge.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 2 }}>
                <ChallengeCard 
                  challenge={challenge} 
                  isParticipant={challenge.isParticipant}
                  currentProgress={challenge.currentProgress || 0}
                />
              </Box>
            ))}
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
            {challenges.slice(2, 5).map((challenge) => (
              <Box key={challenge.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 2 }}>
                <ChallengeCard 
                  challenge={challenge} 
                  isParticipant={challenge.isParticipant}
                  currentProgress={challenge.currentProgress || 0}
                />
              </Box>
            ))}
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
            {challenges.map((challenge) => (
              <Box key={challenge.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 2 }}>
                <ChallengeCard 
                  challenge={challenge} 
                  isParticipant={challenge.isParticipant}
                  currentProgress={challenge.currentProgress || 0}
                />
              </Box>
            ))}
          </Box>
        </MotionBox>
      </Container>
    </MainLayout>
  );
}
