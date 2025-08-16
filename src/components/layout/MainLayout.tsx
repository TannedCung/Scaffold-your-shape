'use client';

import React, { useState, ReactNode } from 'react';
import { Box, Toolbar, useMediaQuery, CssBaseline, Fab, Tooltip, AppBar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Add as AddIcon } from '@mui/icons-material';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';
import ChatPopup from '@/components/common/ChatPopup';
import Image from 'next/image';
import Link from 'next/link';

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
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#f7faf9', color: '#2da58e', borderBottom: '1px solid #e0f7f3', boxShadow: 'none' }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.ico" alt="App Logo" width={40} height={40} style={{ marginRight: 12 }} />
          </Link>
          {/* You can add app name or nav here if needed */}
        </Toolbar>
      </AppBar>
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
          {children}
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
            left: 20, 
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
      
      {/* AI ChatBot - Available across all pages */}
      <ChatPopup />
    </Box>
  );
}
