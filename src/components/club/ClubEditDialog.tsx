"use client";
import type { Club } from '@/types';
import { clubApi } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  Switch, 
  FormControlLabel,
  Box,
  Input,
  CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import Image from 'next/image';

export default function ClubEditDialog({ 
  open, 
  club, 
  onClose,
  onSuccess,
  userRole
}: { 
  open: boolean; 
  club: Club | null; 
  onClose: () => void;
  onSuccess?: () => void;
  userRole?: 'admin' | 'member' | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin;

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      setIsPrivate(club.isPrivate || false);
      setBackgroundImagePreview(club.backgroundImageUrl || null);
      setBackgroundImage(null);
      setError(null);
      setSuccess(false);
    }
  }, [club]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToR2 = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'club-backgrounds');

      const response = await fetch('/api/upload/r2', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.key; // Returns the R2 key
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!club) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      let backgroundImageUrl = club.backgroundImageUrl;

      // Upload new background image if one was selected
      if (backgroundImage) {
        console.log('Uploading new background image...');
        backgroundImageUrl = await uploadImageToR2(backgroundImage);
        console.log('Upload successful, new key:', backgroundImageUrl);
      }

      console.log('Updating club with data:', { 
        name, 
        description, 
        isPrivate: isPrivate,
        backgroundImageUrl
      });

      const { error } = await clubApi.update(club.id, { 
        name, 
        description, 
        isPrivate: isPrivate,
        backgroundImageUrl
      });
      
      if (error) {
        console.error('Club update error:', error);
        throw new Error(error);
      }
      
      console.log('Club updated successfully');
      setSuccess(true);
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        Edit Club
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Permission Notice */}
          {!canEdit && (
            <Box sx={{
              bgcolor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="body2" sx={{ color: '#856404', fontWeight: 500 }}>
                ⚠️ Only club administrators can edit club information
              </Typography>
            </Box>
          )}

          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2da58e' }}>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              <TextField 
                label="Club Name *" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                fullWidth
                required
                disabled={!canEdit}
                error={!name && canEdit}
                helperText={!canEdit ? 'Editing requires admin privileges' : (!name ? 'Club name is required' : '')}
              />
              <TextField 
                label="Description *" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                fullWidth 
                multiline 
                minRows={3}
                required
                disabled={!canEdit}
                error={!description && canEdit}
                helperText={!canEdit ? 'Editing requires admin privileges' : (!description ? 'Description is required' : '')}
              />
            </Stack>
          </Box>

          {/* Background Image */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2da58e' }}>
              Background Image
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Current/Preview Image */}
              {backgroundImagePreview && (
                <Box sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 200, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  border: '2px solid #e0e0e0'
                }}>
                  <Image
                    src={backgroundImagePreview}
                    alt="Club background preview"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
              )}

              {/* Upload Button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="background-image-upload"
                  type="file"
                  onChange={handleImageUpload}
                  disabled={!canEdit}
                />
                <label htmlFor="background-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <PhotoCameraIcon />}
                    disabled={uploadingImage || !canEdit}
                    sx={{ 
                      borderColor: canEdit ? '#2da58e' : '#ccc', 
                      color: canEdit ? '#2da58e' : '#999',
                      '&:hover': canEdit ? { 
                        borderColor: '#1b7d6b', 
                        bgcolor: 'rgba(45, 165, 142, 0.04)' 
                      } : {},
                      '&:disabled': {
                        borderColor: '#ccc',
                        color: '#999'
                      }
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : (canEdit ? 'Choose Background Image' : 'Admin Required')}
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  Recommended: 1200x400px or larger
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Privacy Settings */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2da58e' }}>
              Privacy Settings
            </Typography>
            <FormControlLabel 
              control={
                <Switch 
                  checked={isPrivate} 
                  onChange={e => setIsPrivate(e.target.checked)} 
                  disabled={!canEdit}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: canEdit ? '#2da58e' : '#ccc',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: canEdit ? '#2da58e' : '#ccc',
                    },
                  }}
                />
              } 
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    Private Club
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Only members can see club content and activities
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Status Messages */}
          {success && (
            <Typography color="success.main" sx={{ textAlign: 'center', fontWeight: 600 }}>
              ✓ Club updated successfully!
            </Typography>
          )}
          {error && (
            <Typography color="error.main" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', pt: 2, px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading || uploadingImage}
          sx={{ px: 3 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={loading || uploadingImage || !name || !description || !canEdit} 
          variant="contained" 
          sx={{ 
            bgcolor: canEdit ? '#2da58e' : '#e0e0e0', 
            color: canEdit ? '#fff' : '#999', 
            px: 4,
            fontWeight: 600,
            '&:hover': canEdit ? { bgcolor: '#22796a' } : {},
            '&:disabled': { bgcolor: '#e0e0e0', color: '#999' }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Saving...
            </Box>
          ) : canEdit ? (
            'Save Changes'
          ) : (
            'Admin Access Required'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
