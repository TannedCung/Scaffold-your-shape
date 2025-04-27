'use client';

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Divider, 
  Container,
  InputAdornment,
  IconButton 
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from "framer-motion";
import { fadeIn, fadeInUp, staggerChildren } from '@/utils/animations';

// Remove custom motion components. Use MUI components with component={motion.div} or motion.button, etc. as needed.

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', backgroundColor: 'background.default', py: 8 }}>
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
        <Card
          sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            p: 0
          }}
        >
          <Box sx={{ height: 8, width: '100%', backgroundColor: '#2da58e' }} />
          <CardContent sx={{ p: 4 }}>
            <Box component={motion.div} variants={fadeInUp} initial="hidden" animate="visible" sx={{ textAlign: 'center', mb: 4 }}>
              <Typography component={motion.div} variants={fadeInUp} variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography component={motion.div} variants={fadeInUp} variant="body1" color="text.secondary">
                Sign in to continue to Scaffold Your Shape
              </Typography>
            </Box>
            <Button
              component={motion.button}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              sx={{
                py: 1.5,
                mb: 3,
                borderColor: '#dadce0',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#bbb',
                  backgroundColor: '#f8f9fa',
                },
              }}
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              Sign in with Google
            </Button>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
