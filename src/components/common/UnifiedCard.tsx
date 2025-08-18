'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface UnifiedCardProps {
  children: React.ReactNode;
  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  animationDelay?: number;
  className?: string;
}

interface CardHeaderProps {
  avatar?: React.ReactNode | string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  chips?: Array<{
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    variant?: 'filled' | 'outlined';
  }>;
  loading?: boolean;
}

interface CardMetricsProps {
  metrics: Array<{
    icon?: React.ReactNode;
    label: string;
    value: string | number;
    unit?: string;
    color?: string;
  }>;
  layout?: 'horizontal' | 'vertical' | 'grid';
  loading?: boolean;
}

interface CardActionsProps {
  children: React.ReactNode;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between';
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: delay * 0.1,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const MotionCard = motion(Card);

// Main unified card component
export function UnifiedCard({
  children,
  hover = true,
  clickable = false,
  loading = false,
  variant = 'default',
  size = 'medium',
  onClick,
  animationDelay = 0,
  className
}: UnifiedCardProps) {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: { padding: 2, borderRadius: 2 },
    medium: { padding: 3, borderRadius: 2 },
    large: { padding: 4, borderRadius: 3 }
  };

  // Variant configurations
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          backgroundColor: 'transparent'
        };
              case 'elevated':
        return {
          boxShadow: theme.shadows[1],
          backgroundColor: theme.palette.background.paper
        };
      case 'filled':
        return {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        };
      default:
        return {
          backgroundColor: theme.palette.background.paper,
          boxShadow: 'none',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        };
    }
  };

  if (loading) {
    return (
      <Card sx={{ ...sizeConfig[size], ...getVariantStyles() }}>
        <CardContent>
          <Skeleton variant="rectangular" height={120} />
        </CardContent>
      </Card>
    );
  }

  return (
    <MotionCard
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      whileTap={clickable ? "tap" : undefined}
      custom={animationDelay}
      onClick={onClick}
      className={className}
      sx={{
        ...sizeConfig[size],
        ...getVariantStyles(),
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': hover ? {
          boxShadow: theme.shadows[1],
          transform: 'translateY(-1px)'
        } : {},
        overflow: 'hidden'
      }}
    >
      {children}
    </MotionCard>
  );
}

// Card header component
export function CardHeader({
  avatar,
  title,
  subtitle,
  action,
  chips,
  loading = false
}: CardHeaderProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {avatar && (
          typeof avatar === 'string' ? (
            <Avatar src={avatar} sx={{ width: 48, height: 48 }} />
          ) : (
            <Avatar sx={{ width: 48, height: 48 }}>
              {avatar}
            </Avatar>
          )
        )}
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            noWrap
            sx={{ lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              noWrap
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && (
          <Box sx={{ flexShrink: 0 }}>
            {action}
          </Box>
        )}
      </Box>

      {chips && chips.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip.label}
              color={chip.color || 'primary'}
              variant={chip.variant || 'filled'}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

// Card metrics component
export function CardMetrics({
  metrics,
  layout = 'horizontal',
  loading = false
}: CardMetricsProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
        ))}
      </Box>
    );
  }

  const getLayoutStyles = (): object => {
    switch (layout) {
      case 'vertical':
        return { flexDirection: 'column', gap: 2, my: 2 };
      case 'grid':
        return { 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: 2,
          my: 2
        };
      default:
        return { display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 };
    }
  };

  return (
    <Box sx={getLayoutStyles()}>
      {metrics.map((metric, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flex: layout === 'horizontal' ? 1 : 'none',
            minWidth: 0
          }}
        >
          {metric.icon && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: metric.color ? alpha(metric.color, 0.1) : alpha(theme.palette.primary.main, 0.1),
                color: metric.color || theme.palette.primary.main
              }}
            >
              {metric.icon}
            </Avatar>
          )}
          
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="medium"
              sx={{ display: 'block', lineHeight: 1 }}
            >
              {metric.label}
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              noWrap
              sx={{ 
                mt: 0.5,
                fontSize: '1.1rem',
                color: metric.color || 'text.primary'
              }}
            >
              {metric.value}
              {metric.unit && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 0.5, fontWeight: 'normal' }}
                >
                  {metric.unit}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// Card actions component
export function UnifiedCardActions({
  children,
  justifyContent = 'flex-end'
}: CardActionsProps) {
  return (
    <CardActions sx={{ justifyContent, pt: 1 }}>
      {children}
    </CardActions>
  );
}

// Card content wrapper
export function UnifiedCardContent({ children }: { children: React.ReactNode }) {
  return (
    <CardContent sx={{ '&:last-child': { pb: 3 } }}>
      {children}
    </CardContent>
  );
} 







