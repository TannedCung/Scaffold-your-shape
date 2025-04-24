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
import { motion } from 'framer-motion';
import { fadeIn, fadeInUp, staggerChildren } from '@/utils/animations';

// Create motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionTextField = motion(TextField);
const MotionDivider = motion(Divider);

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <MotionBox 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        backgroundColor: 'background.default',
        py: 8
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
        <MotionCard 
          variants={fadeInUp}
          sx={{ 
            width: '100%', 
            borderRadius: 3, 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}
        >
          <MotionBox
            sx={{
              height: 8,
              width: '100%',
              backgroundColor: '#2da58e',
            }}
          />
          <CardContent sx={{ p: 4 }}>
            <MotionBox 
              sx={{ textAlign: 'center', mb: 4 }}
              variants={fadeInUp}
            >
              <MotionTypography 
                variant="h4" 
                sx={{ fontWeight: 'bold', mb: 1 }}
                variants={fadeInUp}
              >
                Welcome Back
              </MotionTypography>
              <MotionTypography 
                variant="body1" 
                color="text.secondary"
                variants={fadeInUp}
              >
                Sign in to continue to Scaffold Your Shape
              </MotionTypography>
            </MotionBox>
            
            <MotionButton 
              variant="outlined" 
              fullWidth 
              startIcon={<GoogleIcon />}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{ 
                py: 1.5, 
                mb: 3,
                borderColor: '#dadce0',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#bbb',
                  backgroundColor: '#f8f9fa'
                }
              }}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Sign in with Google
            </MotionButton>
            
            <Box 
              component={motion.div} 
              variants={fadeInUp} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                my: 3 
              }}
            >
              <MotionDivider sx={{ flexGrow: 1 }} variants={fadeInUp} />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                OR
              </Typography>
              <MotionDivider sx={{ flexGrow: 1 }} variants={fadeInUp} />
            </Box>
            
            <Box 
              component={motion.form} 
              variants={staggerChildren} 
              sx={{ mt: 1 }}
            >
              <MotionTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                variants={fadeInUp}
                sx={{ mb: 2 }}
              />
              <MotionTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                variants={fadeInUp}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={handleTogglePassword}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box 
                component={motion.div} 
                variants={fadeInUp} 
                sx={{ 
                  textAlign: 'right', 
                  mt: 1, 
                  mb: 3 
                }}
              >
                <Link href="/forgot-password" passHref>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#2da58e',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      },
                      cursor: 'pointer'
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Link>
              </Box>
              <MotionButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mb: 3, 
                  py: 1.5, 
                  borderRadius: 2,
                  bgcolor: '#2da58e',
                  '&:hover': {
                    bgcolor: '#1b7d6b',
                  }
                }}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </MotionButton>
              <Box 
                component={motion.div} 
                variants={fadeInUp} 
                sx={{ 
                  textAlign: 'center' 
                }}
              >
                <Typography variant="body2">
                  Don&apos;t have an account?{' '}
                  <Link href="/sign-up" passHref>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: '#2da58e',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        },
                        cursor: 'pointer'
                      }}
                    >
                      Sign Up
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </MotionCard>
      </Container>
    </MotionBox>
  );
}
