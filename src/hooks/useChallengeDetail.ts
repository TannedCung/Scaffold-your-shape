import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { challengeApi } from '@/lib/api';
import { 
  Challenge, 
  ChallengeParticipant, 
  ChallengeParticipantDb, 
  mapChallengeParticipantDbToChallengeParticipant,
  ExerciseUnit,
  ChallengeType,
  DifficultyLevel,
  RewardType,
  ChallengeStatus
} from '@/types';

interface ChallengeDetailData extends Challenge {
  isParticipant: boolean;
  userParticipation?: ChallengeParticipant;
  currentProgress?: number;
  progressPercentage?: number;
}

export function useChallengeDetail(challengeId: string) {
  const { data: session } = useSession();
  const [challenge, setChallenge] = useState<ChallengeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchChallengeData = async () => {
    if (!challengeId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch challenge details with participation status included
      const { data: apiResponse, error: challengeError } = await challengeApi.getById(challengeId);
      
      if (challengeError) {
        throw new Error(challengeError);
      }

      if (!apiResponse) {
        throw new Error('Challenge not found');
      }

      // Extract the actual challenge data from the nested response
      const challengeData = (apiResponse as unknown as { data: unknown }).data || apiResponse;

      // Convert snake_case user_participation to camelCase if it exists
      let userParticipation: ChallengeParticipant | undefined = undefined;
      if ((challengeData as unknown as { user_participation?: ChallengeParticipantDb }).user_participation) {
        const participationDb = (challengeData as unknown as { user_participation: ChallengeParticipantDb }).user_participation;
        userParticipation = mapChallengeParticipantDbToChallengeParticipant(participationDb);
      }

      // Extract challenge properties with proper type conversion
      const challengeDataTyped = challengeData as unknown as {
        id: string;
        title: string;
        description: string;
        creatorId: string;
        targetValue: number;
        unit: string;
        startDate: string;
        endDate: string;
        isPublic: boolean;
        participantCount: number;
        challengeType: string;
        difficultyLevel: string;
        rewardType: string;
        rewardValue: number;
        autoJoin: boolean;
        featured: boolean;
        status: string;
        created_at: string;
        updatedAt: string;
        is_participant?: boolean;
      };

      // Calculate progress percentage
      const progressPercentage = userParticipation && challengeDataTyped.targetValue > 0
        ? Math.min(100, Math.round((userParticipation.currentValue / challengeDataTyped.targetValue) * 100))
        : 0;

      const enrichedChallenge: ChallengeDetailData = {
        id: challengeDataTyped.id,
        title: challengeDataTyped.title,
        description: challengeDataTyped.description,
        creatorId: challengeDataTyped.creatorId,
        targetValue: challengeDataTyped.targetValue,
        unit: challengeDataTyped.unit as ExerciseUnit,
        startDate: challengeDataTyped.startDate,
        endDate: challengeDataTyped.endDate,
        isPublic: challengeDataTyped.isPublic,
        participantCount: challengeDataTyped.participantCount,
        challengeType: challengeDataTyped.challengeType as ChallengeType,
        difficultyLevel: challengeDataTyped.difficultyLevel as DifficultyLevel,
        rewardType: challengeDataTyped.rewardType as RewardType,
        rewardValue: challengeDataTyped.rewardValue,
        autoJoin: challengeDataTyped.autoJoin,
        featured: challengeDataTyped.featured,
        status: challengeDataTyped.status as ChallengeStatus,
        created_at: challengeDataTyped.created_at,
        updatedAt: challengeDataTyped.updatedAt,
        isParticipant: challengeDataTyped.is_participant || false,
        userParticipation,
        currentProgress: userParticipation?.currentValue || 0,
        progressPercentage
      };

      setChallenge(enrichedChallenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const fetchChallengeDataCallback = useCallback(fetchChallengeData, [challengeId]);

  useEffect(() => {
    fetchChallengeDataCallback();
  }, [fetchChallengeDataCallback]);

  const joinChallenge = async () => {
    if (!session?.user?.id || !challengeId) return { error: 'Unauthorized' };

    setActionLoading(true);
    try {
      const { error } = await challengeApi.join(challengeId);
      if (error) throw new Error(error);
      
      await fetchChallengeData(); // Refresh data
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to join challenge' };
    } finally {
      setActionLoading(false);
    }
  };

  const leaveChallenge = async () => {
    if (!session?.user?.id || !challengeId) return { error: 'Unauthorized' };

    setActionLoading(true);
    try {
      const { error } = await challengeApi.leave(challengeId);
      if (error) throw new Error(error);
      
      await fetchChallengeData(); // Refresh data
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to leave challenge' };
    } finally {
      setActionLoading(false);
    }
  };

  const updateProgress = async (currentValue: number, notes?: string) => {
    if (!session?.user?.id || !challengeId) return { error: 'Unauthorized' };

    setActionLoading(true);
    try {
      const { error } = await challengeApi.updateProgress(challengeId, { currentValue, notes });
      if (error) throw new Error(error);
      
      await fetchChallengeData(); // Refresh data
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update progress' };
    } finally {
      setActionLoading(false);
    }
  };

  const getChallengeStatus = () => {
    if (!challenge) return 'unknown';
    try {
      const now = new Date();
      const startDate = challenge.startDate ? new Date(challenge.startDate) : null;
      const endDate = challenge.endDate ? new Date(challenge.endDate) : null;
      
      if (startDate && now < startDate) return 'upcoming';
      if (endDate && now > endDate) return 'ended';
      return challenge.status || 'unknown';
    } catch (error) {
      return challenge.status || 'unknown';
    }
  };

  const getDaysRemaining = () => {
    if (!challenge?.endDate) return 0;
    try {
      const endDate = new Date(challenge.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      return 0;
    }
  };

  return {
    challenge,
    loading,
    error,
    actionLoading,
    joinChallenge,
    leaveChallenge,
    updateProgress,
    getChallengeStatus,
    getDaysRemaining,
    refresh: fetchChallengeData
  };
} 