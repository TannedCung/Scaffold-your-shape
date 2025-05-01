'use client';

import React, { useState, ReactNode } from 'react';
import { Box, Toolbar, useMediaQuery, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import EnsureProfile from '@/contexts/EnsureProfile';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:900px)');

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Sidebar width
  const sidebarWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header 
        onMenuClick={handleDrawerToggle} 
        sidebarOpen={sidebarOpen}
        sidebarWidth={sidebarWidth}
      />
      <Sidebar
        isMobile={isSmallScreen}
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        width={sidebarWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%' },
          ml: { sm: sidebarOpen ? `${sidebarWidth}px` : 0 },
          transition: theme => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.standard,
          }),
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <EnsureProfile>
          {children}
        </EnsureProfile>
      </Box>
    </Box>
  );
}
