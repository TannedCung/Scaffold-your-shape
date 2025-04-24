'use client';

import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
  sidebarWidth?: number;
}

export default function Header({ onMenuClick, sidebarOpen = true, sidebarWidth = 280 }: HeaderProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut();
  };

  return (
    <AppBar 
      position="fixed" 
      color="default" 
      elevation={1}
      sx={{
        width: { sm: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%' },
        ml: { sm: sidebarOpen ? `${sidebarWidth}px` : 0 },
        transition: theme => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.standard,
        }),
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: theme => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 'bold',
            color: '#2da58e'
          }}
        >
          Scaffold Your Shape
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {session ? (
          <>
            <Link href="/activity/log" passHref>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<AddIcon />}
                sx={{ 
                  mr: { xs: 1, sm: 2 },
                  display: { xs: 'none', sm: 'flex' },
                  bgcolor: '#2da58e',
                  '&:hover': {
                    bgcolor: '#1b7d6b',
                  }
                }}
              >
                Log Activity
              </Button>
            </Link>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={handleNotificationMenuOpen}
                sx={{ mr: { xs: 1, sm: 2 } }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationMenuClose}
              PaperProps={{
                sx: { width: 320, maxHeight: 400 }
              }}
            >
              <MenuItem onClick={handleNotificationMenuClose}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2">New Challenge Available</Typography>
                  <Typography variant="body2" color="text.secondary">
                    30-Day Running Challenge has started!
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleNotificationMenuClose}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2">Activity Milestone</Typography>
                  <Typography variant="body2" color="text.secondary">
                    You&apos;ve reached 100km of running this month!
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleNotificationMenuClose}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2">New Club Member</Typography>
                  <Typography variant="body2" color="text.secondary">
                    John Doe has joined Morning Runners club
                  </Typography>
                </Box>
              </MenuItem>
            </Menu>
            
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ p: 0 }}
              >
                <Avatar 
                  alt={session.user?.name || 'User'} 
                  src={session.user?.image || undefined}
                />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <Link href="/profile" passHref style={{ color: 'inherit', textDecoration: 'none' }}>
                  Profile
                </Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Link href="/settings" passHref style={{ color: 'inherit', textDecoration: 'none' }}>
                  Settings
                </Link>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Link href="/sign-in" passHref>
            <Button 
              variant="contained"
              sx={{ 
                bgcolor: '#2da58e',
                '&:hover': {
                  bgcolor: '#1b7d6b',
                }
              }}
            >
              Sign In
            </Button>
          </Link>
        )}
      </Toolbar>
    </AppBar>
  );
}
