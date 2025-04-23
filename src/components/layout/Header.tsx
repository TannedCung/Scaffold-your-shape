'use client';

import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  useTheme, 
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const theme = useTheme();
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
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {session ? (
          <>
            <Tooltip title="Add workout">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                sx={{ mr: 2 }}
              >
                Add Workout
              </Button>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={handleNotificationMenuOpen}
                size="large"
                sx={{ mr: 2 }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ p: 0 }}
              >
                <Avatar 
                  src={session.user?.image || undefined}
                  alt={session.user?.name || 'User'}
                />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Link href="/profile" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              </Link>
              <Link href="/settings" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              </Link>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
            
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { width: 320, maxHeight: 400 }
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
              </Box>
              <MenuItem onClick={handleNotificationMenuClose}>
                <Box>
                  <Typography variant="body2">John joined your challenge "100 Push-ups"</Typography>
                  <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleNotificationMenuClose}>
                <Box>
                  <Typography variant="body2">Sara completed "5K Run Challenge"</Typography>
                  <Typography variant="caption" color="text.secondary">Yesterday</Typography>
                </Box>
              </MenuItem>
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Link href="/notifications" passHref style={{ textDecoration: 'none' }}>
                  <Button size="small" onClick={handleNotificationMenuClose}>
                    View all
                  </Button>
                </Link>
              </Box>
            </Menu>
          </>
        ) : (
          <>
            <Link href="/sign-in" passHref>
              <Button color="inherit">Login</Button>
            </Link>
            <Link href="/sign-up" passHref>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ ml: 1 }}
              >
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
