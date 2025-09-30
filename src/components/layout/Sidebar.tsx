'use client';

import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, 
  Typography, Avatar, Divider } from '@mui/material';
import { 
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as ClubIcon,
  EmojiEventsOutlined as ChallengesIcon,
  PersonOutlined as ProfileIcon,
  FitnessCenterOutlined as FitnessIcon,
  SportsGymnasticsOutlined as WorkoutIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SidebarProps {
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
  width?: number;
}

export default function Sidebar({ isMobile, open, onClose, width = 280 }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Workout', icon: <WorkoutIcon />, path: '/workouts/exercises' },
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
            backgroundColor: '#2da58e',
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
          {menuItems.map((item) => {
            const isSelected = pathname === item.path || pathname?.startsWith(item.path.split('/')[1] === 'workouts' ? '/workouts' : item.path);
            return (
              <ListItem key={item.text} disablePadding>
                <Link href={item.path} passHref style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
                  <ListItemButton 
                    selected={isSelected}
                    sx={{ 
                      borderRadius: '16px',
                      mx: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(45, 165, 142, 0.12)',
                        color: '#2da58e',
                        '&:hover': {
                          backgroundColor: 'rgba(45, 165, 142, 0.18)',
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 45,
                      color: isSelected ? '#2da58e' : 'inherit'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
        </List>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            &copy; {new Date().getFullYear()} Scaffold Your Shape
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isMobile && open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            width: width,
            boxSizing: 'border-box',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={!isMobile && open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: open ? width : 0,
          flexShrink: 0,
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.standard,
          }),
          '& .MuiDrawer-paper': {
            width: width,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.standard,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
