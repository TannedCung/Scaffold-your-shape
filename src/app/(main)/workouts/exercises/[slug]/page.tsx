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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Paper,
  Skeleton,
  Fade
} from '@mui/material';
import { 
  CheckCircleOutline as CheckIcon,
  WarningAmberOutlined as WarningIcon,
  TipsAndUpdatesOutlined as TipIcon,
  FitnessCenterOutlined as EquipmentIcon,
  LocalFireDepartmentOutlined as CaloriesIcon,
  TimerOutlined as TimerIcon,
  RepeatOutlined as RepsIcon,
  NavigateNext as NavigateNextIcon,
  FavoriteBorderOutlined as BenefitIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Exercise } from '@/types';

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

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchExercise();
    }
  }, [slug]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/exercises/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Exercise not found');
        } else {
          throw new Error('Failed to fetch exercise');
        }
        return;
      }
      
      const data = await response.json();
      setExercise(data.exercise);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px', mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px' }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px' }} />
            </Grid>
          </Grid>
        </Container>
      </MainLayout>
    );
  }

  if (error || !exercise) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error || 'Exercise not found'}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link href="/workouts/exercises" style={{ textDecoration: 'none', color: '#2da58e' }}>
          <Typography color="text.primary">Exercises</Typography>
        </Link>
        <Typography color="text.secondary">{exercise.name}</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <Fade in timeout={500}>
        <Card sx={{ borderRadius: '20px', mb: 4, overflow: 'hidden' }}>
          <Grid container>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: { xs: 300, md: 450 }, bgcolor: '#e0f7f3' }}>
                {!imageLoaded && (
                  <Skeleton 
                    variant="rectangular" 
                    width="100%" 
                    height="100%" 
                    animation="wave"
                  />
                )}
                <CardMedia
                  component="img"
                  image={exercise.imageUrl || '/images/workout-club.jpg'}
                  alt={exercise.name}
                  onLoad={() => setImageLoaded(true)}
                  sx={{ 
                    display: imageLoaded ? 'block' : 'none',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {exercise.isFeatured && (
                  <Chip
                    label="Featured"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: '#2da58e',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {exercise.name}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  <Chip 
                    label={exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                    sx={{ 
                      backgroundColor: `${TYPE_COLORS[exercise.type]}15`,
                      color: TYPE_COLORS[exercise.type],
                      fontWeight: 'bold',
                      border: `1px solid ${TYPE_COLORS[exercise.type]}30`
                    }}
                  />
                  <Chip 
                    label={exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                    sx={{ 
                      backgroundColor: `${DIFFICULTY_COLORS[exercise.difficulty]}15`,
                      color: DIFFICULTY_COLORS[exercise.difficulty],
                      fontWeight: 'bold',
                      border: `1px solid ${DIFFICULTY_COLORS[exercise.difficulty]}30`
                    }}
                  />
                  <Chip 
                    label={exercise.category.replace('_', ' ').toUpperCase()}
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body1" paragraph sx={{ flexGrow: 1 }}>
                  {exercise.description}
                </Typography>
                
                {/* Quick Stats */}
                <Grid container spacing={2}>
                  {exercise.caloriesPerMinute && (
                    <Grid item xs={6} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px', bgcolor: '#fef3c7' }}>
                        <CaloriesIcon sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="#f59e0b">
                          {exercise.caloriesPerMinute}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          cal/min
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {exercise.defaultDuration && (
                    <Grid item xs={6} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px', bgcolor: '#e0f7f3' }}>
                        <TimerIcon sx={{ fontSize: 32, color: '#2da58e', mb: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="#2da58e">
                          {Math.floor(exercise.defaultDuration / 60)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          minutes
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {exercise.defaultSets && exercise.defaultReps && (
                    <>
                      <Grid item xs={6} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px', bgcolor: '#e0f7f3' }}>
                          <RepsIcon sx={{ fontSize: 32, color: '#2da58e', mb: 1 }} />
                          <Typography variant="h6" fontWeight="bold" color="#2da58e">
                            {exercise.defaultSets} × {exercise.defaultReps}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            sets × reps
                          </Typography>
                        </Paper>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* YouTube Video Tutorial */}
          {exercise.youtubeUrl && (
            <Fade in timeout={600}>
              <Card sx={{ borderRadius: '16px', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#2da58e' }}>
                    Video Tutorial
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{
                      position: 'relative',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: '12px',
                      bgcolor: '#000',
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(exercise.youtubeUrl)}`}
                      title={`${exercise.name} Tutorial`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Instructions */}
          <Fade in timeout={700}>
            <Card sx={{ borderRadius: '16px', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#2da58e' }}>
                  How to Perform
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {exercise.instructions.map((instruction, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon>
                        <Box 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: '#e0f7f3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2da58e',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={instruction}
                        primaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>

          {/* Benefits */}
          {exercise.benefits && exercise.benefits.length > 0 && (
            <Fade in timeout={900}>
              <Card sx={{ borderRadius: '16px', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BenefitIcon sx={{ mr: 1, color: '#10b981' }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#10b981' }}>
                      Benefits
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {exercise.benefits.map((benefit, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon sx={{ color: '#10b981' }} />
                        </ListItemIcon>
                        <ListItemText primary={benefit} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <Fade in timeout={1100}>
              <Card sx={{ borderRadius: '16px', mb: 3, bgcolor: '#fffbeb' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TipIcon sx={{ mr: 1, color: '#f59e0b' }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                      Pro Tips
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {exercise.tips.map((tip, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TipIcon sx={{ color: '#f59e0b' }} />
                        </ListItemIcon>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Common Mistakes */}
          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <Fade in timeout={1300}>
              <Card sx={{ borderRadius: '16px', mb: 3, bgcolor: '#fef2f2' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon sx={{ mr: 1, color: '#ef4444' }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#ef4444' }}>
                      Common Mistakes to Avoid
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {exercise.commonMistakes.map((mistake, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <WarningIcon sx={{ color: '#ef4444' }} />
                        </ListItemIcon>
                        <ListItemText primary={mistake} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Equipment */}
          {exercise.equipmentRequired && exercise.equipmentRequired.length > 0 && (
            <Fade in timeout={800}>
              <Card sx={{ borderRadius: '16px', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EquipmentIcon sx={{ mr: 1, color: '#2da58e' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Equipment Needed
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {exercise.equipmentRequired.map((equipment, index) => (
                      <Chip 
                        key={index}
                        label={equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                        variant="outlined"
                        sx={{ borderColor: '#2da58e', color: '#2da58e' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Muscle Groups */}
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <Fade in timeout={1000}>
              <Card sx={{ borderRadius: '16px', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Muscle Groups
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {exercise.muscleGroups.map((muscle, index) => (
                      <Chip 
                        key={index}
                        label={muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                        sx={{ 
                          bgcolor: '#e0f7f3',
                          color: '#2da58e',
                          fontWeight: 'bold'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Variations */}
          {exercise.variations && exercise.variations.length > 0 && (
            <Fade in timeout={1200}>
              <Card sx={{ borderRadius: '16px', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Variations
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    {exercise.variations.map((variation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon sx={{ fontSize: 20, color: '#2da58e' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={variation}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>
          )}
        </Grid>
      </Grid>
      </Container>
    </MainLayout>
  );
}
