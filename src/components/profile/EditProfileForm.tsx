"use client";
import type { Profile } from '@/types';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Box, Button, TextField, Stack, Typography } from '@mui/material';

export default function EditProfileForm({ profile, onSave }: { profile: Profile, onSave?: () => void }) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('profiles').update({ name, bio, avatar_url: avatarUrl }).eq('id', profile.id);
    setLoading(false);
    if (error) setError(error.message);
    else {
      setSuccess(true);
      if (onSave) onSave();
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 0, border: '1px solid #e0e0e0', maxWidth: 400 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Edit Profile</Typography>
      <Stack spacing={2}>
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" fullWidth />
        <TextField label="Bio" value={bio} onChange={e => setBio(e.target.value)} size="small" fullWidth multiline minRows={2} />
        <TextField label="Avatar URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} size="small" fullWidth />
        <Button onClick={handleSave} disabled={loading || !name} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' }, borderRadius: 1, textTransform: 'none' }}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        {success && <Typography color="success.main">Profile updated!</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
    </Box>
  );
}
