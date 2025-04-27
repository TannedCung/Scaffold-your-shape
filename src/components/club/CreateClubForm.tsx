import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Box, Button, TextField, Stack, Typography, Switch, FormControlLabel } from '@mui/material';

interface CreateClubFormProps {
  onSuccess?: () => void;
}

export default function CreateClubForm({ onSuccess }: CreateClubFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('clubs').insert([{ name, description, is_private: isPrivate }]);
    setLoading(false);
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setName('');
      setDescription('');
      setIsPrivate(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 0, border: '1px solid #e0e0e0', maxWidth: 400 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Create Club</Typography>
      <Stack spacing={2}>
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" fullWidth />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} size="small" fullWidth multiline minRows={2} />
        <FormControlLabel control={<Switch checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} color="primary" />} label="Private Club" />
        <Button onClick={handleCreate} disabled={loading || !name} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' }, borderRadius: 1, textTransform: 'none' }}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
        {success && <Typography color="success.main">Club created!</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
    </Box>
  );
}
