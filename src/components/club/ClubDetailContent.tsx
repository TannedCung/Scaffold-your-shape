'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import {
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  MoreVert as MoreVertIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useClubDetail } from '@/hooks/useClubDetail';
import { formatDistanceToNow } from 'date-fns';

interface ClubDetailContentProps {
  clubId: string;
}

export default function ClubDetailContent({ clubId }: ClubDetailContentProps) {
  const {
    club,
    loading,
    error,
    actionLoading,
    joinClub,
    leaveClub,
    updateMemberRole,
    removeMember,
    canManageMembers,
    canEditClub
  } = useClubDetail(clubId);

  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });

  const handleMemberMenuOpen = (event: React.MouseEvent<HTMLElement>, memberId: string) => {
    setMemberMenuAnchor(event.currentTarget);
    setSelectedMember(memberId);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
    setSelectedMember(null);
  };

  const handleJoinClub = async () => {
    const result = await joinClub();
    if (result.error) {
      // Handle error (you might want to show a snackbar)
      console.error('Failed to join club:', result.error);
    }
  };

  const handleLeaveClub = () => {
    setConfirmDialog({
      open: true,
      title: 'Leave Club',
      message: 'Are you sure you want to leave this club?',
      action: async () => {
        const result = await leaveClub();
        if (result.error) {
          console.error('Failed to leave club:', result.error);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handlePromoteToAdmin = () => {
    if (!selectedMember) return;
    setConfirmDialog({
      open: true,
      title: 'Promote to Admin',
      message: 'Are you sure you want to promote this member to admin?',
      action: async () => {
        const result = await updateMemberRole(selectedMember, 'admin');
        if (result.error) {
          console.error('Failed to promote member:', result.error);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
        handleMemberMenuClose();
      }
    });
  };

  const handleDemoteToMember = () => {
    if (!selectedMember) return;
    setConfirmDialog({
      open: true,
      title: 'Demote to Member',
      message: 'Are you sure you want to demote this admin to member?',
      action: async () => {
        const result = await updateMemberRole(selectedMember, 'member');
        if (result.error) {
          console.error('Failed to demote member:', result.error);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
        handleMemberMenuClose();
      }
    });
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    setConfirmDialog({
      open: true,
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member from the club?',
      action: async () => {
        const result = await removeMember(selectedMember);
        if (result.error) {
          console.error('Failed to remove member:', result.error);
        }
        setConfirmDialog({ ...confirmDialog, open: false });
        handleMemberMenuClose();
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !club) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Club not found'}</Alert>
      </Box>
    );
  }

  const selectedMemberData = selectedMember 
    ? club.membersList.find(m => m.userId === selectedMember)
    : null;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Club Header */}
      <Paper 
        sx={{ 
          mb: 3, 
          p: 3, 
          background: `linear-gradient(135deg, rgba(45, 165, 142, 0.1) 0%, rgba(27, 125, 107, 0.1) 100%)`,
          border: '1px solid rgba(45, 165, 142, 0.2)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={club.imageUrl || undefined} 
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 3,
              bgcolor: '#2da58e'
            }}
          >
            <GroupIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {club.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                icon={club.isPrivate ? <LockIcon /> : <PublicIcon />}
                label={club.isPrivate ? 'Private' : 'Public'}
                size="small"
                color={club.isPrivate ? 'default' : 'primary'}
              />
              <Chip
                icon={<GroupIcon />}
                label={`${club.memberCount} members`}
                size="small"
                variant="outlined"
              />
              {club.userMembership?.role === 'admin' && (
                <Chip
                  icon={<StarIcon />}
                  label="Admin"
                  size="small"
                  color="secondary"
                />
              )}
            </Box>
            <Typography variant="body1" color="text.secondary">
              {club.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {club.isMember ? (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ExitToAppIcon />}
                  onClick={handleLeaveClub}
                  disabled={actionLoading}
                >
                  Leave Club
                </Button>
                {canEditClub() && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    disabled={actionLoading}
                  >
                    Edit Club
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleJoinClub}
                disabled={actionLoading}
                sx={{
                  bgcolor: '#2da58e',
                  '&:hover': { bgcolor: '#1b7d6b' }
                }}
              >
                Join Club
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Club Stats */}
        <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Club Statistics
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Total Members</Typography>
                <Typography variant="h6" color="primary">{club.memberCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Admins</Typography>
                <Typography variant="h6" color="secondary">{club.adminCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Status</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {club.isPrivate ? 'Private' : 'Public'}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Created {formatDistanceToNow(new Date(club.created_at))} ago
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Members List */}
        <Box sx={{ flex: { xs: '1', md: '0 0 67%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Members ({club.memberCount})
              </Typography>
              <List>
                {club.membersList.map((member) => (
                  <ListItem key={member.id} divider>
                    <ListItemAvatar>
                      <Avatar src={member.profile?.avatar_url}>
                        {member.profile?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {member.profile?.name || 'Unknown User'}
                          </Typography>
                          <Chip
                            icon={member.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                            label={member.role}
                            size="small"
                            color={member.role === 'admin' ? 'secondary' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={`Joined ${formatDistanceToNow(new Date(member.joinedAt))} ago`}
                    />
                    {canManageMembers() && member.userId !== club.userMembership?.userId && (
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={(e) => handleMemberMenuOpen(e, member.userId)}
                          disabled={actionLoading}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Member Management Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleMemberMenuClose}
      >
        {selectedMemberData?.role === 'member' ? (
          <MenuItem onClick={handlePromoteToAdmin}>
            <AdminIcon sx={{ mr: 1 }} />
            Promote to Admin
          </MenuItem>
        ) : (
          <MenuItem onClick={handleDemoteToMember}>
            <PersonIcon sx={{ mr: 1 }} />
            Demote to Member
          </MenuItem>
        )}
        <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Remove Member
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.action} 
            color="primary" 
            variant="contained"
            disabled={actionLoading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 