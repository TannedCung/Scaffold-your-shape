import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { challengeApi } from '@/lib/api';
import { Challenge, ChallengeParticipant, mapChallengeDbToChallenge } from '@/types';

interface ChallengeWithParticipation extends Challenge {
  isParticipant: boolean;
  userParticipation?: ChallengeParticipant;
  currentProgress?: number;
}

export function useChallengesWithParticipations() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<ChallengeWithParticipation[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch challenges with participation status included
        const { data: challengesData, error: challengesError } = await challengeApi.getAll();
        
        if (challengesError) {
          throw new Error(challengesError);
        }

        // The API now returns challenges with participation status already included
        const enrichedChallenges = (challengesData || []).map(challengeDb => {
          const mappedChallenge = mapChallengeDbToChallenge(challengeDb);
          
          // Map the participation data from snake_case to camelCase
          const userParticipation: ChallengeParticipant | undefined = challengeDb.user_participation ? {
            id: challengeDb.user_participation.id || '',
            challengeId: challengeDb.user_participation.challenge_id,
            userId: challengeDb.user_participation.user_id,
            currentValue: challengeDb.user_participation.current_value || 0,
            completed: challengeDb.user_participation.completed || false,
            completedAt: challengeDb.user_participation.completed_at || undefined,
            joinedAt: challengeDb.user_participation.joined_at,
            progressPercentage: challengeDb.user_participation.progress_percentage || 0,
            lastActivityDate: challengeDb.user_participation.last_activity_date || undefined,
            rank: challengeDb.user_participation.rank || undefined,
            notes: challengeDb.user_participation.notes || undefined
          } : undefined;

          return {
            ...mappedChallenge,
            isParticipant: challengeDb.is_participant || false,
            userParticipation,
            currentProgress: userParticipation?.currentValue || 0
          };
        });

        // Extract participations for the participations state
        const userParticipations = enrichedChallenges
          .filter(c => c.userParticipation)
          .map(c => c.userParticipation!);

        setChallenges(enrichedChallenges);
        setParticipations(userParticipations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  const refreshParticipations = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: participationsData, error: participationsError } = await challengeApi.getMyParticipations();
      
      console.log('Refresh participations API response:', { participationsData, participationsError, type: typeof participationsData, isArray: Array.isArray(participationsData) });
      
      if (participationsError) {
        console.warn('Warning refreshing participations:', participationsError);
        return;
      }

      // Ensure participationsData is an array
      const userParticipations = Array.isArray(participationsData) ? participationsData : [];
      setParticipations(userParticipations);

      // Update challenges with new participation status
      setChallenges(prevChallenges => 
        prevChallenges.map(challenge => {
          const participation = userParticipations.find(p => p.challengeId === challenge.id);
          return {
            ...challenge,
            isParticipant: !!participation,
            userParticipation: participation,
            currentProgress: participation?.currentValue || 0
          };
        })
      );
    } catch (err) {
      console.warn('Error refreshing participations:', err);
    }
  };

  return { 
    challenges, 
    participations, 
    loading, 
    error, 
    refreshParticipations 
  };
} 