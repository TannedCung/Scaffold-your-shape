'use client';

import React, { useState, ReactNode } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/lib/theme';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header onMenuClick={handleDrawerToggle} />
        <Sidebar
          isMobile={isSmallScreen}
          open={mobileOpen}
          onClose={handleDrawerToggle}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 280px)` },
            ml: { sm: '280px' },
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
