import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  AvatarGroup,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  People as PeopleIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  Check as CheckIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { Club, ClubMember } from '@/types';
import ClubCardImage from './ClubCardImage';
import { clubApi } from '@/lib/api';

interface ClubCardProps {
  club: Club;
  userMembership?: ClubMember;
  onMembershipChange?: () => void;
  showMembershipActions?: boolean;
}

export default function ClubCard({ 
  club, 
  userMembership, 
  onMembershipChange, 
  showMembershipActions = false 
}: ClubCardProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const isMember = !!userMembership;

  const handleJoinClub = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActionLoading(true);
    try {
      const { error } = await clubApi.join(club.id);
      if (error) throw new Error(error);
      if (onMembershipChange) onMembershipChange();
    } catch (err) {
      console.error('Error joining club:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveClub = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActionLoading(true);
    try {
      const { error } = await clubApi.leave(club.id);
      if (error) throw new Error(error);
      if (onMembershipChange) onMembershipChange();
    } catch (err) {
      console.error('Error leaving club:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Link href={`/club/${club.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'block' }}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s, box-shadow 0.3s',
          border: isMember ? '2px solid #2da58e' : '1px solid rgba(0,0,0,0.12)',
          minHeight: '380px', // Increased minimum height for better content spacing
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          maxHeight: '420px',
        }}
      >
        {/* Club background image with membership indicator */}
        <Box sx={{ position: 'relative' }}>
          <ClubCardImage imageUrl={club.backgroundImageUrl || '/images/club-wallpaper-placeholder.png'} alt={club.name} />
          {isMember && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: '#2da58e',
                borderRadius: '50%',
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
            </Box>
          )}
        </Box>

        <CardContent sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          padding: '16px',
          '&:last-child': { paddingBottom: '16px' } // Ensure consistent bottom padding
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" fontWeight="bold">
              {club.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {userMembership?.role === 'admin' && (
                <Chip 
                  icon={<AdminIcon fontSize="small" />}
                  label="Admin"
                  size="small"
                  color="secondary"
                  variant="filled"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
              <Chip 
                icon={club.isPrivate ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
                label={club.isPrivate ? "Private" : "Public"}
                size="small"
                color={club.isPrivate ? "default" : "primary"}
                variant="outlined"
              />
            </Box>
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

          {/* Membership actions */}
          {showMembershipActions && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {isMember ? (
                <Tooltip title="Leave Club">
                  <IconButton 
                    onClick={handleLeaveClub}
                    disabled={actionLoading}
                    size="small"
                    sx={{ 
                      color: 'error.main',
                      '&:hover': { bgcolor: 'error.light', color: 'white' }
                    }}
                  >
                    {actionLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <ExitToAppIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Join Club">
                  <IconButton 
                    onClick={handleJoinClub}
                    disabled={actionLoading}
                    size="small"
                    sx={{ 
                      color: '#2da58e',
                      '&:hover': { bgcolor: '#2da58e', color: 'white' }
                    }}
                  >
                    {actionLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <PersonAddIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
