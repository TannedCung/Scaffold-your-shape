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
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import Link from 'next/link';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';

export default function SignUpPage() {
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
                  Create an Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Join Scaffold Your Shape to track your fitness journey
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
                Sign up with Google
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                  OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>
              
              <Box component="form" sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                  />
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                  />
                </Box>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  sx={{ mb: 2 }}
                />
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  sx={{ mb: 2 }}
                  helperText="Must be at least 8 characters long"
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
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  sx={{ mb: 2 }}
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
                <FormControlLabel
                  control={<Checkbox value="agree" color="primary" />}
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="/terms" passHref>
                        <MuiLink variant="body2" underline="hover" color="primary">
                          Terms of Service
                        </MuiLink>
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" passHref>
                        <MuiLink variant="body2" underline="hover" color="primary">
                          Privacy Policy
                        </MuiLink>
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mb: 3, py: 1.5, borderRadius: 2 }}
                >
                  Sign Up
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <Link href="/sign-in" passHref>
                      <MuiLink variant="body2" underline="hover" fontWeight="bold" color="primary">
                        Sign In
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
