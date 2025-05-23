"use client";
import type { Challenge } from '@/types';
import { challengeApi } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography } from '@mui/material';

export default function ChallengeEditDialog({ open, challenge, onClose }: { open: boolean, challenge: Challenge | null, onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title || '');
      setDescription(challenge.description || '');
      setError(null);
      setSuccess(false);
    }
  }, [challenge]);

  const handleSave = async () => {
    if (!challenge) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await challengeApi.update(challenge.id, { title, description });
      if (error) throw new Error(error);
      setSuccess(true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Challenge</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} size="small" fullWidth />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} size="small" fullWidth multiline minRows={2} />
          {success && <Typography color="success.main">Saved!</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading || !title} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' } }}>{loading ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
