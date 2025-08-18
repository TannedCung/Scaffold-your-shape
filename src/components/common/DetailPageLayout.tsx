'use client';

import React from 'react';
import {
  Container,
  Box,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';

interface DetailPageLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  containerPadding?: boolean;
}

interface DetailPageHeaderProps {
  children: React.ReactNode;
  backgroundImage?: string;
  backgroundColor?: string;
}

interface DetailPageContentProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  fullWidth?: boolean; // If true, no sidebar
}

interface DetailPageSectionProps {
  children: React.ReactNode;
  spacing?: number;
}

// Animation variants for consistent transitions
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const MotionBox = motion(Box);

// Main layout wrapper
export function DetailPageLayout({ 
  children, 
  loading = false, 
  error = null, 
  maxWidth = 'xl',
  containerPadding = true 
}: DetailPageLayoutProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Container maxWidth={maxWidth} sx={{ py: containerPadding ? 4 : 0 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh'
          }}
        >
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={maxWidth} sx={{ py: containerPadding ? 4 : 0 }}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        py: containerPadding ? 4 : 0,
        px: { xs: 2, sm: 3 }
      }}
    >
      <MotionBox
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </MotionBox>
    </Container>
  );
}

// Header section with optional background
export function DetailPageHeader({ 
  children, 
  backgroundImage, 
  backgroundColor 
}: DetailPageHeaderProps) {
  const theme = useTheme();
  
  return (
    <MotionBox
      variants={sectionVariants}
      sx={{
        position: 'relative',
        mb: 4,
        borderRadius: 3,
        overflow: 'hidden',
        ...(backgroundImage && {
          backgroundImage: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.8)}), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }),
        ...(backgroundColor && !backgroundImage && {
          background: `linear-gradient(135deg, ${backgroundColor}22, ${backgroundColor}11)`,
          border: `1px solid ${backgroundColor}33`
        })
      }}
    >
      {children}
    </MotionBox>
  );
}

// Content area with optional sidebar
export function DetailPageContent({ 
  children, 
  sidebar, 
  fullWidth = false 
}: DetailPageContentProps) {
  if (fullWidth || !sidebar) {
    return (
      <MotionBox variants={sectionVariants}>
        {children}
      </MotionBox>
    );
  }

  return (
    <Grid container spacing={4}>
      {/* Main Content */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MotionBox variants={sectionVariants}>
          {children}
        </MotionBox>
      </Grid>
      
      {/* Sidebar */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MotionBox 
          variants={sectionVariants}
          sx={{ 
            position: { lg: 'sticky' },
            top: { lg: '24px' }
          }}
        >
          {sidebar}
        </MotionBox>
      </Grid>
    </Grid>
  );
}

// Section wrapper for consistent spacing
export function DetailPageSection({ 
  children, 
  spacing = 3 
}: DetailPageSectionProps) {
  return (
    <MotionBox 
      variants={sectionVariants}
      sx={{ mb: spacing }}
    >
      {children}
    </MotionBox>
  );
}

// Export variants for custom animations
export { pageVariants, sectionVariants }; 

