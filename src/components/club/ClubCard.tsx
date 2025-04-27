import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  Avatar, 
  AvatarGroup 
} from '@mui/material';
import { 
  People as PeopleIcon,
  Lock as LockIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { Club } from '@/types';

interface ClubCardProps {
  club: Club;
  isMember?: boolean;
}

export default function ClubCard({ club, isMember = false }: ClubCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={club.imageUrl || '/club-wallpaper-placeholder.png'}
        alt={club.name}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            {club.name}
          </Typography>
          <Chip 
            icon={club.isPrivate ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
            label={club.isPrivate ? "Private" : "Public"}
            size="small"
            color={club.isPrivate ? "default" : "primary"}
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {club.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {club.memberCount} members
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 30, height: 30 } }}>
            <Avatar alt="Member 1" src="https://source.unsplash.com/random/100x100/?portrait-1" />
            <Avatar alt="Member 2" src="https://source.unsplash.com/random/100x100/?portrait-2" />
            <Avatar alt="Member 3" src="https://source.unsplash.com/random/100x100/?portrait-3" />
            <Avatar alt="Member 4" src="https://source.unsplash.com/random/100x100/?portrait-4" />
          </AvatarGroup>
          
          <Link href={`/club/${club.id}`} passHref>
            <Button 
              variant={isMember ? "outlined" : "contained"} 
              size="small"
              color={isMember ? "secondary" : "primary"}
            >
              {isMember ? "View" : "Join"}
            </Button>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
}
