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
  TableCell
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
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { useClubDetail } from '@/hooks/useClubDetail';
import { formatDistanceToNow } from 'date-fns';

interface ClubDetailContentProps {
  clubId: string;
}

interface Activity {
  id: string;
  userName: string;
  type: string;
  name: string;
  value: number;
  unit: string;
  date: string;
}

// Placeholder activity data - replace with real data when available
const getClubActivities = (clubId: string): Activity[] => {
  // This would be replaced with actual API call
  return [];
};

function ClubActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7faf9', mb: 3 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700, mb: 2 }}>Recent Activities</Typography>
      {activities.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No activities yet.</Typography>
      ) : (
        <List>
          {activities.slice(0, 6).map((a) => (
            <ListItem key={a.id} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#2da58e' }}>{a.userName ? a.userName[0] : '?'}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600 }}>{a.userName || 'Unknown'}</Typography>}
                secondary={<>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {a.type}: {a.name} ({a.value} {a.unit})
                  </Typography>
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {new Date(a.date).toLocaleDateString()}
                  </Typography>
                </>}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

function ClubOverview({ description }: { description: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2da58e', mb: 1 }}>Overview</Typography>
      <Typography variant="body1" color="text.secondary">{description}</Typography>
    </Box>
  );
}

function Leaderboard({ members }: { members: Array<{ id: string; profile?: { name?: string }; role: string }> }) {
  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', mb: 3 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700, mb: 2 }}>Leaderboard</Typography>
      <Table size="small" sx={{ width: '100%' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#e0f7f3' }}>
            <TableCell sx={{ fontWeight: 700, color: '#2da58e' }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2da58e' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2da58e' }}>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.slice(0, 5).map((m, i) => (
            <TableRow key={m.id} sx={{ borderBottom: '1px solid #e0f7f3' }}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#2da58e', mr: 1 }}>
                    {m.profile?.name ? m.profile.name[0] : '?'}
                  </Avatar>
                  {m.profile?.name || 'Unknown'}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  icon={m.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                  label={m.role}
                  size="small"
                  color={m.role === 'admin' ? 'secondary' : 'default'}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function ClubDescription({ description }: { description: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2da58e', mb: 1 }}>Club Goal</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
    </Box>
  );
}

function ClubActions({ 
  isMember, 
  onJoinClub, 
  onLeaveClub, 
  actionLoading, 
  canEditClub 
}: { 
  isMember: boolean;
  onJoinClub: () => void;
  onLeaveClub: () => void;
  actionLoading: boolean;
  canEditClub: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {isMember ? (
        <>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ExitToAppIcon />}
            onClick={onLeaveClub}
            disabled={actionLoading}
            sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: 2 }}
          >
            Leave Club
          </Button>
          {canEditClub && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              disabled={actionLoading}
              sx={{ borderColor: '#2da58e', color: '#2da58e', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, ':hover': { bgcolor: '#e0f7f3' } }}
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
            sx={{ bgcolor: '#2da58e', color: '#fff', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, ':hover': { bgcolor: '#24977e' } }}
          >
            Join Club
          </Button>
          <Button
            variant="outlined"
            sx={{ borderColor: '#2da58e', color: '#2da58e', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, ':hover': { bgcolor: '#e0f7f3' } }}
          >
            Invite Friends
          </Button>
        </>
      )}
    </Box>
  );
}

function ClubParticipationStats({ memberCount }: { memberCount: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
      <GroupIcon sx={{ color: '#2da58e', fontSize: 32 }} />
      <Typography variant="h5" sx={{ color: '#2da58e', fontWeight: 800 }}>
        {memberCount?.toLocaleString?.() ?? '0'}
      </Typography>
      <Typography variant="body1" sx={{ color: '#24977e', fontWeight: 500, ml: 1 }}>
        participants
      </Typography>
    </Box>
  );
}

function ClubFinisherBadge() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f7faf9', p: 2, borderRadius: 2, mb: 3 }}>
      <EmojiEventsIcon sx={{ color: '#2da58e', fontSize: 48 }} />
      <Box>
                 <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700 }}>Earn a Digital Finisher&apos;s Badge!</Typography>
        <Typography variant="body2" color="text.secondary">
          Complete club milestones to earn a special digital badge for your Trophy Case. Show off your achievement and inspire others!
        </Typography>
      </Box>
    </Box>
  );
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

  if (loading || !club) {
    return null; // Loading and error handling is done in the wrapper component
  }

  const selectedMemberData = selectedMember 
    ? club.membersList.find(m => m.userId === selectedMember)
    : null;

  const activities = getClubActivities(clubId);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', px: { xs: 2, sm: 0 } }}>
      <ClubParticipationStats memberCount={club.memberCount} />
      <ClubDescription description={club.description} />
      <ClubActions 
        isMember={club.isMember}
        onJoinClub={handleJoinClub}
        onLeaveClub={handleLeaveClub}
        actionLoading={actionLoading}
        canEditClub={canEditClub()}
      />
      <ClubFinisherBadge />
      <ClubOverview description={club.description} />
      <ClubActivityFeed activities={activities} />
      <Leaderboard members={club.membersList} />

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