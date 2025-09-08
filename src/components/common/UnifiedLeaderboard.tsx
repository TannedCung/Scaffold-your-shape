'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  Badge,
  Divider,
  Button
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  LocalFireDepartmentOutlined as FireIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface LeaderboardEntry {
  userId: string;
  name: string;
  rank: number;
  score?: number;
  currentValue?: number;
  progressPercentage?: number;
  completed?: boolean;
  completedAt?: string;
  joinedAt?: string;
  lastActivityDate?: string;
  avatarUrl?: string;
  // For activity values display
  activityValue?: number;
  activityUnit?: string;
}

interface UnifiedLeaderboardProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  totalParticipants?: number;
  showTopPodium?: boolean;
  showProgress?: boolean;
  showActivityValues?: boolean;
  showLastActivity?: boolean;
  onRefresh?: () => void;
  onRebuild?: () => void;
  emptyMessage?: string;
  type?: 'club' | 'challenge';
}

const MotionPaper = motion(Paper);
const MotionListItem = motion(ListItem);

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <TrophyIcon sx={{ fontSize: 24, color: '#FFD700' }} />;
    case 2:
      return <TrophyIcon sx={{ fontSize: 22, color: '#C0C0C0' }} />;
    case 3:
      return <TrophyIcon sx={{ fontSize: 20, color: '#CD7F32' }} />;
    default:
      return (
        <Typography variant="h6" fontWeight="bold" color="text.secondary">
          {rank}
        </Typography>
      );
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return '#FFD700';
    case 2:
      return '#C0C0C0';
    case 3:
      return '#CD7F32';
    default:
      return 'transparent';
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return 'success';
  if (percentage >= 75) return 'warning';
  if (percentage >= 50) return 'info';
  return 'primary';
};

export default function UnifiedLeaderboard({
  entries,
  loading = false,
  error = null,
  title = 'Leaderboard',
  subtitle,
  totalParticipants,
  showTopPodium = true,
  showProgress = false,
  showActivityValues = false,
  showLastActivity = true,
  onRefresh,
  onRebuild,
  emptyMessage = 'No participants yet',
  type = 'club'
}: UnifiedLeaderboardProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (entries.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <TrophyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  const topThree = entries.slice(0, 3);
  const restOfEntries = entries.slice(3);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {totalParticipants && (
            <Typography variant="body2" color="text.secondary">
              {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onRefresh && (
            <Tooltip title="Refresh leaderboard">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          {onRebuild && (
            <Tooltip title="Rebuild cache">
              <Button
                variant="outlined"
                size="small"
                onClick={onRebuild}
                startIcon={<TrendingUpIcon />}
              >
                Rebuild
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Top 3 Podium */}
      {showTopPodium && topThree.length >= 3 && (
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}11, ${theme.palette.secondary.main}11)`,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            🏆 Top Performers
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 2 }}>
            {/* 2nd Place */}
            {topThree[1] && (
              <Box sx={{ textAlign: 'center', transform: 'translateY(10px)' }}>
                <Badge
                  badgeContent={<TrophyIcon sx={{ fontSize: 16, color: '#C0C0C0' }} />}
                  sx={{ mb: 1 }}
                >
                  <Avatar
                    src={topThree[1].avatarUrl}
                    sx={{ 
                      width: 60, 
                      height: 60,
                      border: '3px solid #C0C0C0',
                      boxShadow: theme.shadows[1]
                    }}
                  >
                    {topThree[1].name[0]}
                  </Avatar>
                </Badge>
                <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: 80 }}>
                  {topThree[1].name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {showActivityValues && topThree[1].activityValue ? 
                    `${topThree[1].activityValue} ${topThree[1].activityUnit}` :
                    `${topThree[1].score || topThree[1].currentValue} points`
                  }
                </Typography>
              </Box>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <Box sx={{ textAlign: 'center' }}>
                <Badge
                  badgeContent={<TrophyIcon sx={{ fontSize: 20, color: '#FFD700' }} />}
                  sx={{ mb: 1 }}
                >
                  <Avatar
                    src={topThree[0].avatarUrl}
                    sx={{ 
                      width: 80, 
                      height: 80,
                      border: '4px solid #FFD700',
                      boxShadow: theme.shadows[1]
                    }}
                  >
                    {topThree[0].name[0]}
                  </Avatar>
                </Badge>
                <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: 100 }}>
                  {topThree[0].name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {showActivityValues && topThree[0].activityValue ? 
                    `${topThree[0].activityValue} ${topThree[0].activityUnit}` :
                    `${topThree[0].score || topThree[0].currentValue} points`
                  }
                </Typography>
              </Box>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <Box sx={{ textAlign: 'center', transform: 'translateY(20px)' }}>
                <Badge
                  badgeContent={<TrophyIcon sx={{ fontSize: 14, color: '#CD7F32' }} />}
                  sx={{ mb: 1 }}
                >
                  <Avatar
                    src={topThree[2].avatarUrl}
                    sx={{ 
                      width: 50, 
                      height: 50,
                      border: '2px solid #CD7F32',
                      boxShadow: theme.shadows[1]
                    }}
                  >
                    {topThree[2].name[0]}
                  </Avatar>
                </Badge>
                <Typography variant="caption" fontWeight="bold" noWrap sx={{ maxWidth: 70, display: 'block' }}>
                  {topThree[2].name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {showActivityValues && topThree[2].activityValue ? 
                    `${topThree[2].activityValue} ${topThree[2].activityUnit}` :
                    `${topThree[2].score || topThree[2].currentValue} points`
                  }
                </Typography>
              </Box>
            )}
          </Box>
        </MotionPaper>
      )}

      {/* Full Leaderboard */}
      <Paper sx={{ bgcolor: 'background.paper' }}>
        <List sx={{ p: 0 }}>
          {entries.map((entry, index) => (
            <React.Fragment key={entry.userId}>
              <MotionListItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                sx={{
                  py: 2,
                  px: 3,
                  borderLeft: entry.rank <= 3 ? `4px solid ${getRankColor(entry.rank)}` : '4px solid transparent',
                  backgroundColor: entry.rank <= 3 ? `${getRankColor(entry.rank)}08` : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemAvatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 80 }}>
                    {getRankIcon(entry.rank)}
                    <Avatar
                      src={entry.avatarUrl}
                      sx={{
                        width: 48,
                        height: 48,
                        border: entry.rank <= 3 ? `2px solid ${getRankColor(entry.rank)}` : 'none'
                      }}
                    >
                      {entry.name[0]}
                    </Avatar>
                  </Box>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={entry.rank <= 3 ? 'bold' : 'medium'}>
                        {entry.name}
                      </Typography>
                      {entry.completed && (
                        <Chip
                          label="Complete!"
                          size="small"
                          color="success"
                          icon={<StarIcon sx={{ fontSize: 16 }} />}
                        />
                      )}
                      {entry.rank === 1 && (
                        <FireIcon sx={{ fontSize: 18, color: '#FF6B35' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {/* Score/Value Display */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {showActivityValues && entry.activityValue ? 
                            `${entry.activityValue} ${entry.activityUnit}` :
                            `${entry.score || entry.currentValue} ${type === 'challenge' ? 'units' : 'points'}`
                          }
                          {showProgress && entry.progressPercentage !== undefined && (
                            <span style={{ marginLeft: 8, color: theme.palette.text.secondary }}>
                              ({entry.progressPercentage.toFixed(1)}%)
                            </span>
                          )}
                        </Typography>
                        
                        {showLastActivity && entry.lastActivityDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 12 }} />
                            {formatDistanceToNow(new Date(entry.lastActivityDate), { addSuffix: true })}
                          </Typography>
                        )}
                      </Box>
                      
                      {/* Progress Bar */}
                      {showProgress && entry.progressPercentage !== undefined && (
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(entry.progressPercentage, 100)}
                          color={getProgressColor(entry.progressPercentage)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.palette.action.hover
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              </MotionListItem>
              {index < entries.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
} 


