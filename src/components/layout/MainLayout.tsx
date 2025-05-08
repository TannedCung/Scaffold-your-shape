'use client';

import React, { useState, ReactNode } from 'react';
import { Box, Toolbar, useMediaQuery, CssBaseline, Fab, Tooltip } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import EnsureProfile from '@/contexts/EnsureProfile';
import { Add as AddIcon } from '@mui/icons-material';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:900px)');

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Sidebar width
  const sidebarWidth = 280;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <EnsureProfile>
            {children}
          </EnsureProfile>
        </Box>
        <Footer />
      </Box>
      
      {/* Mobile FAB for logging activity */}
      <Tooltip title="Log Activity">
        <Fab 
          color="primary" 
          aria-label="log activity" 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            display: { xs: 'flex', sm: 'none' },
            bgcolor: '#2da58e',
            '&:hover': { bgcolor: '#1a8a73' },
            zIndex: theme => theme.zIndex.drawer - 1,
          }}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      
      <CreateActivityDialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
      />
    </Box>
  );
}
