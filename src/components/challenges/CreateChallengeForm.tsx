import React, { useState } from 'react';
import { challengeApi } from '@/lib/api';
import { Box, Button, TextField, Stack, Typography } from '@mui/material';

interface CreateChallengeFormProps {
  onSuccess?: () => void;
}

export default function CreateChallengeForm({ onSuccess }: CreateChallengeFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await challengeApi.create({ title, description });
      if (error) throw new Error(error);
      setSuccess(true);
      setTitle('');
      setDescription('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 0, border: '1px solid #e0e0e0', maxWidth: 400 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Create Challenge</Typography>
      <Stack spacing={2}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} size="small" fullWidth />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} size="small" fullWidth multiline minRows={2} />
        <Button onClick={handleCreate} disabled={loading || !title} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' }, borderRadius: 1, textTransform: 'none' }}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
        {success && <Typography color="success.main">Challenge created!</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
    </Box>
  );
}
