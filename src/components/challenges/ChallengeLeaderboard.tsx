'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UnifiedLeaderboard from '@/components/common/UnifiedLeaderboard';

interface ChallengeLeaderboardProps {
  challengeId: string;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  challengeId: string;
  currentValue: number;
  progressPercentage: number;
  rank: number;
  joinedAt: string;
  lastActivityDate?: string;
  profile: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export default function ChallengeLeaderboard({ challengeId }: ChallengeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challengeInfo, setChallengeInfo] = useState<{ title?: string; participantCount?: number } | null>(null);

  const fetchLeaderboard = useCallback(async (rebuild = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `/api/challenges/${challengeId}/leaderboard?limit=50${rebuild ? '&rebuild=true' : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }
      
      setLeaderboard(result.data || []);
      setChallengeInfo(result.challengeInfo);
    } catch (err) {
      console.error('Error fetching challenge leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  const handleRefresh = () => {
    fetchLeaderboard(false);
  };

  const handleRebuild = () => {
    fetchLeaderboard(true);
  };

  useEffect(() => {
    if (challengeId) {
      fetchLeaderboard();
    }
  }, [challengeId, fetchLeaderboard]);

  // Transform data for UnifiedLeaderboard
  const transformedEntries = leaderboard.map(entry => ({
    userId: entry.userId,
    name: entry.profile?.fullName || 'Unknown',
    rank: entry.rank,
    currentValue: entry.currentValue,
    progressPercentage: entry.progressPercentage,
    completed: entry.progressPercentage >= 100,
    lastActivityDate: entry.lastActivityDate,
    avatarUrl: entry.profile?.avatarUrl
  }));

  return (
    <UnifiedLeaderboard
      entries={transformedEntries}
      loading={loading}
      error={error}
      title="Challenge Leaderboard"
      subtitle={challengeInfo ? `${challengeInfo.title} • ${challengeInfo.participantCount} participants` : undefined}
      showTopPodium={true}
      showProgress={true}
      showActivityValues={false}
      showLastActivity={true}
      onRefresh={handleRefresh}
      onRebuild={handleRebuild}
      emptyMessage="No participants yet"
      type="challenge"
    />
  );
} 
