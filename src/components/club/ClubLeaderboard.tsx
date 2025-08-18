'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { SportType } from '@/types';
import { useRouter } from 'next/navigation';
import UnifiedLeaderboard from '@/components/common/UnifiedLeaderboard';

interface ClubLeaderboardProps {
  clubId: string;
  defaultActivityType?: string;
  showRebuildButton?: boolean;
  autoRefresh?: boolean;
}

const activityTypeOptions = [
  { value: 'overall', label: 'Power Rankings', icon: '⚡' },
  { value: 'run', label: 'Running', icon: '🏃' },
  { value: 'bike', label: 'Cycling', icon: '🚴' },
  { value: 'swim', label: 'Swimming', icon: '🏊' },
  { value: 'walk', label: 'Walking', icon: '🚶' },
  { value: 'workout', label: 'Workout', icon: '💪' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
];

export default function ClubLeaderboard({
  clubId,
  defaultActivityType = 'overall',
  showRebuildButton = true,
  autoRefresh = false
}: ClubLeaderboardProps) {
  const router = useRouter();
  const theme = useTheme();
  const [activityType, setActivityType] = useState(defaultActivityType);

  const {
    leaderboard,
    loading,
    error,
    refresh,
    rebuild
  } = useLeaderboard({
    clubId: clubId || '',
    activityType: activityType as SportType,
    autoRefresh
  });

  // Transform data for UnifiedLeaderboard with comprehensive null checking
  const transformedEntries = React.useMemo(() => {
    if (!leaderboard?.entries || !Array.isArray(leaderboard.entries)) {
      return [];
    }
    
    return leaderboard.entries.map((entry: { userId?: string; userName?: string; name?: string; rank?: number; score?: number; activityValue?: number; activityUnit?: string; lastActivityDate?: string; avatarUrl?: string }) => ({
      userId: entry.userId || '',
      name: entry.userName || entry.name || 'Unknown',
      rank: entry.rank || 0,
      score: entry.score || 0,
      activityValue: entry.activityValue || 0,
      activityUnit: entry.activityUnit || '',
      lastActivityDate: entry.lastActivityDate,
      avatarUrl: entry.avatarUrl
    }));
  }, [leaderboard]);

  const totalMembers = React.useMemo(() => {
    if (leaderboard?.totalMembers && typeof leaderboard.totalMembers === 'number') {
      return leaderboard.totalMembers;
    }
    if (leaderboard?.entries && Array.isArray(leaderboard.entries)) {
      return leaderboard.entries.length;
    }
    return 0;
  }, [leaderboard]);

  // Early return if clubId is not provided
  if (!clubId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Club ID is required</Typography>
      </Box>
    );
  }

  const handleActivityTypeChange = (newType: string) => {
    setActivityType(newType);
  };

  const handleRebuild = () => {
    rebuild();
  };

  const selectedOption = activityTypeOptions.find(opt => opt.value === activityType);

  return (
    <Box>
      {/* Activity Type Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Activity Type</InputLabel>
          <Select
            value={activityType}
            label="Activity Type"
            onChange={(e) => handleActivityTypeChange(e.target.value)}
            sx={{
              backgroundColor: theme.palette.background.paper,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.divider, 0.2)
              }
            }}
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

      {/* Unified Leaderboard */}
      <UnifiedLeaderboard
        entries={transformedEntries}
        loading={loading}
        error={error}
        title={`${selectedOption?.icon} ${selectedOption?.label} Leaderboard`}
        subtitle={`${totalMembers} member${totalMembers !== 1 ? 's' : ''}`}
        showTopPodium={true}
        showProgress={false}
        showActivityValues={activityType !== 'overall'}
        showLastActivity={true}
        onRefresh={refresh}
        onRebuild={showRebuildButton ? handleRebuild : undefined}
        emptyMessage="No activities yet"
        type="club"
      />
    </Box>
  );
} 