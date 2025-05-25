"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Club } from '@/types';
import { clubApi } from '@/lib/api';

export default function ClubList() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data, error } = await clubApi.getAll();
        
        if (error) {
          throw new Error(error);
        }

        // Transform ClubDb to Club by adding required fields
        const transformedClubs = (data || []).map(club => ({
          ...club,
          creatorId: club.creator_id || '',
          memberCount: 0, // Default value, update if available
          isPrivate: false, // Default value, update if available 
          updatedAt: new Date().toISOString() // Default value, update if available
        }));

        setClubs(transformedClubs);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const handleDelete = async (deleteId: string) => {
    try {
      const { error } = await clubApi.delete(deleteId);
      
      if (error) {
        throw new Error(error);
      }

      setClubs(clubs.filter(club => club.id !== deleteId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete club');
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

  if (clubs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No clubs found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {clubs.map((club) => (
        <Paper
          key={club.id}
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
                {club.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {club.description}
              </Typography>
            </Box>
            <IconButton
              onClick={() => handleDelete(club.id)}
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
