'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  CardMedia,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Skeleton,
  Stack,
  Grid
} from '@mui/material';
import { 
  CheckCircleOutline as CheckIcon,
  WarningAmberOutlined as WarningIcon,
  TipsAndUpdatesOutlined as TipIcon,
  FitnessCenterOutlined as EquipmentIcon,
  TimerOutlined as TimerIcon,
  RepeatOutlined as RepsIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import MuscleDiagram3D from '@/components/workout/MuscleDiagram3DWithModel';
import { Exercise } from '@/types';
import { 
  DetailPageLayout,
  DetailPageHeader,
  DetailPageContent 
} from '@/components/common/DetailPageLayout';

const TYPE_COLORS = {
  strength: '#2da58e',
  cardio: '#4a90a4',
  flexibility: '#6b8e7f',
  balance: '#5a8a72'
};

const DIFFICULTY_COLORS = {
  beginner: '#2da58e',
  intermediate: '#4a90a4',
  advanced: '#6b8e7f',
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

  if (loading || error || !exercise) {
    return (
      <MainLayout>
        <DetailPageLayout loading={loading} error={error || (!exercise ? 'Exercise not found' : null)}>
          <></>
        </DetailPageLayout>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DetailPageLayout maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          sx={{ mb: 2 }}
        >
          <Link href="/workouts/exercises" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: '#2da58e' } }}>
              Exercises
            </Typography>
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {exercise.name}
          </Typography>
        </Breadcrumbs>

        {/* Hero Header */}
        <DetailPageHeader>
          <Card sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: 1 }}>
            <Grid container>
              <Grid item xs={12} md={5}>
                <Box sx={{ position: 'relative', height: { xs: 250, md: 350 } }}>
                  {!imageLoaded && (
                    <Skeleton 
                      variant="rectangular" 
                      width="100%" 
                      height="100%" 
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
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <CardContent sx={{ p: { xs: 3, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" fontWeight={600} gutterBottom color="text.primary">
                    {exercise.name}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                      size="small"
                      sx={{ 
                        backgroundColor: TYPE_COLORS[exercise.type],
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                    <Chip 
                      label={exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                      size="small"
                      sx={{ 
                        backgroundColor: DIFFICULTY_COLORS[exercise.difficulty],
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                    {exercise.defaultDuration && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <TimerIcon sx={{ fontSize: 18, color: '#2da58e' }} />
                        <Typography variant="body2" color="text.secondary">
                          {Math.floor(exercise.defaultDuration / 60)} min
                        </Typography>
                      </Stack>
                    )}
                    {exercise.defaultSets && exercise.defaultReps && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <RepsIcon sx={{ fontSize: 18, color: '#2da58e' }} />
                        <Typography variant="body2" color="text.secondary">
                          {exercise.defaultSets} × {exercise.defaultReps}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  
                  {exercise.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {exercise.description}
                    </Typography>
                  )}
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </DetailPageHeader>

        <DetailPageContent
          sidebar={
            <Card sx={{ borderRadius: '8px', boxShadow: 1, width: '100%', height: 'fit-content' }}>
              <CardContent sx={{ p: 3 }}>
                {/* Muscle Groups */}
                {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                  <Box sx={{ mb: exercise.equipmentRequired && exercise.equipmentRequired.length > 0 ? 3 : 0 }}>
                    <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                      Target Muscles
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <MuscleDiagram3D activeMuscles={exercise.muscleGroups} size="small" autoRotate={false} />
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.75,
                      justifyContent: 'flex-start'
                    }}>
                      {exercise.muscleGroups.map((muscle, idx) => (
                        <Chip
                          key={idx}
                          label={muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: '#f0f9f7',
                            color: '#2da58e',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            border: '1px solid #e0f2f1',
                            height: '24px'
                          }}
                        />
                      ))}
                    </Box>
                    {exercise.equipmentRequired && exercise.equipmentRequired.length > 0 && <Divider sx={{ mt: 3 }} />}
                  </Box>
                )}

                {/* Equipment */}
                {exercise.equipmentRequired && exercise.equipmentRequired.length > 0 && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 2 }}>
                      <EquipmentIcon sx={{ fontSize: 20, color: '#2da58e' }} />
                      <Typography variant="h6" fontWeight={600} color="text.primary">
                        Equipment
                      </Typography>
                    </Stack>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.75,
                      justifyContent: 'flex-start'
                    }}>
                      {exercise.equipmentRequired.map((equipment, index) => (
                        <Chip 
                          key={index}
                          label={equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: '#2da58e', 
                            color: '#2da58e',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            height: '24px'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          }
        >
          <Card sx={{ borderRadius: '8px', boxShadow: 1, width: '100%', height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
                {/* Video Tutorial */}
                {exercise.youtubeUrl && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                      Video Tutorial
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        height: 0,
                        overflow: 'hidden',
                        borderRadius: '6px',
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
                    <Divider sx={{ mt: 3 }} />
                  </Box>
                )}

                {/* Instructions */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                    Instructions
                  </Typography>
                  <List disablePadding>
                    {exercise.instructions.map((instruction, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.75, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: '#2da58e',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              flexShrink: 0
                            }}
                          >
                            {index + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText 
                          primary={instruction}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', lineHeight: 1.5 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ mt: 2 }} />
                </Box>

                {/* Tips */}
                {exercise.tips && exercise.tips.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                      Tips
                    </Typography>
                    <List disablePadding>
                      {exercise.tips.map((tip, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                            <TipIcon sx={{ fontSize: 16, color: '#4a90a4' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={tip}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', lineHeight: 1.5 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                )}

                {/* Common Mistakes */}
                {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                  <Box sx={{ mb: exercise.variations && exercise.variations.length > 0 ? 3 : 0 }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                      Common Mistakes
                    </Typography>
                    <List disablePadding>
                      {exercise.commonMistakes.map((mistake, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                            <WarningIcon sx={{ fontSize: 16, color: '#6b8e7f' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={mistake}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', lineHeight: 1.5 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {exercise.variations && exercise.variations.length > 0 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                )}

                {/* Variations */}
                {exercise.variations && exercise.variations.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                      Variations
                    </Typography>
                    <List disablePadding>
                      {exercise.variations.map((variation, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                            <CheckIcon sx={{ fontSize: 16, color: '#2da58e' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={variation}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', lineHeight: 1.5 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
        </DetailPageContent>
      </DetailPageLayout>
    </MainLayout>
  );
}
