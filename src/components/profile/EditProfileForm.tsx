"use client";
import type { Profile } from '@/types';
import { profileApi } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Define a more generic profile type that can work with both Profile from types and SimpleProfile
interface EditProfileFormProps {
  profile?: {
    id: string;
    name?: string;
    email?: string;
    bio?: string;
    avatar_url?: string;
  };
  open?: boolean;
  onClose?: () => void;
  onSave?: () => void;
}

export default function EditProfileForm({ profile, open = false, onClose, onSave }: EditProfileFormProps) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form fields when the profile prop changes
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Reset success/error states when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!profile?.id) {
      setError("Cannot save: profile ID is missing");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error } = await profileApi.update({ 
        name, 
        bio, 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });
      
      if (error) throw new Error(error);
      
      setSuccess(true);
      if (onSave) onSave();
      
      // Auto close after successful save
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Render as a modal dialog if open prop is provided
  if (open !== undefined) {
    return (
      <Dialog 
        open={open} 
        onClose={loading ? undefined : onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{ 
            bgcolor: '#2da58e',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2
          }}
        >
          <Typography variant="h6">Edit Profile</Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose} 
            disabled={loading}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}

          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              fullWidth 
              variant="outlined"
            />
            
            <TextField 
              label="Avatar URL" 
              value={avatarUrl} 
              onChange={e => setAvatarUrl(e.target.value)} 
              fullWidth 
              variant="outlined"
              placeholder="https://example.com/your-image.jpg"
              helperText="Enter the URL to your profile picture"
            />
            
            <TextField 
              label="Bio" 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              fullWidth 
              multiline 
              rows={4}
              variant="outlined"
              placeholder="Tell us about yourself and your fitness journey"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !name}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ 
              bgcolor: '#2da58e', 
              '&:hover': { 
                bgcolor: '#1a8a73' 
              } 
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Render as a regular component (for backwards compatibility)
  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 0, border: '1px solid #e0e0e0', maxWidth: 400 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Edit Profile</Typography>
      <Stack spacing={2}>
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" fullWidth />
        <TextField label="Bio" value={bio} onChange={e => setBio(e.target.value)} size="small" fullWidth multiline minRows={2} />
        <TextField label="Avatar URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} size="small" fullWidth />
        <Button 
          onClick={handleSave} 
          disabled={loading || !name} 
          variant="contained" 
          sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' }, borderRadius: 1, textTransform: 'none' }}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
        {success && <Typography color="success.main">Profile updated!</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
    </Box>
  );
}
