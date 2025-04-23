import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Divider, 
  Container,
  Link as MuiLink,
  useTheme,
  InputAdornment,
  IconButton 
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';

export default function SignInPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          backgroundColor: theme.palette.background.default,
          py: 8
        }}
      >
        <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
          <Card sx={{ width: '100%', borderRadius: 3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue to Scaffold Your Shape
                </Typography>
              </Box>
              
              <Button 
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
                    backgroundColor: '#f8f9fa'
                  }
                }}
              >
                Sign in with Google
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                  OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>
              
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end">
                          <VisibilityOff />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ textAlign: 'right', mt: 1, mb: 3 }}>
                  <Link href="/forgot-password" passHref>
                    <MuiLink variant="body2" underline="hover">
                      Forgot password?
                    </MuiLink>
                  </Link>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mb: 3, py: 1.5, borderRadius: 2 }}
                >
                  Sign In
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">
                    Don't have an account?{' '}
                    <Link href="/sign-up" passHref>
                      <MuiLink variant="body2" underline="hover" fontWeight="bold" color="primary">
                        Sign Up
                      </MuiLink>
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
