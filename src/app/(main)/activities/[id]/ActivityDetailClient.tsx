'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Divider, 
  Avatar, 
  Button, 
  CircularProgress, 
  Card, 
  CardContent, 
  LinearProgress,
  IconButton,
  Fade,
  Grow,
  useTheme
} from '@mui/material';
import { Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ActivityWithDetails, ActivityPointConversion } from '@/types';
import { fetchGlobalConversionRates } from '@/services/activityPointService';
import { calculateActivityPoints } from '@/utils/activityPoints';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';
import NotesIcon from '@mui/icons-material/Notes';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LinkIcon from '@mui/icons-material/Link';
import SourceIcon from '@mui/icons-material/Source';
import NumbersIcon from '@mui/icons-material/Numbers';
import UpdateIcon from '@mui/icons-material/Update';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import TerrainIcon from '@mui/icons-material/Terrain';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MainLayout from '@/components/layout/MainLayout';
import { getActivityIcon, getActivityColor } from '@/utils/activityTypeUI';
import { fetchActivityById } from '@/services/activityService';
import dynamic from 'next/dynamic';
import { activityApi } from '@/lib/api';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/maps/ActivityMap'), { 
  ssr: false,
  loading: () => <Box sx={{ height: 300, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
    <CircularProgress size={40} />
  </Box>
});

// Helper function to format duration in seconds to human-readable time
function formatDuration(seconds: number): string {
  if (!seconds) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

// Helper function to format distance in meters
function formatDistance(meters: number): string {
  if (!meters) return '-';
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${meters.toFixed(0)} m`;
  }
}

// Helper function to format speed in m/s
function formatSpeed(speed: number): string {
  if (!speed) return '-';
  
  // Convert to km/h
  const kmh = speed * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

// Helper function to get activity background image
function getActivityImage(type: string): string {
  const imageMap: { [key: string]: string } = {
    'run': '/images/running.jpg',
    'walk': '/images/walking.jpg',
    'swim': '/images/swimming.jpg',
    'cycle': '/images/cycling.jpg',
    'hike': '/images/running.jpg', // Fallback to running
    'workout': '/images/fitness.jpg',
  };
  return imageMap[type] || '/images/fitness.jpg';
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  progress?: number;
  color?: string;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, unit, progress, color = '#2da58e', delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={1000 + delay}>
      <Card sx={{ 
        position: 'relative',
        overflow: 'visible',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}20`,
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: `0 4px 12px ${color}30`
            }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>
                {value}
                {unit && (
                  <Typography component="span" variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, ml: 0.5 }}>
                    {unit}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
          {progress !== undefined && (
            <Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: `${color}15`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                    borderRadius: 3
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
                {progress.toFixed(0)}% of best
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

export default function ActivityDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const theme = useTheme();
  const [activity, setActivity] = useState<ActivityWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversionRates, setConversionRates] = useState<ActivityPointConversion[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data, error } = await activityApi.getById(id);
        
        if (error) {
          throw new Error(error);
        }

        if (data) {
          setActivity(data);
          const rates = await fetchGlobalConversionRates();
          setConversionRates(rates);
        } else {
          setError('Activity not found');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleDelete = async () => {
    try {
      const { error } = await activityApi.delete(id);
      
      if (error) {
        throw new Error(error);
      }

      router.push('/activities');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete activity');
    }
  };

  if (loading) return <MainLayout><Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box></MainLayout>;
  if (error || !activity) return <MainLayout><Box sx={{ p: 6, color: 'error.main', textAlign: 'center' }}>{error || 'Activity not found'}</Box></MainLayout>;

  // Calculate points
  const points = calculateActivityPoints(activity, conversionRates);
  const activityColor = getActivityColor(activity.type);

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: { xs: 1, sm: 0 } }}>
        {/* Hero Section */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            position: 'relative',
            height: { xs: 280, md: 320 },
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            backgroundImage: `linear-gradient(45deg, ${activityColor}E6, ${activityColor}99), url(${getActivityImage(activity.type)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center'
          }}>
            {/* Back Button */}
            <IconButton 
              onClick={() => router.back()}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            {/* Activity Icon and Name */}
            <Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)', 
                width: 80, 
                height: 80, 
                mx: 'auto',
                mb: 2,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {getActivityIcon(activity.type, { sx: { color: '#fff', fontSize: 40 } })}
              </Avatar>
              
              <Typography variant="h3" sx={{ 
                fontWeight: 900, 
                mb: 1,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                lineHeight: 1.2
              }}>
                {activity.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label={activity.type} 
                  size="medium" 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    color: '#fff', 
                    fontWeight: 700,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }} 
                />
                {activity.source && (
                  <Chip 
                    label={activity.source} 
                    size="medium" 
                    sx={{ 
                      bgcolor: activity.source === 'Strava' ? 'rgba(252, 82, 0, 0.9)' : 'rgba(255, 255, 255, 0.2)', 
                      color: '#fff', 
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }} 
                  />
                )}
                {points > 0 && (
                  <Chip 
                    icon={<EmojiEventsIcon sx={{ color: '#fff !important' }} />}
                    label={`${points} pts`} 
                    size="medium" 
                    sx={{ 
                      bgcolor: 'rgba(255, 193, 7, 0.9)', 
                      color: '#fff', 
                      fontWeight: 700,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }} 
                  />
                )}
              </Box>

              {/* Primary Metric Display */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1 }}>
                <Typography variant="h1" sx={{ 
                  fontWeight: 900, 
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  lineHeight: 1
                }}>
                  {activity.value}
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontWeight: 600, 
                  opacity: 0.9,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  {activity.unit}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ 
                mt: 1, 
                opacity: 0.9,
                fontWeight: 500,
                textShadow: '0 1px 4px rgba(0,0,0,0.3)'
              }}>
                {new Date(activity.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Key Metrics Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            color: activityColor
          }}>
            <TrendingUpIcon sx={{ mr: 1, fontSize: 28 }} />
            Performance Metrics
          </Typography>
          
          <Grid container spacing={3}>
            {activity.elapsedTime && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MetricCard
                  icon={<AccessTimeIcon sx={{ color: 'white', fontSize: 24 }} />}
                  title="Duration"
                  value={formatDuration(activity.elapsedTime)}
                  color={activityColor}
                  delay={0}
                />
              </Grid>
            )}
            
            {activity.distance && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MetricCard
                  icon={<FitnessCenterIcon sx={{ color: 'white', fontSize: 24 }} />}
                  title="Distance"
                  value={formatDistance(activity.distance)}
                  color={theme.palette.secondary.main}
                  delay={100}
                />
              </Grid>
            )}
            
            {activity.averageSpeed && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MetricCard
                  icon={<SpeedIcon sx={{ color: 'white', fontSize: 24 }} />}
                  title="Avg Speed"
                  value={formatSpeed(activity.averageSpeed)}
                  color="#16a085"
                  delay={200}
                />
              </Grid>
            )}
            
            {activity.totalElevationGain && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MetricCard
                  icon={<TerrainIcon sx={{ color: 'white', fontSize: 24 }} />}
                  title="Elevation"
                  value={activity.totalElevationGain}
                  unit="m"
                  color="#ef4444"
                  delay={300}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Map and Additional Stats */}
        <Grid container spacing={4}>
          {/* Map Section */}
          {activity.map && activity.map.summaryPolyline && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Grow in timeout={1500}>
                <Card sx={{ 
                  overflow: 'hidden',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, pb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center',
                        color: activityColor
                      }}>
                        <PlaceIcon sx={{ mr: 1 }} />
                        Activity Route
                      </Typography>
                    </Box>
                    <Box sx={{ height: 400, borderRadius: 0 }}>
                      <MapComponent 
                        polyline={activity.map.summaryPolyline}
                        startPosition={activity.startLatlng}
                        endPosition={activity.endLatlng}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          )}
          
          {/* Detailed Stats */}
          <Grid size={{ xs: 12, md: activity.map && activity.map.summaryPolyline ? 4 : 12 }}>
            <Grow in timeout={1500}>
              <Card sx={{ 
                height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    color: activityColor
                  }}>
                    <FlashOnIcon sx={{ mr: 1 }} />
                    Activity Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Location */}
                    {activity.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${activityColor}15`, width: 40, height: 40 }}>
                          <PlaceIcon sx={{ color: activityColor, fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Location
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activity.location}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Moving Time */}
                    {activity.movingTime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${theme.palette.secondary.main}15`, width: 40, height: 40 }}>
                          <AccessTimeIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Moving Time
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatDuration(activity.movingTime)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Max Speed */}
                    {activity.maxSpeed && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#16a08515', width: 40, height: 40 }}>
                          <SpeedIcon sx={{ color: '#16a085', fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Max Speed
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatSpeed(activity.maxSpeed)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Average Cadence */}
                    {activity.averageCadence && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#ff851515', width: 40, height: 40 }}>
                          <NumbersIcon sx={{ color: '#ff8515', fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Avg Cadence
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activity.averageCadence.toFixed(1)} rpm
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Average Watts */}
                    {activity.averageWatts && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#ffd70015', width: 40, height: 40 }}>
                          <ElectricBoltIcon sx={{ color: '#ffd700', fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Avg Power
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activity.averageWatts.toFixed(1)} W
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Temperature */}
                    {activity.averageTemp && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#3b82f615', width: 40, height: 40 }}>
                          <ThermostatIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Temperature
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activity.averageTemp.toFixed(1)}°C
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Strava Link */}
                    {activity.url && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          href={activity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          variant="outlined"
                          startIcon={<OpenInNewIcon />}
                          sx={{ 
                            color: '#fc5200', 
                            borderColor: '#fc5200',
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 1.5,
                            '&:hover': {
                              bgcolor: '#fc520010',
                              borderColor: '#fc5200',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          View on Strava
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Notes Section */}
        {(activity.notes || activity.description) && (
          <Fade in timeout={2000}>
            <Card sx={{ 
              mt: 4,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  color: activityColor
                }}>
                  <NotesIcon sx={{ mr: 1 }} />
                  Notes
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    borderColor: `${activityColor}30`, 
                    bgcolor: `${activityColor}05`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ 
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                    color: 'text.primary'
                  }}>
                    {activity.description || activity.notes}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Segment Efforts Section */}
        {activity.segmentEfforts && activity.segmentEfforts.length > 0 && (
          <Fade in timeout={2500}>
            <Card sx={{ 
              mt: 4,
              mb: 4,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  color: activityColor
                }}>
                  <EmojiEventsIcon sx={{ mr: 1 }} />
                  Segment Efforts
                </Typography>
                
                <Grid container spacing={2}>
                  {activity.segmentEfforts.map((segment, index) => (
                    <Grid size={{ xs: 12, md: 6 }} key={segment.id}>
                      <Paper sx={{ 
                        p: 2.5, 
                        bgcolor: `${activityColor}08`,
                        border: `1px solid ${activityColor}20`,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${activityColor}20`
                        }
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: activityColor }}>
                          {segment.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Distance</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDistance(segment.distance)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Time</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDuration(segment.elapsedTime)}
                          </Typography>
                        </Box>
                        {segment.averageWatts && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Avg Power</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {segment.averageWatts.toFixed(0)} W
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Box>
    </MainLayout>
  );
} 