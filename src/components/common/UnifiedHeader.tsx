'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface UnifiedHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  avatar?: React.ReactNode | string;
  badges?: Array<{
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    variant?: 'filled' | 'outlined';
    icon?: React.ReactNode;
  }>;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'success' | 'error';
    loading?: boolean;
    icon?: React.ReactNode;
  }>;
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  showBackButton?: boolean;
  backButtonPath?: string;
  showShareButton?: boolean;
  onShare?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  showMoreActions?: boolean;
  onMoreActions?: () => void;
  loading?: boolean;
}

const MotionBox = motion(Box);

export default function UnifiedHeader({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundColor,
  avatar,
  badges = [],
  stats = [],
  actions = [],
  progress,
  showBackButton = true,
  backButtonPath,
  showShareButton = false,
  onShare,
  isFavorite,
  onFavoriteToggle,
  showMoreActions = false,
  onMoreActions,
  loading = false
}: UnifiedHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (backButtonPath) {
      router.push(backButtonPath);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          p: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const hasBackground = backgroundImage || backgroundColor;

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{
        position: 'relative',
        mb: 4,
        borderRadius: 3,
        overflow: 'hidden',
        ...(backgroundImage && {
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.6)}), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }),
        ...(backgroundColor && !backgroundImage && {
          background: `linear-gradient(135deg, ${backgroundColor}22, ${backgroundColor}11)`,
          border: `1px solid ${backgroundColor}33`
        }),
        ...(!hasBackground && {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        })
      }}
    >
      {/* Top Action Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showBackButton && (
            <IconButton
              onClick={handleBack}
              sx={{
                color: hasBackground ? 'white' : 'inherit',
                backgroundColor: hasBackground ? alpha('white', 0.1) : alpha(theme.palette.action.hover, 0.1),
                '&:hover': {
                  backgroundColor: hasBackground ? alpha('white', 0.2) : alpha(theme.palette.action.hover, 0.2)
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showShareButton && (
            <IconButton
              onClick={onShare}
              sx={{
                color: hasBackground ? 'white' : 'inherit',
                backgroundColor: hasBackground ? alpha('white', 0.1) : alpha(theme.palette.action.hover, 0.1),
                '&:hover': {
                  backgroundColor: hasBackground ? alpha('white', 0.2) : alpha(theme.palette.action.hover, 0.2)
                }
              }}
            >
              <ShareIcon />
            </IconButton>
          )}

          {onFavoriteToggle && (
            <IconButton
              onClick={onFavoriteToggle}
              sx={{
                color: isFavorite ? theme.palette.error.main : (hasBackground ? 'white' : 'inherit'),
                backgroundColor: hasBackground ? alpha('white', 0.1) : alpha(theme.palette.action.hover, 0.1),
                '&:hover': {
                  backgroundColor: hasBackground ? alpha('white', 0.2) : alpha(theme.palette.action.hover, 0.2)
                }
              }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          )}

          {showMoreActions && (
            <IconButton
              onClick={onMoreActions}
              sx={{
                color: hasBackground ? 'white' : 'inherit',
                backgroundColor: hasBackground ? alpha('white', 0.1) : alpha(theme.palette.action.hover, 0.1),
                '&:hover': {
                  backgroundColor: hasBackground ? alpha('white', 0.2) : alpha(theme.palette.action.hover, 0.2)
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Main Header Content */}
      <Box sx={{ p: 4, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          {/* Avatar */}
          {avatar && (
            <Box sx={{ flexShrink: 0 }}>
              {typeof avatar === 'string' ? (
                <Avatar
                  src={avatar}
                  sx={{
                    width: 80,
                    height: 80,
                    border: hasBackground ? '3px solid white' : `3px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[4]
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    border: hasBackground ? '3px solid white' : `3px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[4],
                    fontSize: '2rem'
                  }}
                >
                  {avatar}
                </Avatar>
              )}
            </Box>
          )}

          {/* Title and Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                mb: 1,
                lineHeight: 1.2,
                color: hasBackground ? 'white' : 'inherit'
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  opacity: 0.9,
                  color: hasBackground ? 'white' : 'text.secondary'
                }}
              >
                {subtitle}
              </Typography>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {badges.map((badge, index) => (
                  <Chip
                    key={index}
                    icon={badge.icon as React.ReactElement | undefined}
                    label={badge.label}
                    color={badge.color || 'primary'}
                    variant={badge.variant || 'filled'}
                    sx={{
                      fontWeight: 600,
                      ...(hasBackground && {
                        backgroundColor: alpha('white', 0.9),
                        color: theme.palette.primary.main,
                        '& .MuiChip-icon': {
                          color: theme.palette.primary.main
                        }
                      })
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Description */}
            {description && (
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  opacity: 0.9,
                  lineHeight: 1.6,
                  color: hasBackground ? 'white' : 'text.secondary'
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Stats */}
        {stats.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={4} flexWrap="wrap">
              {stats.map((stat, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stat.icon && (
                    <Box sx={{ color: hasBackground ? 'white' : theme.palette.primary.main }}>
                      {stat.icon}
                    </Box>
                  )}
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ 
                        lineHeight: 1,
                        color: hasBackground ? 'white' : 'inherit'
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: hasBackground ? alpha('white', 0.8) : 'text.secondary',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Progress */}
        {progress && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="body2"
                fontWeight="medium"
                sx={{ color: hasBackground ? alpha('white', 0.9) : 'text.secondary' }}
              >
                {progress.label || 'Progress'}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ color: hasBackground ? 'white' : 'inherit' }}
              >
                {progress.current} / {progress.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(progress.current / progress.total) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: hasBackground ? alpha('white', 0.2) : alpha(theme.palette.action.hover, 0.5),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: hasBackground ? 'white' : theme.palette.primary.main,
                  borderRadius: 4
                }
              }}
            />
          </Box>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                onClick={action.onClick}
                disabled={action.loading}
                startIcon={action.loading ? undefined : action.icon}
                sx={{
                  fontWeight: 600,
                  ...(hasBackground && action.variant === 'contained' && {
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha('white', 0.9)
                    }
                  }),
                  ...(hasBackground && action.variant === 'outlined' && {
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: alpha('white', 0.1),
                      borderColor: 'white'
                    }
                  })
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </MotionBox>
  );
} 

