'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Fade,
  Skeleton,
  Tooltip,
  Zoom,
  Menu,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  FitnessCenterOutlined as StrengthIcon,
  DirectionsRunOutlined as CardioIcon,
  SelfImprovementOutlined as FlexibilityIcon,
  LocalFireDepartmentOutlined as CaloriesIcon,
  PlayCircleOutline as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  // Muscle group icons - fitness-focused and anatomically clear
  FavoriteBorderOutlined as ChestIcon,           // Heart/chest cavity
  AirlineSeatReclineExtraOutlined as BackIcon,  // Reclined posture showing back
  OpenInFullOutlined as ShouldersIcon,           // Expand/width representing shoulders
  SportsMmaOutlined as ArmsIcon,                 // MMA/fighting representing arm strength
  FilterCenterFocusOutlined as CoreIcon,         // Center focus for core/abs
  DirectionsRunOutlined as LegsIcon,             // Running figure for legs
  AccessibilityOutlined as FullBodyIcon,         // Full human figure
  // Difficulty icons
  Stars as BeginnerIcon,
  TrendingUp as IntermediateIcon,
  Whatshot as AdvancedIcon
} from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import MuscleDiagram3D from '@/components/workout/MuscleDiagram3DWithModel';
import { Exercise, ExerciseType } from '@/types';
import {
  getExerciseTypeChipStylesWithAlpha,
  getExerciseDifficultyChipStylesWithAlpha
} from '@/constants/colors';

const TYPE_ICONS = {
  strength: <StrengthIcon />,
  cardio: <CardioIcon />,
  flexibility: <FlexibilityIcon />,
};


const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', icon: <ChestIcon />, keywords: ['chest', 'pectorals', 'upper-chest', 'mid-chest', 'lower-chest'] },
  { id: 'back', label: 'Back', icon: <BackIcon />, keywords: ['back', 'lats', 'trapezius', 'rhomboids', 'erector-spinae', 'upper-back'] },
  { id: 'shoulders', label: 'Shoulders', icon: <ShouldersIcon />, keywords: ['shoulders', 'deltoid', 'anterior-deltoid', 'lateral-deltoid', 'posterior-deltoid'] },
  { id: 'arms', label: 'Arms', icon: <ArmsIcon />, keywords: ['arms', 'biceps', 'triceps', 'forearms', 'brachialis'] },
  { id: 'core', label: 'Core', icon: <CoreIcon />, keywords: ['core', 'abs', 'obliques', 'abdominals', 'rectus-abdominis'] },
  { id: 'legs', label: 'Legs', icon: <LegsIcon />, keywords: ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'quads'] },
  { id: 'full-body', label: 'Full Body', icon: <FullBodyIcon />, keywords: ['full-body', 'full body', 'cardiovascular'] },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ExerciseType | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [muscleMenuAnchor, setMuscleMenuAnchor] = useState<null | HTMLElement>(null);
  const [hoveredExercise, setHoveredExercise] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, [typeFilter, difficultyFilter]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);
      
      const response = await fetch(`/api/exercises?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      
      const data = await response.json();
      setExercises(data.exercises || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMuscleToggle = (muscleId: string) => {
    setMuscleFilter(prev =>
      prev.includes(muscleId)
        ? prev.filter(id => id !== muscleId)
        : [...prev, muscleId]
    );
  };

  const handleClearMuscleFilter = () => {
    setMuscleFilter([]);
  };

  const filteredExercises = exercises.filter((exercise) => {
    // Text search
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Muscle filter
    const matchesMuscle = muscleFilter.length === 0 || muscleFilter.some(muscleId => {
      const muscleGroup = MUSCLE_GROUPS.find(g => g.id === muscleId);
      if (!muscleGroup) return false;
      
      return exercise.muscleGroups.some(exMuscle =>
        muscleGroup.keywords.some(keyword =>
          exMuscle.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });
    
    return matchesSearch && matchesMuscle;
  });

  const featuredExercises = filteredExercises.filter(ex => ex.isFeatured);
  const regularExercises = filteredExercises.filter(ex => !ex.isFeatured);

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#2da58e' }}>
            Exercise Guide
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover comprehensive guides for cardio, strength training, and flexibility exercises
          </Typography>
        </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {/* Search Bar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#2da58e' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  '&:hover fieldset': {
                    borderColor: '#2da58e',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2da58e',
                  }
                }
              }}
            />
          </Grid>

          {/* Muscle Target Filter */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={(e) => setMuscleMenuAnchor(e.currentTarget)}
              endIcon={<ExpandMoreIcon />}
              startIcon={<FilterIcon />}
              sx={{
                height: '56px',
                borderRadius: '16px',
                justifyContent: 'space-between',
                borderColor: muscleFilter.length > 0 ? '#2da58e' : 'rgba(0, 0, 0, 0.23)',
                color: muscleFilter.length > 0 ? '#2da58e' : 'inherit',
                backgroundColor: muscleFilter.length > 0 ? 'rgba(45, 165, 142, 0.04)' : 'transparent',
                '&:hover': {
                  borderColor: '#2da58e',
                  backgroundColor: 'rgba(45, 165, 142, 0.08)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>
                  Target Muscles
                  {muscleFilter.length > 0 && ` (${muscleFilter.length})`}
                </Typography>
              </Box>
            </Button>
            <Menu
              anchorEl={muscleMenuAnchor}
              open={Boolean(muscleMenuAnchor)}
              onClose={() => setMuscleMenuAnchor(null)}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  minWidth: 250,
                }
              }}
            >
              {MUSCLE_GROUPS.map((muscle) => (
                <MenuItem
                  key={muscle.id}
                  onClick={() => handleMuscleToggle(muscle.id)}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(45, 165, 142, 0.08)',
                    }
                  }}
                >
                  <Checkbox
                    checked={muscleFilter.includes(muscle.id)}
                    sx={{
                      color: '#2da58e',
                      '&.Mui-checked': {
                        color: '#2da58e',
                      }
                    }}
                  />
                  <ListItemIcon sx={{ color: '#2da58e', minWidth: 40 }}>
                    {muscle.icon}
                  </ListItemIcon>
                  <ListItemText primary={muscle.label} />
                </MenuItem>
              ))}
              {muscleFilter.length > 0 && (
                <>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleClearMuscleFilter();
                      setMuscleMenuAnchor(null);
                    }}
                    sx={{ justifyContent: 'center', color: '#ef4444' }}
                  >
                    Clear All
                  </MenuItem>
                </>
              )}
            </Menu>
          </Grid>

          {/* Type Filter */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ToggleButtonGroup
              value={typeFilter}
              exclusive
              onChange={(_, newType) => newType && setTypeFilter(newType)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(45, 165, 142, 0.12)',
                    color: '#2da58e',
                    fontWeight: 600,
                  }
                }
              }}
            >
              <ToggleButton value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  All Types
                </Box>
              </ToggleButton>
              <ToggleButton value="cardio">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CardioIcon fontSize="small" />
                  Cardio
                </Box>
              </ToggleButton>
              <ToggleButton value="strength">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StrengthIcon fontSize="small" />
                  Strength
                </Box>
              </ToggleButton>
              <ToggleButton value="flexibility">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FlexibilityIcon fontSize="small" />
                  Flexibility
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Difficulty Filter */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ToggleButtonGroup
              value={difficultyFilter}
              exclusive
              onChange={(_, newDifficulty) => newDifficulty && setDifficultyFilter(newDifficulty)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(45, 165, 142, 0.12)',
                    color: '#2da58e',
                    fontWeight: 600,
                  }
                }
              }}
            >
              <ToggleButton value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  All Levels
                </Box>
              </ToggleButton>
              <ToggleButton value="beginner">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BeginnerIcon fontSize="small" />
                  Beginner
                </Box>
              </ToggleButton>
              <ToggleButton value="intermediate">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IntermediateIcon fontSize="small" />
                  Intermediate
                </Box>
              </ToggleButton>
              <ToggleButton value="advanced">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AdvancedIcon fontSize="small" />
                  Advanced
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Active Filters Chips */}
        {muscleFilter.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Filtering by:
            </Typography>
            {muscleFilter.map(muscleId => {
              const muscle = MUSCLE_GROUPS.find(g => g.id === muscleId);
              return muscle ? (
                <Chip
                  key={muscleId}
                  label={muscle.label}
                  icon={muscle.icon}
                  onDelete={() => handleMuscleToggle(muscleId)}
                  sx={{
                    backgroundColor: 'rgba(45, 165, 142, 0.12)',
                    color: '#2da58e',
                    '& .MuiChip-icon': {
                      color: '#2da58e',
                    },
                    '& .MuiChip-deleteIcon': {
                      color: '#2da58e',
                      '&:hover': {
                        color: '#238f7a',
                      }
                    }
                  }}
                />
              ) : null;
            })}
          </Box>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card sx={{ borderRadius: '16px' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Featured Exercises */}
      {!loading && !error && featuredExercises.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            Featured Exercises
          </Typography>
          <Grid container spacing={3}>
            {featuredExercises.map((exercise) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exercise.id}>
                <ExerciseCard exercise={exercise} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* All Exercises */}
      {!loading && !error && regularExercises.length > 0 && (
        <Box>
          {featuredExercises.length > 0 && (
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
              All Exercises
            </Typography>
          )}
          <Grid container spacing={3}>
            {regularExercises.map((exercise) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exercise.id}>
                <ExerciseCard exercise={exercise} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* No Results */}
      {!loading && !error && filteredExercises.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No exercises found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or search term
          </Typography>
        </Box>
      )}
      </Container>
    </MainLayout>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <Fade in timeout={300}>
      <Tooltip
        title={
          exercise.muscleGroups && exercise.muscleGroups.length > 0 ? (
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                Target Muscles
              </Typography>
              <MuscleDiagram3D activeMuscles={exercise.muscleGroups} size="small" autoRotate={false} />
            </Box>
          ) : (
            ''
          )
        }
        arrow
        placement="right"
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 200 }}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'white',
              color: 'text.primary',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              borderRadius: '12px',
              padding: 2,
              maxWidth: 'none',
              '& .MuiTooltip-arrow': {
                color: 'white',
              },
            },
          },
        }}
      >
        <Box>
          <Link 
            href={`/workouts/exercises/${exercise.slug}`} 
            style={{ textDecoration: 'none' }}
          >
            <Card 
              sx={{ 
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }
              }}
            >
              {/* Image */}
              <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#e0f7f3' }}>
                {!imageLoaded && (
                  <Skeleton variant="rectangular" height={200} />
                )}
                <CardMedia
                  component="img"
                  height="200"
                  image={exercise.imageUrl || '/images/workout-club.jpg'}
                  alt={exercise.name}
                  onLoad={() => setImageLoaded(true)}
                  sx={{ 
                    display: imageLoaded ? 'block' : 'none',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                  {exercise.youtubeUrl && (
                    <Chip
                      icon={<VideoIcon sx={{ color: 'white !important' }} />}
                      label="Video"
                      size="small"
                      sx={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  {exercise.isFeatured && (
                    <Chip
                      label="Featured"
                      size="small"
                      sx={{
                        backgroundColor: '#2da58e',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              <CardContent>
                {/* Title */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {exercise.name}
                </Typography>
                
                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {exercise.description}
                </Typography>

                {/* Muscle Groups */}
                {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                      Target Muscles:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {exercise.muscleGroups.slice(0, 3).map((muscle, idx) => (
                        <Chip
                          key={idx}
                          label={muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(45, 165, 142, 0.1)',
                            color: '#2da58e',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      ))}
                      {exercise.muscleGroups.length > 3 && (
                        <Chip
                          label={`+${exercise.muscleGroups.length - 3}`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(45, 165, 142, 0.1)',
                            color: '#2da58e',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
                
                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip 
                    icon={TYPE_ICONS[exercise.type] || undefined}
                    label={exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                    size="small"
                    sx={getExerciseTypeChipStylesWithAlpha(exercise.type)}
                  />
                  <Chip 
                    label={exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                    size="small"
                    sx={getExerciseDifficultyChipStylesWithAlpha(exercise.difficulty)}
                  />
                </Box>
                
                {/* Stats */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {exercise.caloriesPerMinute && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CaloriesIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.secondary">
                        {exercise.caloriesPerMinute} cal/min
                      </Typography>
                    </Box>
                  )}
                  {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                    <>
                      <Typography variant="caption" color="text.secondary">•</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exercise.muscleGroups.length} muscle groups
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Link>
        </Box>
      </Tooltip>
    </Fade>
  );
}
