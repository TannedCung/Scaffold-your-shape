import React, { useState } from 'react';
import { clubApi } from '@/lib/api';
import { Box, Button, TextField, Stack, Typography, Switch, FormControlLabel, Input, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface CreateClubFormProps {
  onSuccess?: () => void;
}

export default function CreateClubForm({ onSuccess }: CreateClubFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Uploads file to /api/upload/r2 and returns the TTL URL
  const uploadImageToR2 = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload/r2', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url as string;
    } catch (e) {
      console.error('Error uploading image:', e);
      return null;
    }
  };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: session } = useSession();

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let backgroundImageUrl: string | null = null;
      if (imageFile) {
        setUploading(true);
        backgroundImageUrl = await uploadImageToR2(imageFile);
        setUploading(false);
        if (!backgroundImageUrl) {
          throw new Error('Failed to upload background image.');
        }
      }

      const userId = session?.user?.id;
      const { error } = await clubApi.create({
        name,
        description,
        is_private: isPrivate,
        background_image_url: backgroundImageUrl,
        creator_id: userId
      });

      if (error) throw new Error(error);

      setSuccess(true);
      setName('');
      setDescription('');
      setIsPrivate(false);
      setImageFile(null);
      setImagePreview(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 0, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 0, border: '1px solid #e0e0e0', maxWidth: 400, overflow: 'hidden' }}>
      {/* Wallpaper-style background image */}
      <Box sx={{ position: 'relative', width: '100%', height: 140, bgcolor: '#e0f7f3', mb: 2 }}>
        <Image
          src={imagePreview || '/images/club-wallpaper-placeholder.png'}
          alt="Background Preview"
          width={400}
          height={140}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          priority
        />
        <label htmlFor="club-bg-upload">
          <Input
            id="club-bg-upload"
            type="file"
            inputProps={{ accept: 'image/*' }}
            onChange={handleImageChange}
            sx={{ display: 'none' }}
          />
          <Button
            variant="contained"
            component="span"
            size="small"
            sx={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              minWidth: 0,
              p: 1,
              bgcolor: '#2da58e',
              color: '#fff',
              borderRadius: 2,
              boxShadow: 1,
              textTransform: 'none',
              fontWeight: 500,
              ':hover': { bgcolor: '#22796a' }
            }}
            aria-label="Upload background image"
          >
            {uploading ? <CircularProgress size={18} color="inherit" /> : 'Upload'}
          </Button>
        </label>
      </Box>
      <Box sx={{ px: 3, pb: 3 }}>
        <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Create Club</Typography>
        <Stack spacing={2}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" fullWidth />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} size="small" fullWidth multiline minRows={2} />
          <FormControlLabel control={<Switch checked={isPrivate} onChange={event => setIsPrivate(event.target.checked)} color="primary" />} label="Private Club" />
          <Button onClick={handleCreate} disabled={loading || !name} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' }, borderRadius: 1, textTransform: 'none' }}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
          {success && <Typography color="success.main">Club created!</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </Stack>
      </Box>
    </Box>
  );
}
