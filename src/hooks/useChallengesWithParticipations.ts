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

        // Fetch challenges
        const { data: challengesData, error: challengesError } = await challengeApi.getAll();
        
        if (challengesError) {
          throw new Error(challengesError);
        }

        const mappedChallenges = (challengesData || []).map(mapChallengeDbToChallenge);

        // Fetch user participations if logged in
        let userParticipations: ChallengeParticipant[] = [];
        if (session?.user?.id) {
          const { data: participationsData, error: participationsError } = await challengeApi.getMyParticipations();
          
          console.log('Participations API response:', { participationsData, participationsError, type: typeof participationsData, isArray: Array.isArray(participationsData) });
          
          if (participationsError) {
            console.warn('Warning fetching participations:', participationsError);
          } else {
            // Ensure participationsData is an array
            userParticipations = Array.isArray(participationsData) ? participationsData : [];
          }
        }

        // Combine challenges with participation status
        const challengesWithParticipation: ChallengeWithParticipation[] = mappedChallenges.map(challenge => {
          const participation = userParticipations.find(p => p.challengeId === challenge.id);
          return {
            ...challenge,
            isParticipant: !!participation,
            userParticipation: participation,
            currentProgress: participation?.currentValue || 0
          };
        });

        setChallenges(challengesWithParticipation);
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