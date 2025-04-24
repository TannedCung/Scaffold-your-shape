'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, SvgIconProps } from '@mui/material';
import { motion } from 'framer-motion';

// Create motion components
const MotionCard = motion(Card);

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactElement<SvgIconProps>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
}

export default function StatCard({ title, value, subtitle, icon, color = 'primary' }: StatCardProps) {
  const theme = useTheme();
  
  const getColorValue = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'error': return '#ef4444';
      default: return theme.palette.primary.main;
    }
  };

  return (
    <MotionCard 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      sx={{ 
        height: '100%',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <CardContent sx={{ padding: '16px 20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
          <Box 
            component={motion.div}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${getColorValue()}20`,
              color: getColorValue(),
              borderRadius: '50%',
              p: 1,
              width: 40,
              height: 40
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography 
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            mb: 0.5
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography 
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            variant="body2" 
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </MotionCard>
  );
}
