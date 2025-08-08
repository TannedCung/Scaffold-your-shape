import React, { useState } from 'react';
import { clubApi } from '@/lib/api';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Input,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useSnackbar } from '@/contexts/SnackbarProvider';

interface CreateClubFormProps {
  onSuccess?: () => void;
}

export default function CreateClubForm({ onSuccess }: CreateClubFormProps) {
  const { showSuccess, showError } = useSnackbar();
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

  const { data: session } = useSession();

  const handleCreate = async () => {
    setLoading(true);
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
        isPrivate,
        backgroundImageUrl,
        creatorId: userId
      });

      if (error) throw new Error(error);

      showSuccess('Club created successfully!');
      setName('');
      setDescription('');
      setIsPrivate(false);
      setImageFile(null);
      setImagePreview(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Cover Image Section */}
      <Box sx={{ position: 'relative', height: 240, bgcolor: '#f0f9f6' }}>
    <Image
      src={imagePreview || '/images/club-wallpaper-placeholder.png'}
      alt="Club Cover"
      // Full width and height
      fill
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: imagePreview ? 'none' : 'opacity(0.7)'
      }}
      priority
    />

{/* Upload Button Overlay */ }
<Box sx={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: imagePreview ? 'rgba(0,0,0,0.3)' : 'rgba(45, 165, 142, 0.1)',
  opacity: imagePreview ? 0 : 1,
  transition: 'opacity 0.3s ease',
  '&:hover': { opacity: 1 }
}}>
  <label htmlFor="club-bg-upload" style={{ cursor: 'pointer' }}>
    <Input
      id="club-bg-upload"
      type="file"
      inputProps={{ accept: 'image/*' }}
      onChange={handleImageChange}
      sx={{ display: 'none' }}
    />
    <Tooltip title="Upload cover image" placement="top">
      <IconButton
        component="span"
        sx={{
          bgcolor: 'rgba(255,255,255,0.9)',
          color: '#2da58e',
          '&:hover': { bgcolor: 'white', transform: 'scale(1.05)' },
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {uploading ? (
          <CircularProgress size={24} sx={{ color: '#2da58e' }} />
        ) : (
          <PhotoCameraIcon />
        )}
      </IconButton>
    </Tooltip>
  </label>
</Box>
      </Box>

      {/* Form Content */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Required Fields Notice */}
          <Box sx={{
            bgcolor: '#f0f9f6',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e0f2e9'
          }}>
            <Typography variant="body2" sx={{ color: '#1d8b73', fontWeight: 500 }}>
              * Required fields
            </Typography>
          </Box>

          {/* Club Name */}
          <TextField
            label={
              <Box component="span">
                Club Name <Box component="span" sx={{ color: '#d32f2f' }}>*</Box>
              </Box>
            }
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
            placeholder="Enter your club name"
            error={!name && name !== ''}
            helperText={!name && name !== '' ? 'Club name is required' : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#2da58e' },
                '&.Mui-focused fieldset': { borderColor: '#2da58e' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#2da58e' }
            }}
          />

          {/* Club Description */}
          <TextField
            label={
              <Box component="span">
                Description <Box component="span" sx={{ color: '#d32f2f' }}>*</Box>
              </Box>
            }
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            variant="outlined"
            placeholder="Describe your club's purpose and activities"
            error={!description && description !== ''}
            helperText={!description && description !== '' ? 'Description is required' : 'Tell members what your club is about'}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#2da58e' },
                '&.Mui-focused fieldset': { borderColor: '#2da58e' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#2da58e' }
            }}
          />

          <Divider sx={{ borderColor: '#e0f2e9' }} />

          {/* Privacy Setting */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1d8b73', fontWeight: 600 }}>
              Privacy Settings
            </Typography>
            <Box sx={{
              border: '1px solid #e0f2e9',
              borderRadius: 2,
              p: 2,
              bgcolor: isPrivate ? '#fef7f0' : '#f0f9f6'
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={event => setIsPrivate(event.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#2da58e' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2da58e' }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isPrivate ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {isPrivate ? 'Private Club' : 'Public Club'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {isPrivate
                          ? 'Members need approval to join'
                          : 'Anyone can join instantly'
                        }
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Box>
          </Box>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={loading || !name.trim() || !description.trim()}
            variant="contained"
            size="large"
            fullWidth
            sx={{
              bgcolor: '#2da58e',
              color: 'white',
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(45, 165, 142, 0.3)',
              '&:hover': {
                bgcolor: '#1d8b73',
                boxShadow: '0 6px 16px rgba(45, 165, 142, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Creating Club...
              </Box>
            ) : (
              'Create Club'
            )}
          </Button>

          {/* Helper Text */}
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              px: 2
            }}
          >
            By creating a club, you become the admin and can manage members and settings.
          </Typography>
        </Stack>
      </Box>
    </>
  );
}
