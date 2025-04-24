'use client';

import { 
  Box, 
  Button, 
  Container, 
  Typography,
  Card, 
  CardContent,
  Stack
} from '@mui/material';
import {
  DirectionsRun as RunIcon,
  FitnessCenter as WorkoutIcon,
  Groups as ClubIcon,
  EmojiEvents as ChallengeIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  fadeIn, 
  fadeInUp, 
  staggerChildren, 
  itemVariants, 
  containerVariants 
} from '@/utils/animations';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionCard = motion(Card);
const MotionContainer = motion(Container);
const MotionStack = motion(Stack);

export default function Home() {
  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <MotionBox 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        sx={{ 
          pt: { xs: 10, md: 12 }, 
          pb: { xs: 8, md: 10 },
          backgroundColor: '#2da58e', // Solid color instead of gradient
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, px: 2 }}>
              <MotionTypography 
                variant="h2" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
                variants={fadeInUp}
              >
                Track Your Fitness Journey
              </MotionTypography>
              <MotionTypography 
                variant="h5" 
                sx={{ mb: 4, opacity: 0.9 }}
                variants={fadeInUp}
              >
                Monitor your exercises, join challenges, and connect with like-minded fitness enthusiasts with Scaffold Your Shape.
              </MotionTypography>
              <MotionStack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                variants={staggerChildren}
              >
                <Link href="/sign-up" passHref style={{ textDecoration: 'none' }}>
                  <MotionButton 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      bgcolor: 'white',
                      color: '#2da58e',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    Get Started
                  </MotionButton>
                </Link>
                <Link href="/sign-in" passHref style={{ textDecoration: 'none' }}>
                  <MotionButton 
                    variant="outlined" 
                    size="large"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Log In
                  </MotionButton>
                </Link>
              </MotionStack>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' }, px: 2, display: { xs: 'none', md: 'block' } }}>
              <MotionBox 
                sx={{ position: 'relative', height: 400 }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  Fitness Tracking Image
                </Box>
              </MotionBox>
            </Box>
          </Box>
        </Container>
      </MotionBox>

      {/* Features Section */}
      <MotionContainer 
        maxWidth="lg" 
        sx={{ py: { xs: 8, md: 10 } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <MotionTypography 
          variant="h3" 
          sx={{ 
            mb: 6, 
            fontWeight: 'bold',
            textAlign: 'center'
          }}
          variants={fadeInUp}
        >
          Why Choose Scaffold Your Shape?
        </MotionTypography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 2, mb: 4 }}>
            <MotionCard 
              sx={{ 
                height: '100%',
              }}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <MotionBox 
                  sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: '#4cceac20', 
                    color: '#2da58e',
                    mb: 2
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  viewport={{ once: true }}
                >
                  <WorkoutIcon fontSize="large" />
                </MotionBox>
                <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                  Track Workouts
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Record and monitor your exercises with detailed statistics and progress tracking.
                </Typography>
              </CardContent>
            </MotionCard>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 2, mb: 4 }}>
            <MotionCard 
              sx={{ 
                height: '100%',
              }}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <MotionBox 
                  sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: '#60a5fa20', 
                    color: '#3b82f6',
                    mb: 2
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <RunIcon fontSize="large" />
                </MotionBox>
                <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                  Outdoor Activities
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Log your running, walking, swimming and other outdoor activities in one place.
                </Typography>
              </CardContent>
            </MotionCard>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 2, mb: 4 }}>
            <MotionCard 
              sx={{ 
                height: '100%',
              }}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <MotionBox 
                  sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: '#f59e0b20', 
                    color: '#f59e0b',
                    mb: 2
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <ChallengeIcon fontSize="large" />
                </MotionBox>
                <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                  Challenges
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Join fitness challenges to test your limits and compete with others.
                </Typography>
              </CardContent>
            </MotionCard>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 2, mb: 4 }}>
            <MotionCard 
              sx={{ 
                height: '100%',
              }}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <MotionBox 
                  sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: '#10b98120', 
                    color: '#10b981',
                    mb: 2
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <ClubIcon fontSize="large" />
                </MotionBox>
                <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                  Fitness Community
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Connect with like-minded people in clubs and share your fitness journey.
                </Typography>
              </CardContent>
            </MotionCard>
          </Box>
        </Box>
      </MotionContainer>
      
      {/* Call to Action */}
      <MotionBox 
        sx={{ 
          bgcolor: '#2da58e', 
          py: { xs: 8, md: 10 },
          textAlign: 'center'
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        <Container maxWidth="md">
          <MotionTypography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              mb: 1
            }}
            variants={fadeInUp}
          >
            Ready to Start Your Fitness Journey?
          </MotionTypography>
          <MotionTypography 
            variant="h6" 
            sx={{ mb: 4, opacity: 0.9, color: 'white' }}
            variants={fadeInUp}
          >
            Join thousands of users already tracking their fitness goals.
          </MotionTypography>
          <Link href="/sign-up" passHref style={{ textDecoration: 'none' }}>
            <MotionButton 
              variant="contained" 
              size="large"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeInUp}
              sx={{ 
                px: 6, 
                py: 1.5, 
                bgcolor: 'white', 
                color: '#2da58e',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Sign Up Now
            </MotionButton>
          </Link>
        </Container>
      </MotionBox>
      
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {new Date().getFullYear()} Scaffold Your Shape. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
