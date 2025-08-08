"use client";
import type { Club, ClubMember } from '@/types';
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
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  PhotoCamera as PhotoCameraIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  SupervisorAccount as SupervisorIcon
} from '@mui/icons-material';
import Image from 'next/image';

export default function ClubEditDialog({ 
  open, 
  club, 
  onClose,
  onSuccess,
  userRole,
  members
}: { 
  open: boolean; 
  club: Club | null; 
  onClose: () => void;
  onSuccess?: () => void;
  userRole?: 'admin' | 'member' | null;
  members?: ClubMember[];
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
  const [currentTab, setCurrentTab] = useState(0);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState(false);
  const [loadingCurrentImage, setLoadingCurrentImage] = useState(false);
  
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin;

  // Helper: Returns true if URL looks like an R2 object key or URL
  const isR2Url = (url?: string | null) => {
    if (!url) return false;
    return url.startsWith('http') || url.startsWith('club-backgrounds/');
  };

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      setIsPrivate(club.isPrivate || false);
      setBackgroundImage(null);
      setError(null);
      setSuccess(false);

      // Handle background image URL
      if (club.backgroundImageUrl) {
        if (isR2Url(club.backgroundImageUrl)) {
          setLoadingCurrentImage(true);
          // If it's a key, not a full URL, extract the key
          const key = club.backgroundImageUrl.startsWith('http') 
            ? club.backgroundImageUrl.split('/').slice(-2).join('/') 
            : club.backgroundImageUrl;
          
          fetch('/api/r2/signed-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.url) {
                setBackgroundImagePreview(data.url);
              } else {
                setBackgroundImagePreview(null);
              }
            })
            .catch(() => {
              setBackgroundImagePreview(null);
            })
            .finally(() => {
              setLoadingCurrentImage(false);
            });
        } else {
          setBackgroundImagePreview(club.backgroundImageUrl);
        }
      } else {
        setBackgroundImagePreview(null);
      }
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

  const handleMemberMenuOpen = (event: React.MouseEvent<HTMLElement>, member: ClubMember) => {
    setMemberMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
    setSelectedMember(null);
  };

  const handlePromoteToAdmin = async () => {
    if (!selectedMember || !club) return;
    
    setMemberActionLoading(true);
    try {
      const { error } = await clubApi.updateMemberRole(club.id, selectedMember.userId, 'admin');
      if (error) throw new Error(error);
      
      if (onSuccess) onSuccess();
      handleMemberMenuClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote member');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleDemoteToMember = async () => {
    if (!selectedMember || !club) return;
    
    setMemberActionLoading(true);
    try {
      const { error } = await clubApi.updateMemberRole(club.id, selectedMember.userId, 'member');
      if (error) throw new Error(error);
      
      if (onSuccess) onSuccess();
      handleMemberMenuClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to demote member');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember || !club) return;
    
    setMemberActionLoading(true);
    try {
      const { error } = await clubApi.removeMember(club.id, selectedMember.userId);
      if (error) throw new Error(error);
      
      if (onSuccess) onSuccess();
      handleMemberMenuClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setMemberActionLoading(false);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SupervisorIcon sx={{ color: '#2da58e' }} />
          <Typography variant="h6" fontWeight={600}>
            Manage Club
          </Typography>
        </Box>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ 
            mt: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
            '& .Mui-selected': {
              color: '#2da58e !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2da58e',
            },
          }}
        >
          <Tab label="Club Settings" />
          <Tab label="Members" disabled={!isAdmin} />
        </Tabs>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {/* Club Settings Tab */}
        {currentTab === 0 && (
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
              {loadingCurrentImage ? (
                <Box sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 200, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  border: '2px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5'
                }}>
                  <CircularProgress size={32} sx={{ color: '#2da58e' }} />
                  <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
                    Loading current image...
                  </Typography>
                </Box>
              ) : backgroundImagePreview ? (
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
              ) : null}

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
        )}

        {/* Members Tab */}
        {currentTab === 1 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2da58e' }}>
                Member Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage club members and their roles. Only administrators can modify member roles.
              </Typography>

              {members && members.length > 0 ? (
                <List sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 1 }}>
                  {members.map((member) => (
                    <ListItem 
                      key={member.id}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        mb: 1,
                        '&:last-child': { mb: 0 },
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={member.profile?.avatar_url}
                          sx={{ bgcolor: '#2da58e' }}
                        >
                          {member.profile?.name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {member.profile?.name || 'Unknown User'}
                            </Typography>
                            <Chip
                              icon={member.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                              label={member.role}
                              size="small"
                              color={member.role === 'admin' ? 'secondary' : 'default'}
                              variant={member.role === 'admin' ? 'filled' : 'outlined'}
                              sx={{ 
                                fontSize: '0.75rem',
                                height: 20,
                                ...(member.role === 'admin' && {
                                  bgcolor: '#2da58e',
                                  color: 'white',
                                  '& .MuiChip-icon': { color: 'white' }
                                })
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Member Actions">
                          <IconButton 
                            onClick={(e) => handleMemberMenuOpen(e, member)}
                            disabled={memberActionLoading}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <PersonIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No members found
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Status Messages for Member Actions */}
            {error && (
              <Typography color="error.main" sx={{ textAlign: 'center' }}>
                {error}
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', pt: 2, px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading || uploadingImage || memberActionLoading}
          sx={{ px: 3 }}
        >
          {currentTab === 0 ? 'Cancel' : 'Close'}
        </Button>
        {currentTab === 0 && (
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
        )}
      </DialogActions>

      {/* Member Action Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleMemberMenuClose}
        PaperProps={{
          sx: {
            minWidth: 180,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        {selectedMember?.role === 'member' ? (
          <MenuItem 
            onClick={handlePromoteToAdmin}
            disabled={memberActionLoading}
            sx={{ gap: 1, py: 1.5 }}
          >
            <AdminIcon fontSize="small" sx={{ color: '#2da58e' }} />
            <Typography>Promote to Admin</Typography>
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={handleDemoteToMember}
            disabled={memberActionLoading}
            sx={{ gap: 1, py: 1.5 }}
          >
            <PersonIcon fontSize="small" sx={{ color: '#666' }} />
            <Typography>Demote to Member</Typography>
          </MenuItem>
        )}
        <MenuItem 
          onClick={handleRemoveMember}
          disabled={memberActionLoading}
          sx={{ gap: 1, py: 1.5, color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" />
          <Typography>Remove from Club</Typography>
        </MenuItem>
      </Menu>
    </Dialog>
  );
}
