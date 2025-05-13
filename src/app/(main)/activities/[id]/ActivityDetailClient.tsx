'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Divider, Avatar, Button, CircularProgress, Grid, Tooltip, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Activity, ActivityPointConversion, Segmentation } from '@/types';
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
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { getActivityIcon, getActivityColor } from '@/utils/activityTypeUI';
import { fetchActivityById } from '@/services/activityService';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/maps/ActivityMap'), { 
  ssr: false,
  loading: () => <Box sx={{ height: 300, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
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

export default function ActivityDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversionRates, setConversionRates] = useState<ActivityPointConversion[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch activity with map and segmentation data
        const activityData = await fetchActivityById(id);
        if (!activityData) throw new Error('Activity not found');
        
        setActivity(activityData);
        const rates = await fetchGlobalConversionRates();
        setConversionRates(rates);
      } catch (err) {
        setError((err as Error).message || 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <MainLayout><Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box></MainLayout>;
  if (error || !activity) return <MainLayout><Box sx={{ p: 6, color: 'error.main', textAlign: 'center' }}>{error || 'Activity not found'}</Box></MainLayout>;

  // Calculate points
  const points = calculateActivityPoints(activity, conversionRates);

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, px: { xs: 1, sm: 0 } }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button variant="outlined" sx={{ color: '#2da58e', borderColor: '#2da58e', fontWeight: 700, borderRadius: 2 }} onClick={() => router.back()}>
            Back
          </Button>
        </Box>
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, bgcolor: '#f7faf9', boxShadow: '0 2px 8px rgba(45,165,142,0.07)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: getActivityColor(activity.type), width: 56, height: 56, mr: 2 }}>
              {getActivityIcon(activity.type, { sx: { color: '#fff', fontSize: 32 } })}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: getActivityColor(activity.type), mb: 0.5 }}>
                {activity.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label={activity.type} size="small" sx={{ bgcolor: getActivityColor(activity.type), color: '#fff', fontWeight: 600 }} />
                <Chip label={activity.unit} size="small" sx={{ bgcolor: '#e0f7f3', color: getActivityColor(activity.type), fontWeight: 600 }} />
                {activity.sportType && (
                  <Chip label={activity.sportType} size="small" sx={{ bgcolor: '#e0f7f3', color: getActivityColor(activity.type), fontWeight: 600 }} />
                )}
                {activity.source && (
                  <Chip label={activity.source} size="small" sx={{ bgcolor: activity.source === 'Strava' ? '#fc520020' : '#2da58e20', color: activity.source === 'Strava' ? '#fc5200' : '#2da58e', borderColor: activity.source === 'Strava' ? '#fc5200' : '#2da58e', fontWeight: 500 }} variant="outlined" />
                )}
                {points > 0 && (
                  <Chip label={`Points: ${points}`} size="small" sx={{ bgcolor: '#e0f7f3', color: getActivityColor(activity.type), fontWeight: 700 }} />
                )}
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          
          {/* Map section if available */}
          {activity.map && activity.map.summaryPolyline && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Activity Map</Typography>
              <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden' }}>
                <MapComponent 
                  polyline={activity.map.summaryPolyline}
                  startPosition={activity.startLatlng}
                  endPosition={activity.endLatlng}
                />
              </Box>
            </Box>
          )}
          
          <Grid container spacing={3}>
            {/* Main stats */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#f0f9f7', boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Activity Details</Typography>
                  
                  <Grid container spacing={2}>
                    {/* Standout value */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {getActivityIcon(activity.type, { sx: { color: getActivityColor(activity.type), fontSize: 40 } })}
                        <Typography variant="h3" sx={{ color: getActivityColor(activity.type), fontWeight: 900, letterSpacing: 1 }}>
                          {activity.value} <Typography component="span" variant="h5" sx={{ color: '#888', fontWeight: 500 }}>{activity.unit}</Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Date/Time */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ color: '#2da58e' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Location */}
                    {activity.location && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PlaceIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">Location: {activity.location}</Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Duration */}
                    {activity.elapsedTime && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Duration: {formatDuration(activity.elapsedTime)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Moving Time */}
                    {activity.movingTime && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Moving Time: {formatDuration(activity.movingTime)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Distance */}
                    {activity.distance && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FitnessCenterIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Distance: {formatDistance(activity.distance)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Elevation Gain */}
                    {activity.totalElevationGain && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TerrainIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Elevation Gain: {activity.totalElevationGain} m
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Average Speed */}
                    {activity.averageSpeed && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SpeedIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Avg Speed: {formatSpeed(activity.averageSpeed)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Max Speed */}
                    {activity.maxSpeed && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SpeedIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Max Speed: {formatSpeed(activity.maxSpeed)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Average Cadence */}
                    {activity.averageCadence && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <NumbersIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Avg Cadence: {activity.averageCadence.toFixed(1)} rpm
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Average Temperature */}
                    {activity.averageTemp && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ThermostatIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Avg Temp: {activity.averageTemp.toFixed(1)}°C
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Average Watts */}
                    {activity.averageWatts && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ElectricBoltIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Avg Power: {activity.averageWatts.toFixed(1)} W
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Max Watts */}
                    {activity.maxWatts && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ElectricBoltIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Max Power: {activity.maxWatts.toFixed(0)} W
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Kilojoules */}
                    {activity.kilojoules && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ElectricBoltIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Energy: {activity.kilojoules.toFixed(1)} kJ
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Strava Link */}
                    {activity.url && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinkIcon sx={{ color: '#2da58e' }} />
                          <Button
                            href={activity.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            startIcon={<OpenInNewIcon />}
                            sx={{ color: '#fc5200', fontWeight: 600, textTransform: 'none', px: 0 }}
                          >
                            View on Strava
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Additional Stats & Metadata */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#f0f9f7', boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Additional Information</Typography>
                  
                  <Grid container spacing={2}>
                    {/* Strava ID */}
                    {activity.strava_id && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <NumbersIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">Strava ID: {activity.strava_id}</Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Source */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SourceIcon sx={{ color: '#2da58e' }} />
                        <Typography variant="body2" color="text.secondary">Source: {activity.source || 'Manual'}</Typography>
                      </Box>
                    </Grid>
                    
                    {/* Sport Type */}
                    {activity.sportType && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FitnessCenterIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">Sport Type: {activity.sportType}</Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {/* Created At */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ color: '#2da58e' }} />
                        <Typography variant="body2" color="text.secondary">
                          Created: {new Date(activity.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Updated At */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UpdateIcon sx={{ color: '#2da58e' }} />
                        <Typography variant="body2" color="text.secondary">
                          Updated: {new Date(activity.updatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* High/Low Elevation */}
                    {(activity.elevHigh || activity.elevLow) && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TerrainIcon sx={{ color: '#2da58e' }} />
                          <Typography variant="body2" color="text.secondary">
                            Elevation: {activity.elevLow ? activity.elevLow.toFixed(1) : '--'} to {activity.elevHigh ? activity.elevHigh.toFixed(1) : '--'} m
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                  
                  {/* Notes / Description */}
                  {(activity.notes || activity.description) && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Notes</Typography>
                      <Paper variant="outlined" sx={{ p: 2, borderColor: '#e0e0e0', bgcolor: '#fff' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {activity.description || activity.notes}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Segment Efforts Section */}
          {activity.segmentEfforts && activity.segmentEfforts.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Segments</Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: '#f0f9f7' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Segment</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Distance</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Avg Power</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activity.segmentEfforts.map((segment) => (
                      <TableRow key={segment.id}>
                        <TableCell>{segment.name}</TableCell>
                        <TableCell>{formatDistance(segment.distance)}</TableCell>
                        <TableCell>{formatDuration(segment.elapsedTime)}</TableCell>
                        <TableCell>{segment.averageWatts ? `${segment.averageWatts.toFixed(0)} W` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>
    </MainLayout>
  );
} 