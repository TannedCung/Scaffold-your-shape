"use client";

import React, { useState } from 'react';
import { useChallenges } from '@/hooks/useChallenges';
import { Box, Typography, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChallengeEditDialog from './ChallengeEditDialog';
import { supabase } from '@/lib/supabase';
import type { Challenge } from '@/types';

export default function ChallengeList() {
  const { challenges, loading, error } = useChallenges();
  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from('challenges').delete().eq('id', deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Challenges</Typography>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Stack spacing={2}>
        {challenges.map(challenge => (
          <Box key={challenge.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{challenge.title}</Typography>
              <Typography variant="body2" color="text.secondary">{challenge.description}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => setEditChallenge(challenge)}><EditIcon sx={{ color: '#2da58e' }} /></IconButton>
              <IconButton onClick={() => setDeleteId(challenge.id)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
            </Box>
          </Box>
        ))}
      </Stack>
      <ChallengeEditDialog open={!!editChallenge} challenge={editChallenge} onClose={() => setEditChallenge(null)} />
      {deleteId && (
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete Challenge?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this challenge?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
            <Button onClick={handleDelete} color="error" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
