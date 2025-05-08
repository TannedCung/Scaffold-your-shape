'use client';

import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import Image from 'next/image';

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef'
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} Scaffold Your Shape. All rights reserved.
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3 
            }}
          >
            <Link href="/privacy" color="inherit" underline="hover">
              <Typography variant="body2" color="text.secondary">
                Privacy Policy
              </Typography>
            </Link>
            <Link href="/terms" color="inherit" underline="hover">
              <Typography variant="body2" color="text.secondary">
                Terms of Service
              </Typography>
            </Link>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Image
              src="/api_logo_pwrdBy_strava_stack_orange.svg"
              alt="Powered by Strava"
              width={120}
              height={36}
              priority
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 