'use client';

import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, 
  Typography, Avatar, Divider, Tooltip } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as ClubIcon,
  EmojiEvents as ChallengesIcon,
  Person as ProfileIcon,
  FitnessCenter as FitnessIcon,
  Menu as MenuIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SidebarProps {
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ isMobile, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Club', icon: <ClubIcon />, path: '/club' },
    { text: 'Challenges', icon: <ChallengesIcon />, path: '/challenges' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  const drawerContent = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          backgroundColor: 'background.default',
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'center',
            backgroundColor: 'primary.main',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FitnessIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Scaffold Your Shape
            </Typography>
          </Box>
          {isMobile && (
            <IconButton edge="end" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        {session?.user && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={session.user.image || undefined} 
              alt={session.user.name || 'User'} 
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {session.user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session.user.email}
              </Typography>
            </Box>
          </Box>
        )}
        
        <Divider />
        
        <List sx={{ flexGrow: 1, pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Link href={item.path} passHref style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton 
                  selected={pathname === item.path}
                  sx={{ 
                    borderRadius: '0 24px 24px 0',
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(76, 206, 172, 0.12)',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 206, 172, 0.2)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      }
                    }
                  }}
                  onClick={isMobile ? onClose : undefined}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: pathname === item.path ? 'primary.main' : 'inherit'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {new Date().getFullYear()} Scaffold Your Shape
          </Typography>
        </Box>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
