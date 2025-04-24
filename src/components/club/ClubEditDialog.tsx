import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography, Switch, FormControlLabel } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function ClubEditDialog({ open, club, onClose }: { open: boolean, club: any, onClose: () => void }) {
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
      setIsPrivate(club.is_private || false);
      setError(null);
      setSuccess(false);
    }
  }, [club]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('clubs').update({ name, description, is_private: isPrivate }).eq('id', club.id);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
    onClose();
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
