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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent
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
import { useUserClubs } from '@/hooks/useUserClubs';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

export default function ClubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const { clubs, loading, error } = useClubs();
  const { userClubs, loading: userLoading, error: userError } = useUserClubs();
  const [createOpen, setCreateOpen] = useState(false);

  // Filter clubs based on search term
  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter user clubs based on search term
  const filteredUserClubs = userClubs.filter(membership =>
    membership.club?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membership.club?.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
              onClick={() => setCreateOpen(true)}
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

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2da58e', color: '#fff', fontWeight: 600, pb: 1 }}>Create Club</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <CreateClubForm onSuccess={() => { setCreateOpen(false); window.location.reload(); }} />
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <MotionBox 
          sx={{ mb: 4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs 
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
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

        {/* Tab Content */}
        {currentTab === 0 && (
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
              gridAutoRows: '1fr', // Force equal row heights
              gap: 3,
              pb: 5
            }}
          >
            {loading && <Typography>Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && filteredClubs.length === 0 && (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No clubs found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a club!'}
                </Typography>
              </Box>
            )}
            {filteredClubs.map((club) => (
              <Box
                key={club.id}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                <ClubCard club={club} />
              </Box>
            ))}
          </MotionBox>
        )}

        {/* My Clubs Tab */}
        {currentTab === 1 && (
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
              gridAutoRows: '1fr', // Force equal row heights
              gap: 3,
              pb: 5
            }}
          >
            {userLoading && <Typography>Loading your clubs...</Typography>}
            {userError && <Typography color="error">{userError}</Typography>}
            {!userLoading && !userError && filteredUserClubs.length === 0 && (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm ? 'No matching clubs found' : 'You haven\'t joined any clubs yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {searchTerm ? 'Try adjusting your search terms' : 'Join clubs to connect with the community and share your fitness journey'}
                </Typography>
                {!searchTerm && (
                  <MotionButton 
                    variant="outlined" 
                    sx={{ 
                      mt: 2,
                      borderColor: '#2da58e',
                      color: '#2da58e',
                      '&:hover': {
                        borderColor: '#1b7d6b',
                        bgcolor: 'rgba(45, 165, 142, 0.04)'
                      }
                    }}
                    onClick={() => setCurrentTab(0)}
                  >
                    Discover Clubs
                  </MotionButton>
                )}
              </Box>
            )}
            {filteredUserClubs.map((membership) => (
              membership.club && (
                <Box
                  key={membership.id}
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <ClubCard 
                    club={membership.club} 
                    userMembership={membership}
                    showMembershipActions={true}
                    onMembershipChange={() => {
                      // Refresh the user clubs data
                      window.location.reload();
                    }}
                  />
                </Box>
              )
            ))}
          </MotionBox>
        )}
      </Container>
    </MainLayout>
  );
}
