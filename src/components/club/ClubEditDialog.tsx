"use client";
import type { Club } from '@/types';
import { clubApi } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography, Switch, FormControlLabel } from '@mui/material';

export default function ClubEditDialog({ open, club, onClose }: { open: boolean, club: Club | null, onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      setIsPrivate(club.isPrivate || false);
      setError(null);
      setSuccess(false);
    }
  }, [club]);

  const handleSave = async () => {
    if (!club) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await clubApi.update(club.id, { 
        name, 
        description, 
        isPrivate: isPrivate 
      });
      if (error) throw new Error(error);
      setSuccess(true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Club</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" fullWidth />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} size="small" fullWidth multiline minRows={2} />
          <FormControlLabel control={<Switch checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} color="primary" />} label="Private Club" />
          {success && <Typography color="success.main">Saved!</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading || !name} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' } }}>{loading ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
