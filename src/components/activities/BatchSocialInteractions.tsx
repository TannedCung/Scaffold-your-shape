'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Avatar,
  Tooltip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  useTheme,
  Snackbar,
  Alert,
  Popper,
  Zoom
} from '@mui/material';
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbUp as ThumbUpIcon,
  ChatBubbleOutline as CommentOutlinedIcon,
  ShareOutlined as ShareOutlinedIcon,
  Send as SendIcon,
  Close as CloseIcon,
  FavoriteBorder as HeartOutlinedIcon,
  Favorite as HeartIcon,
  SentimentVerySatisfied as LaughOutlinedIcon,
  EmojiEmotions as LaughIcon,
  Celebration as CelebrationIcon,
  LocalFireDepartment as FireIcon,
  FitnessCenter as MuscleIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import ActivityCard, { ActivityData } from './ActivityCard';

interface BatchSocialInteractionsProps {
  activityId: string;
  activity: ActivityData;
  currentUserId?: string;
  socialData: {
    reactions: { [reactionType: string]: { count: number; users: Array<{ id: string; name: string; avatar_url: string | null }> } };
    totalReactions: number;
    commentsCount: number;
    sharesCount: number;
  };
  onSocialUpdate?: () => void; // Callback to trigger batch refetch
}

const reactionTypes = [
  { 
    type: 'like', 
    outlineIcon: ThumbUpOutlinedIcon, 
    filledIcon: ThumbUpIcon, 
    emoji: '👍', 
    color: '#1877F2', 
    label: 'Like',
    scale: 1.2
  },
  { 
    type: 'love', 
    outlineIcon: HeartOutlinedIcon, 
    filledIcon: HeartIcon, 
    emoji: '❤️', 
    color: '#F02849', 
    label: 'Love',
    scale: 1.3
  },
  { 
    type: 'laugh', 
    outlineIcon: LaughOutlinedIcon, 
    filledIcon: LaughIcon, 
    emoji: '😂', 
    color: '#F7B125', 
    label: 'Haha',
    scale: 1.4
  },
  { 
    type: 'celebrate', 
    outlineIcon: CelebrationIcon, 
    filledIcon: CelebrationIcon, 
    emoji: '🎉', 
    color: '#8B46FF', 
    label: 'Celebrate',
    scale: 1.2
  },
  { 
    type: 'fire', 
    outlineIcon: FireIcon, 
    filledIcon: FireIcon, 
    emoji: '🔥', 
    color: '#FF5722', 
    label: 'Fire',
    scale: 1.3
  },
  { 
    type: 'muscle', 
    outlineIcon: MuscleIcon, 
    filledIcon: MuscleIcon, 
    emoji: '💪', 
    color: '#00D924', 
    label: 'Strong',
    scale: 1.2
  }
];

export default function BatchSocialInteractions({ 
  activityId, 
  activity, 
  currentUserId, 
  socialData,
  onSocialUpdate 
}: BatchSocialInteractionsProps) {
  const theme = useTheme();
  
  // State for reactions
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionAnchor, setReactionAnchor] = useState<null | HTMLElement>(null);
  
  // State for comments
  const [comments, setComments] = useState<Array<{ id: string; content: string; user: { id: string; name: string; avatar_url: string | null }; created_at: string; replies?: Array<{ id: string; content: string; user: { id: string; name: string; avatar_url: string | null }; created_at: string }> }>>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  
  // State for activity detail popup
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user's reaction from the batch data
  const userReaction = currentUserId ? 
    Object.entries(socialData.reactions).find(([type, data]) => 
      data.users.some(user => user.id === currentUserId)
    )?.[0] || null 
    : null;

  // Load comments when dialog opens
  const loadComments = async () => {
    if (commentsLoaded) return;
    
    try {
      const response = await fetch(`/api/activities/${activityId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setCommentsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Handle reaction (quick like or from picker)
  const handleReaction = async (reactionType: string) => {
    if (!currentUserId) {
      setSnackbar({ open: true, message: 'Please sign in to react', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/activities/${activityId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      });

      const data = await response.json();

      if (response.ok) {
        setShowReactionPicker(false);
        
        if (data.message) {
          setSnackbar({ open: true, message: data.message, type: 'success' });
        }
        
        // Trigger batch refetch
        if (onSocialUpdate) {
          onSocialUpdate();
        }
      } else {
        console.error('Reaction API error:', data);
        setSnackbar({ 
          open: true, 
          message: data.error || 'Failed to update reaction', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      setSnackbar({ 
        open: true, 
        message: 'Network error. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Handle reaction button hover
  const handleReactionHover = (event: React.MouseEvent<HTMLElement>) => {
    if (!currentUserId) return;
    
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
    }
    
    setReactionAnchor(event.currentTarget);
    setShowReactionPicker(true);
  };

  const handleReactionLeave = () => {
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 500);
  };

  const handlePickerEnter = () => {
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
    }
  };

  const handlePickerLeave = () => {
    setShowReactionPicker(false);
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!currentUserId) {
      setSnackbar({ open: true, message: 'Please sign in to comment', type: 'error' });
      return;
    }

    if (!newComment.trim() || commentLoading) {
      setSnackbar({ open: true, message: 'Please enter a comment', type: 'error' });
      return;
    }

    setCommentLoading(true);
    try {
      const response = await fetch(`/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setNewComment('');
        setCommentsLoaded(false); // Force reload comments
        setSnackbar({ 
          open: true, 
          message: data.message || 'Comment added!', 
          type: 'success' 
        });
        
        // Trigger batch refetch
        if (onSocialUpdate) {
          onSocialUpdate();
        }
      } else {
        console.error('Comment API error:', data);
        setSnackbar({ 
          open: true, 
          message: data.error || 'Failed to add comment', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setSnackbar({ 
        open: true, 
        message: 'Network error. Please try again.', 
        type: 'error' 
      });
    }
    setCommentLoading(false);
  };

  // Handle sharing
  const handleShare = async (platform: string = 'copy') => {
    try {
      const response = await fetch(`/api/activities/${activityId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shareType: platform === 'copy' ? 'internal' : 'external',
          platform: platform !== 'copy' ? platform : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (platform === 'copy') {
          navigator.clipboard.writeText(data.shareUrl);
          setSnackbar({ open: true, message: 'Link copied!', type: 'success' });
        } else if (data.externalShareUrl) {
          window.open(data.externalShareUrl, '_blank', 'width=600,height=400');
        }
        
        // Trigger batch refetch
        if (onSocialUpdate) {
          onSocialUpdate();
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to share', 
        type: 'error' 
      });
    }
  };

  // Get current user reaction details
  const currentReaction = userReaction ? reactionTypes.find(r => r.type === userReaction) : null;

  return (
    <>
      {/* Social Actions Bar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 2
      }}>
        {/* Reaction and counts */}
        {socialData.totalReactions > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {Object.entries(socialData.reactions)
                .filter(([_, data]) => data.count > 0)
                .slice(0, 3)
                .map(([type, _]) => {
                  const reaction = reactionTypes.find(r => r.type === type);
                  return reaction ? (
                    <Typography key={type} sx={{ fontSize: '1.2em', mr: -0.5 }}>
                      {reaction.emoji}
                    </Typography>
                  ) : null;
                })}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, ml: 0.5 }}>
              {socialData.totalReactions}
            </Typography>
          </Box>
        )}

        {/* Comments and shares count */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          {socialData.commentsCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {socialData.commentsCount} comment{socialData.commentsCount !== 1 ? 's' : ''}
            </Typography>
          )}
          {socialData.sharesCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {socialData.sharesCount} share{socialData.sharesCount !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        borderTop: `1px solid ${theme.palette.divider}`,
        pt: 1
      }}>
        {/* Like/Reaction Button */}
        <Button
          fullWidth
          size="large"
          onMouseEnter={handleReactionHover}
          onMouseLeave={handleReactionLeave}
          onClick={() => handleReaction(userReaction || 'like')}
          disabled={!currentUserId}
          sx={{
            color: currentReaction ? currentReaction.color : 'text.secondary',
            fontWeight: 600,
            textTransform: 'none',
            py: 1.5,
            '&:hover': {
              bgcolor: 'transparent',
              color: currentReaction ? currentReaction.color : theme.palette.primary.main
            }
          }}
          startIcon={
            currentReaction ? (
              <currentReaction.filledIcon sx={{ fontSize: 20 }} />
            ) : (
              <ThumbUpOutlinedIcon sx={{ fontSize: 20 }} />
            )
          }
        >
          {currentReaction ? currentReaction.label : 'Like'}
        </Button>

        {/* Comment Button */}
        <Button
          fullWidth
          size="large"
          onClick={() => {
            setDetailDialogOpen(true);
            loadComments();
          }}
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'none',
            py: 1.5,
            '&:hover': {
              bgcolor: 'transparent',
              color: theme.palette.primary.main
            }
          }}
          startIcon={<CommentOutlinedIcon sx={{ fontSize: 20 }} />}
        >
          Comment
        </Button>

        {/* Share Button */}
        <Button
          fullWidth
          size="large"
          onClick={() => handleShare('copy')}
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'none',
            py: 1.5,
            '&:hover': {
              bgcolor: 'transparent',
              color: theme.palette.primary.main
            }
          }}
          startIcon={<ShareOutlinedIcon sx={{ fontSize: 20 }} />}
        >
          Share
        </Button>
      </Box>

      {/* Reaction Picker Popup */}
      <Popper
        open={showReactionPicker}
        anchorEl={reactionAnchor}
        placement="top"
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Zoom {...TransitionProps}>
            <Paper
              onMouseEnter={handlePickerEnter}
              onMouseLeave={handlePickerLeave}
              sx={{
                p: 1,
                borderRadius: 6,
                bgcolor: 'background.paper',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                gap: 0.5
              }}
            >
              {reactionTypes.map((reaction) => (
                <Tooltip key={reaction.type} title={reaction.label} arrow>
                  <IconButton
                    onClick={() => handleReaction(reaction.type)}
                    sx={{
                      fontSize: '1.5em',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: `scale(${reaction.scale})`,
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    {reaction.emoji}
                  </IconButton>
                </Tooltip>
              ))}
            </Paper>
          </Zoom>
        )}
      </Popper>

      {/* Activity Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setDetailDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' },
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {/* Activity Card in Dialog */}
          <Box sx={{ p: 3, pb: 0 }}>
            <ActivityCard activity={activity} compact />
          </Box>

          <Divider sx={{ mx: 3, my: 2 }} />

          {/* Comments Section */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Comments ({socialData.commentsCount})
            </Typography>

            {/* Comments List */}
            <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
              {comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar src={comment.user.avatar_url || undefined} sx={{ width: 32, height: 32 }}>
                      {comment.user.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.grey[100], 
                      borderRadius: 2,
                      display: 'inline-block',
                      maxWidth: '100%'
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {comment.user.name}
                      </Typography>
                      <Typography variant="body2">
                        {comment.content}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2, mt: 0.5, display: 'block' }}>
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>

            {comments.length === 0 && commentsLoaded && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}

            {/* Comment Input */}
            {currentUserId && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  U
                </Avatar>
                <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={commentLoading}
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 500 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: theme.palette.grey[100]
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit();
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || commentLoading}
                    color="primary"
                    sx={{ bgcolor: theme.palette.primary.main + '10' }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 