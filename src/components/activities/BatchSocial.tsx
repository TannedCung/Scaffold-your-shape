'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, useTheme, Snackbar, Alert } from '@mui/material';
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbUp as ThumbUpIcon,
  ChatBubbleOutline as CommentOutlinedIcon,
  ShareOutlined as ShareOutlinedIcon
} from '@mui/icons-material';

interface BatchSocialProps {
  activityId: string;
  currentUserId?: string;
  socialData: {
    reactions: { [reactionType: string]: { count: number; users: any[] } };
    totalReactions: number;
    commentsCount: number;
    sharesCount: number;
  };
  onSocialUpdate?: () => void;
}

export default function BatchSocial({ 
  activityId, 
  currentUserId, 
  socialData,
  onSocialUpdate 
}: BatchSocialProps) {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

  // Get current user's reaction
  const userReaction = currentUserId ? 
    Object.entries(socialData.reactions).find(([type, data]) => 
      data.users.some(user => user.id === currentUserId)
    )?.[0] || null 
    : null;

  const handleReaction = async () => {
    if (!currentUserId) {
      setSnackbar({ open: true, message: 'Please sign in to react', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/activities/${activityId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: 'like' })
      });

      if (response.ok && onSocialUpdate) {
        onSocialUpdate();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to react', type: 'error' });
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType: 'internal' })
      });

      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.shareUrl);
        setSnackbar({ open: true, message: 'Link copied!', type: 'success' });
        if (onSocialUpdate) onSocialUpdate();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to share', type: 'error' });
    }
  };

  return (
    <>
      {/* Stats Display */}
      {(socialData.totalReactions > 0 || socialData.commentsCount > 0 || socialData.sharesCount > 0) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 2 }}>
          {socialData.totalReactions > 0 && (
            <Typography variant="body2" color="text.secondary">
              👍 {socialData.totalReactions}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {socialData.commentsCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                {socialData.commentsCount} comment{socialData.commentsCount !== 1 ? 's' : ''}
              </Typography>
            )}
            {socialData.sharesCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                {socialData.sharesCount} share{socialData.sharesCount !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', borderTop: `1px solid ${theme.palette.divider}`, pt: 1 }}>
        <Button
          fullWidth
          size="large"
          onClick={handleReaction}
          disabled={!currentUserId}
          sx={{
            color: userReaction ? theme.palette.primary.main : 'text.secondary',
            fontWeight: 600,
            textTransform: 'none',
            py: 1.5
          }}
          startIcon={userReaction ? <ThumbUpIcon sx={{ fontSize: 20 }} /> : <ThumbUpOutlinedIcon sx={{ fontSize: 20 }} />}
        >
          {userReaction ? 'Liked' : 'Like'}
        </Button>

        <Button
          fullWidth
          size="large"
          sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none', py: 1.5 }}
          startIcon={<CommentOutlinedIcon sx={{ fontSize: 20 }} />}
        >
          Comment
        </Button>

        <Button
          fullWidth
          size="large"
          onClick={handleShare}
          sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none', py: 1.5 }}
          startIcon={<ShareOutlinedIcon sx={{ fontSize: 20 }} />}
        >
          Share
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 