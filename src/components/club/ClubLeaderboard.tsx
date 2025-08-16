'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { SportType } from '@/types';
import { formatScore } from '@/utils/formatUtils';
import { useRouter } from 'next/navigation';

interface ClubLeaderboardProps {
  clubId: string;
  defaultActivityType?: string;
  showRebuildButton?: boolean;
  autoRefresh?: boolean;
}

const activityTypeOptions = [
  { value: 'run', label: 'Running', icon: '🏃' },
  { value: 'cycle', label: 'Cycling', icon: '🚴' },
  { value: 'walk', label: 'Walking', icon: '🚶' },
  { value: 'swim', label: 'Swimming', icon: '🏊' },
  { value: 'hike', label: 'Hiking', icon: '🥾' },
  { value: 'workout', label: 'Workout', icon: '💪' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  
];

const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return '#ffd700'; // Gold
    case 2:
      return '#c0c0c0'; // Silver
    case 3:
      return '#cd7f32'; // Bronze
    default:
      return '#6b7280'; // Gray
  }
};

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

export default function ClubLeaderboard({
  clubId,
  defaultActivityType = 'run',
  showRebuildButton = false,
  autoRefresh = false,
}: ClubLeaderboardProps) {
  const [selectedActivityType, setSelectedActivityType] = useState(defaultActivityType);
  const router = useRouter();
  
  const {
    leaderboard,
    loading,
    error,
    refresh,
    rebuild,
  } = useLeaderboard({
    clubId,
    activityType: selectedActivityType,
    limit: 50,
    autoRefresh,
  });

  // Debug logging for leaderboard data changes
  React.useEffect(() => {
    console.log(`🎯 [ClubLeaderboard] Data updated for ${clubId}:${selectedActivityType}:`, {
      loading,
      error,
      hasLeaderboard: !!leaderboard,
      entriesCount: leaderboard?.entries?.length || 0,
      totalMembers: leaderboard?.totalMembers || 0,
      entries: leaderboard?.entries?.slice(0, 3)?.map(e => ({ 
        userId: e.userId, 
        name: e.name, 
        score: e.score, 
        rank: e.rank 
      })) || []
    });
  }, [clubId, selectedActivityType, leaderboard, loading, error]);

  const handleActivityTypeChange = (newActivityType: string) => {
    setSelectedActivityType(newActivityType);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const handleRebuild = async () => {
    await rebuild();
  };

  const handleSettings = () => {
    router.push(`/club/${clubId}/point-conversion`);
  };

  const selectedActivity = activityTypeOptions.find(opt => opt.value === selectedActivityType);

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #2da58e 0%, #24977e 100%)',
      color: 'white',
      border: 'none',
      borderRadius: 3,
    }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrophyIcon sx={{ fontSize: 32, color: '#ffd700' }} />
            <Typography variant="h5" fontWeight="bold">
              Leaderboard
            </Typography>
            {selectedActivity && (
              <Chip
                label={`${selectedActivity.icon} ${selectedActivity.label}`}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 'medium',
                }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh}
                disabled={loading}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            {showRebuildButton && (
              <>
                <Tooltip title="Point Settings">
                  <IconButton 
                    onClick={handleSettings}
                    disabled={loading}
                    sx={{ color: 'white' }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rebuild Cache">
                  <IconButton 
                    onClick={handleRebuild}
                    disabled={loading}
                    sx={{ color: 'white' }}
                  >
                    <BuildIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Activity Type Selector */}
        <Box sx={{ mb: 3 }}>
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
              '& .MuiSelect-icon': {
                color: 'white',
              },
            }}
          >
            <InputLabel>Activity Type</InputLabel>
            <Select
              value={selectedActivityType}
              label="Activity Type"
              onChange={(e) => handleActivityTypeChange(e.target.value)}
            >
              {activityTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{option.icon}</span>
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Empty state when leaderboard exists but entries are undefined */}
        {!loading && !error && leaderboard && !leaderboard.entries && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            opacity: 0.8,
          }}>
            <TrendingUpIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              No data available
            </Typography>
            <Typography variant="body2">
              Unable to load leaderboard data. Please try refreshing.
            </Typography>
          </Box>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && leaderboard && leaderboard.entries && (
          <Box>
            {/* Stats */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 2,
              opacity: 0.9,
            }}>
              <Typography variant="body2">
                Total Members: {leaderboard.totalMembers || 0}
              </Typography>
              <Typography variant="body2">
                Showing top {leaderboard.entries.length} members
              </Typography>
            </Box>

            {leaderboard.entries.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                opacity: 0.8,
              }}>
                <TrendingUpIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  No activities yet
                </Typography>
                <Typography variant="body2">
                  Be the first to log a {selectedActivity?.label.toLowerCase()} activity!
                </Typography>
              </Box>
            ) : (
              <TableContainer 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                        Rank
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                        Member
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Score
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.entries.map((entry) => (
                      <TableRow
                        key={entry.userId}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell sx={{ color: 'white' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: getRankColor(entry.rank),
                                fontWeight: 'bold',
                                minWidth: 40,
                              }}
                            >
                              {getRankIcon(entry.rank)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            <Typography variant="body2" fontWeight="medium">
                              {entry.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white' }}>
                          <Typography variant="h6" fontWeight="bold">
                            {formatScore(entry.score)}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            points
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 