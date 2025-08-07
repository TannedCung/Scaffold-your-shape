import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
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
import ClubCardImage from './ClubCardImage';

interface ClubCardProps {
  club: Club;
}

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <Link href={`/club/${club.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'block' }}>
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
        {/* Club background image with signed URL support */}
        <ClubCardImage imageUrl={club.backgroundImageUrl || '/images/club-wallpaper-placeholder.png'} alt={club.name} />
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
        </CardContent>
      </Card>
    </Link>
  );
}
