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
  Skeleton
} from '@mui/material';
import { 
  Search as SearchIcon,
  FitnessCenterOutlined as StrengthIcon,
  DirectionsRunOutlined as CardioIcon,
  SelfImprovementOutlined as FlexibilityIcon,
  LocalFireDepartmentOutlined as CaloriesIcon
} from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Exercise, ExerciseType } from '@/types';

const TYPE_ICONS = {
  strength: <StrengthIcon />,
  cardio: <CardioIcon />,
  flexibility: <FlexibilityIcon />,
};

const TYPE_COLORS = {
  strength: '#2da58e',
  cardio: '#f59e0b',
  flexibility: '#8b5cf6',
};

const DIFFICULTY_COLORS = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ExerciseType | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

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

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={typeFilter}
              exclusive
              onChange={(_, newType) => newType && setTypeFilter(newType)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(45, 165, 142, 0.12)',
                    color: '#2da58e',
                  }
                }
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="cardio">Cardio</ToggleButton>
              <ToggleButton value="strength">Strength</ToggleButton>
              <ToggleButton value="flexibility">Flexibility</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={difficultyFilter}
              exclusive
              onChange={(_, newDifficulty) => newDifficulty && setDifficultyFilter(newDifficulty)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(45, 165, 142, 0.12)',
                    color: '#2da58e',
                  }
                }
              }}
            >
              <ToggleButton value="all">All Levels</ToggleButton>
              <ToggleButton value="beginner">Beginner</ToggleButton>
              <ToggleButton value="intermediate">Intermediate</ToggleButton>
              <ToggleButton value="advanced">Advanced</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Box>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
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
              <Grid item xs={12} sm={6} md={4} key={exercise.id}>
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
              <Grid item xs={12} sm={6} md={4} key={exercise.id}>
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
            {exercise.isFeatured && (
              <Chip
                label="Featured"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: '#2da58e',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
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
            
            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip 
                icon={TYPE_ICONS[exercise.type] || undefined}
                label={exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                size="small"
                sx={{ 
                  backgroundColor: `${TYPE_COLORS[exercise.type]}15`,
                  color: TYPE_COLORS[exercise.type],
                  fontWeight: 'bold',
                  border: `1px solid ${TYPE_COLORS[exercise.type]}30`
                }}
              />
              <Chip 
                label={exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                size="small"
                sx={{ 
                  backgroundColor: `${DIFFICULTY_COLORS[exercise.difficulty]}15`,
                  color: DIFFICULTY_COLORS[exercise.difficulty],
                  fontWeight: 'bold',
                  border: `1px solid ${DIFFICULTY_COLORS[exercise.difficulty]}30`
                }}
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
    </Fade>
  );
}
