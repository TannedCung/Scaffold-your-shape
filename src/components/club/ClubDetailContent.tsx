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
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Fade,
  useTheme
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
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useClubDetail } from '@/hooks/useClubDetail';
import { formatDistanceToNow } from 'date-fns';
import ClubEditDialog from './ClubEditDialog';
import ClubLeaderboard from './ClubLeaderboard';
import ClubMemberActivities from './ClubMemberActivities';
import { ClubMember } from '@/types';

interface ClubDetailContentProps {
  clubId: string;
}

function ClubDescription({ description }: { description: string }) {
  const theme = useTheme();
  
  return (
    <Fade in timeout={1000}>
      <Card sx={{ 
        mb: 3,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main, 
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            <EmojiEventsIcon sx={{ mr: 1 }} />
            Club Goal
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ 
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
}

function ClubActions({ 
  isMember, 
  onJoinClub, 
  onLeaveClub, 
  actionLoading, 
  canEditClub,
  onEditClub
}: { 
  isMember: boolean;
  onJoinClub: () => void;
  onLeaveClub: () => void;
  actionLoading: boolean;
  canEditClub: boolean;
  onEditClub: () => void;
}) {
  const theme = useTheme();
  
  return (
    <Fade in timeout={1200}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {isMember ? (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={onLeaveClub}
              disabled={actionLoading}
              sx={{ 
                fontWeight: 700, 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Leave Club
            </Button>
            {canEditClub && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEditClub}
                disabled={actionLoading}
                sx={{ 
                  borderColor: theme.palette.primary.main, 
                  color: theme.palette.primary.main, 
                  fontWeight: 700, 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: theme.palette.primary.main + '10',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Edit Club
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={onJoinClub}
              disabled={actionLoading}
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                color: '#fff', 
                fontWeight: 700, 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: theme.palette.primary.dark,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Join Club
            </Button>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: theme.palette.primary.main, 
                color: theme.palette.primary.main, 
                fontWeight: 700, 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: theme.palette.primary.main + '10',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Invite Friends
            </Button>
          </>
        )}
      </Box>
    </Fade>
  );
}

function ClubParticipationStats({ memberCount }: { memberCount: number }) {
  const theme = useTheme();
  
  return (
    <Fade in timeout={800}>
      <Card sx={{ 
        mb: 3,
        bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
        border: `1px solid ${theme.palette.primary.main}20`
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main, 
              width: 56, 
              height: 56,
              boxShadow: `0 4px 12px ${theme.palette.primary.main}30`
            }}>
              <PeopleIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 900,
                lineHeight: 1
              }}>
                {memberCount?.toLocaleString?.() ?? '0'}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: theme.palette.primary.dark, 
                fontWeight: 600
              }}>
                Active Members
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}

function MembersList({ members }: { members: Array<{ id: string; profile?: { name?: string }; role: string }> }) {
  const theme = useTheme();
  
  return (
    <Fade in timeout={1400}>
      <Card sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ 
            color: theme.palette.primary.main, 
            fontWeight: 700, 
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            <GroupIcon sx={{ mr: 1 }} />
            Club Members
          </Typography>
          <Table size="small" sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main + '10' }}>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.slice(0, 10).map((m) => (
                <TableRow key={m.id} sx={{ 
                  borderBottom: `1px solid ${theme.palette.primary.main}15`,
                  '&:hover': {
                    bgcolor: theme.palette.primary.main + '05'
                  }
                }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: theme.palette.primary.main, 
                        mr: 1.5,
                        fontSize: '0.875rem'
                      }}>
                        {m.profile?.name ? m.profile.name[0] : '?'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {m.profile?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={m.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                      label={m.role}
                      size="small"
                      color={m.role === 'admin' ? 'secondary' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {members.length > 10 && (
            <Typography variant="caption" color="text.secondary" sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 2,
              fontWeight: 500
            }}>
              Showing 10 of {members.length} members
            </Typography>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
}

export default function ClubDetailContent({ clubId }: ClubDetailContentProps) {
  const theme = useTheme();
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
    canEditClub,
    refresh
  } = useClubDetail(clubId);

  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const handleEditClub = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  if (loading || !club) {
    return null; // Loading and error handling is done in the wrapper component
  }

  const selectedMemberData = selectedMember 
    ? club.membersList.find(m => m.userId === selectedMember)
    : null;

  // Check if user is admin to show rebuild button
  const isAdmin = club.userMembership?.role === 'admin' || canEditClub();

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <ClubParticipationStats memberCount={club.memberCount} />
      <ClubDescription description={club.description} />
      <ClubActions 
        isMember={club.isMember}
        onJoinClub={handleJoinClub}
        onLeaveClub={handleLeaveClub}
        actionLoading={actionLoading}
        canEditClub={canEditClub()}
        onEditClub={handleEditClub}
      />
      
      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Main Content - Member Activities Feed */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ 
            pr: { lg: 2 }, // Add some padding on the right for large screens
            height: 'fit-content'
          }}>
            {club.isMember ? (
              <ClubMemberActivities clubId={clubId} />
            ) : (
              <Fade in timeout={1500}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                    border: `1px solid ${theme.palette.primary.main}30`,
                    borderRadius: 3,
                    maxWidth: 700,
                    mx: 'auto'
                  }}
                >
                  <EmojiEventsIcon sx={{ 
                    fontSize: 80, 
                    mb: 3, 
                    color: theme.palette.primary.main,
                    opacity: 0.8
                  }} />
                  <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 2
                  }}>
                    Join the Club to See Activities
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    maxWidth: 400,
                    mx: 'auto'
                  }}>
                    Connect with fellow members, view their activities, and stay motivated together.
                  </Typography>
                </Paper>
              </Fade>
            )}
          </Box>
        </Grid>
        
        {/* Sidebar - Full Leaderboard and Members */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Full Leaderboard (replaces Top Performers) */}
          {club.isMember && (
            <Box sx={{ mb: 4 }}>
              <ClubLeaderboard
                clubId={clubId}
                defaultActivityType="run"
                showRebuildButton={isAdmin}
                autoRefresh={true}
              />
            </Box>
          )}
          
          {/* Members List */}
          <MembersList members={club.membersList} />
        </Grid>
      </Grid>

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

      {/* Club Edit Dialog */}
      <ClubEditDialog 
        open={editDialogOpen}
        club={club}
        onClose={handleEditDialogClose}
        onSuccess={refresh}
        userRole={club?.userMembership?.role}
        members={club?.membersList}
      />
    </Box>
  );
} 