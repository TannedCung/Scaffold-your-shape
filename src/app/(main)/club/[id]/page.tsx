// Club Detail Page
import { notFound } from 'next/navigation';
import { Box, Typography, Avatar, Grid, CircularProgress, Divider, Paper, List, ListItem, ListItemAvatar, ListItemText, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { fetchClubs } from '@/services/clubService';
import { fetchActivities } from '@/services/activityService';
import { fetchProfile } from '@/services/profileService';
import { Club } from '@/types';
import ClubCardImage from '@/components/club/ClubCardImage';
import { Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import React from 'react';
import ClubHeader from './ClubHeader.client';

interface ClubStatsProps {
  club: Club;
}

function ClubStats({ club }: ClubStatsProps) {
  // Placeholder for statistics, replace with real data as needed
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" color="text.secondary">Members: {club.memberCount}</Typography>
      <Typography variant="subtitle1" color="text.secondary">Private: {club.isPrivate ? 'Yes' : 'No'}</Typography>
      <Typography variant="subtitle1" color="text.secondary">Created: {new Date(club.created_at).toLocaleDateString()}</Typography>
    </Box>
  );
}

interface ClubRankingProps {
  clubId: string;
}

async function getClubActivities(clubId: string) {
  // Fetch all activities, then filter by clubId if available in activity or user profile
  // For now, we assume clubId is not directly in Activity, so this is a placeholder for future schema
  return [];
}

async function getClubMembers(clubId: string) {
  // Placeholder: In real implementation, fetch club members from a service
  return [];
}

function TopMembers({ members }: { members: any[] }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
        Top Members
      </Typography>
      {members.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No data available</Typography>
      ) : (
        members.slice(0, 3).map((m, idx) => (
          <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#2da58e', mr: 1 }}>{m.name ? m.name[0] : '?'}</Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{m.name || 'Unknown'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>Score: {m.score ?? 0}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

function ClubActivityFeed({ activities }: { activities: any[] }) {
  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7faf9' }}>
      <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700, mb: 2 }}>Recent Activities</Typography>
      {activities.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No activities yet.</Typography>
      ) : (
        <List>
          {activities.slice(0, 6).map((a, idx) => (
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

function ClubOverview({ club }: { club: Club }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2da58e', mb: 1 }}>Overview</Typography>
      <Typography variant="body1" color="text.secondary">{club.description}</Typography>
    </Box>
  );
}

function ClubSidebar({ club, members }: { club: Club, members: any[] }) {
  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: '#e0f7f3', mb: 3, textAlign: 'center' }}>
      <Avatar sx={{ width: 64, height: 64, bgcolor: '#2da58e', mx: 'auto', mb: 2, fontWeight: 700, fontSize: 32 }}>{club.name[0]}</Avatar>
      <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700 }}>{club.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{club.memberCount} members</Typography>
      <Button variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', fontWeight: 700, mb: 1, ':hover': { bgcolor: '#24977e' } }}>Join Club</Button>
      <Button variant="outlined" sx={{ borderColor: '#2da58e', color: '#2da58e', fontWeight: 700, mb: 2, ml: 2 }}>Invite Friends</Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" color="text.secondary">Club created: {new Date(club.created_at).toLocaleDateString()}</Typography>
    </Paper>
  );
}

function Leaderboard({ members }: { members: any[] }) {
  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', mb: 3 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700, mb: 2 }}>Leaderboard</Typography>
      <Table size="small" sx={{ width: '100%' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#e0f7f3' }}>
            <TableCell sx={{ fontWeight: 700, color: '#2da58e' }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2da58e' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2da58e' }}>Distance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.slice(0, 5).map((m, idx) => (
            <TableRow key={m.id} sx={{ borderBottom: '1px solid #e0f7f3' }}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#2da58e', mr: 1 }}>{m.name ? m.name[0] : '?'}</Avatar>
                  {m.name || 'Unknown'}
                </Box>
              </TableCell>
              <TableCell>{m.distance ?? 0} km</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function ClubDescription({ club }: { club: Club }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2da58e', mb: 1 }}>Club Goal</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {club.description}
      </Typography>
    </Box>
  );
}

function ClubActions() {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Button
        variant="contained"
        aria-label="Join Club"
        sx={{ bgcolor: '#2da58e', color: '#fff', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, ':hover': { bgcolor: '#24977e' } }}
      >
        Join Club
      </Button>
      <Button
        variant="outlined"
        aria-label="Invite Friends"
        sx={{ borderColor: '#2da58e', color: '#2da58e', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, ':hover': { bgcolor: '#e0f7f3' } }}
      >
        Invite Friends
      </Button>
    </Box>
  );
}

function ClubParticipationStats({ club }: { club: Club }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
      <GroupIcon sx={{ color: '#2da58e', fontSize: 32 }} aria-label="Participants Icon" />
      <Typography variant="h5" sx={{ color: '#2da58e', fontWeight: 800 }}>
        {club.memberCount?.toLocaleString?.() ?? '0'}
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
      <EmojiEventsIcon sx={{ color: '#2da58e', fontSize: 48 }} aria-label="Finisher Badge" />
      <Box>
        <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700 }}>Earn a Digital Finisher's Badge!</Typography>
        <Typography variant="body2" color="text.secondary">
          Complete club milestones to earn a special digital badge for your Trophy Case. Show off your achievement and inspire others!
        </Typography>
      </Box>
    </Box>
  );
}

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const clubs = await fetchClubs();
  const club = clubs.find(c => c.id === params.id);
  if (!club) return notFound();

  // Placeholder: Fetch activities and members for this club
  const activities = await getClubActivities(club.id);
  const members = await getClubMembers(club.id);

  return (
    <MainLayout>
      <ClubHeader club={club} />
      <Box sx={{ maxWidth: 700, mx: 'auto', px: { xs: 2, sm: 0 } }}>
        <ClubParticipationStats club={club} />
        <ClubDescription club={club} />
        <ClubActions />
        <ClubFinisherBadge />
        <ClubOverview club={club} />
        <ClubActivityFeed activities={activities} />
        <Leaderboard members={members} />
      </Box>
    </MainLayout>
  );
}
