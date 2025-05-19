"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Challenge } from '@/types';
import { challengeApi } from '@/lib/api';

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data, error } = await challengeApi.getAll();
        
        if (error) {
          throw new Error(error);
        }

        setChallenges(data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const handleDelete = async (deleteId: string) => {
    try {
      const { error } = await challengeApi.delete(deleteId);
      
      if (error) {
        throw new Error(error);
      }

      setChallenges(challenges.filter(challenge => challenge.id !== deleteId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete challenge');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (challenges.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No challenges found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {challenges.map((challenge) => (
        <Paper
          key={challenge.id}
          elevation={0}
          sx={{
            p: 2,
            bgcolor: '#f7faf9',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {challenge.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {challenge.description}
              </Typography>
            </Box>
            <IconButton
              onClick={() => handleDelete(challenge.id)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
