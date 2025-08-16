'use client';

/**
 * ClubLeaderboardSidebar - A compact leaderboard component designed for sidebar placement
 * Shows top 3 performers for a specific activity type in a club
 * Used in club detail pages to provide a quick overview of top members
 */

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardResult, LeaderboardEntry } from '@/lib/leaderboard';
import { formatScore, formatActivityValue } from '@/utils/formatUtils';

interface ClubLeaderboardSidebarProps {
  clubId: string;
  activityType?: string;
}

const getRankIcon = (rank: number): string => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `#${rank}`;
  }
};

const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return '#ffd700'; // Gold
    case 2:
      return '#c0c0c0'; // Silver
    case 3:
      return '#cd7f32'; // Bronze
    default:
      return '#2da58e';
  }
};

export default function ClubLeaderboardSidebar({
  clubId,
  activityType = 'run',
}: ClubLeaderboardSidebarProps) {
  const {
    leaderboard,
    loading,
    error,
  } = useLeaderboard({
    clubId,
    activityType,
    limit: 3,
    autoRefresh: true,
  });

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7faf9', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TrophyIcon sx={{ color: '#2da58e', fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#2da58e', fontWeight: 700 }}>
          Top Performers
        </Typography>
        <Chip 
          label={activityType} 
          size="small" 
          sx={{ 
            bgcolor: '#2da58e', 
            color: 'white', 
            textTransform: 'capitalize',
            fontSize: '0.75rem'
          }} 
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} sx={{ color: '#2da58e' }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
          Failed to load leaderboard
        </Alert>
      )}

      {!loading && !error && leaderboard && leaderboard.entries && (
        <>
          {leaderboard.entries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3, opacity: 0.8 }}>
              <TrendingUpIcon sx={{ fontSize: 32, mb: 1, color: '#2da58e', opacity: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                No activities yet for {activityType}
              </Typography>
            </Box>
          ) : (
            <Box>
              {leaderboard.entries.map((entry) => (
                <Box
                  key={entry.userId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1,
                    borderBottom: entry.rank < 3 ? '1px solid #e0f7f3' : 'none',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: getRankColor(entry.rank),
                      fontWeight: 'bold',
                      minWidth: 32,
                      fontSize: '1rem',
                    }}
                  >
                    {getRankIcon(entry.rank)}
                  </Typography>
                  
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: getRankColor(entry.rank),
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {entry.name.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {entry.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activityType === 'overall' ? (
                        <>
                          {formatScore(entry.score)} pts
                        </>
                      ) : (
                        <>
                          {formatActivityValue(entry.activityValue, entry.activityUnit)} 
                          {entry.activityValue && (
                            <span style={{ opacity: 0.7 }}> • {formatScore(entry.score)} pts</span>
                          )}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {leaderboard.totalMembers > 3 && (
                <Box sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    +{leaderboard.totalMembers - 3} more members
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </Paper>
  );
} 