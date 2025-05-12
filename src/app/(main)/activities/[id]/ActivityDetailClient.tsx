'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Divider, Avatar, Button, CircularProgress, Grid, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Activity } from '@/types';
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

export default function ActivityDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversionRates, setConversionRates] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch activity from supabase
        const { data, error } = await window.supabase
          .from('activities')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setActivity(data as Activity);
        const rates = await fetchGlobalConversionRates();
        setConversionRates(rates);
      } catch (err: any) {
        setError(err.message || 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error || !activity) return <Box sx={{ p: 6, color: 'error.main', textAlign: 'center' }}>{error || 'Activity not found'}</Box>;

  // Calculate points
  const points = calculateActivityPoints(activity, conversionRates);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, px: { xs: 1, sm: 0 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, bgcolor: '#f7faf9', boxShadow: '0 2px 8px rgba(45,165,142,0.07)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#2da58e', width: 56, height: 56, mr: 2 }}>
            <FitnessCenterIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2da58e', mb: 0.5 }}>
              {activity.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={activity.type} size="small" sx={{ bgcolor: '#2da58e', color: '#fff', fontWeight: 600 }} />
              <Chip label={activity.unit} size="small" sx={{ bgcolor: '#e0f7f3', color: '#2da58e', fontWeight: 600 }} />
              {activity.source && (
                <Chip label={activity.source} size="small" sx={{ bgcolor: activity.source === 'Strava' ? '#fc520020' : '#2da58e20', color: activity.source === 'Strava' ? '#fc5200' : '#2da58e', borderColor: activity.source === 'Strava' ? '#fc5200' : '#2da58e', fontWeight: 500 }} variant="outlined" />
              )}
              {points > 0 && (
                <Chip label={`Points: ${points}`} size="small" sx={{ bgcolor: '#e0f7f3', color: '#2da58e', fontWeight: 700 }} />
              )}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ color: '#2da58e' }} />
              <Typography variant="body2" color="text.secondary">{new Date(activity.date).toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ color: '#2da58e' }} />
              <Typography variant="body2" color="text.secondary">Created: {new Date(activity.created_at).toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UpdateIcon sx={{ color: '#2da58e' }} />
              <Typography variant="body2" color="text.secondary">Updated: {new Date(activity.updatedAt).toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NumbersIcon sx={{ color: '#2da58e' }} />
              <Typography variant="body2" color="text.secondary">Strava ID: {activity.strava_id || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon sx={{ color: '#2da58e' }} />
              <Typography variant="body2" color="text.secondary">Location: {activity.location || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SourceIcon sx={{ color: '#2da58e' }} />
              <Typography variant="body2" color="text.secondary">Source: {activity.source || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon sx={{ color: '#2da58e' }} />
              {activity.url ? (
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
              ) : (
                <Typography variant="body2" color="text.secondary">No URL</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenterIcon sx={{ color: '#2da58e' }} />
              <Typography variant="body2" color="text.secondary">Value: <b>{activity.value}</b> {activity.unit}</Typography>
            </Box>
          </Grid>
        </Grid>
        {activity.notes && (
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <NotesIcon sx={{ color: '#2da58e', mt: 0.5 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{activity.notes}</Typography>
          </Box>
        )}
      </Paper>
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button variant="outlined" sx={{ color: '#2da58e", borderColor: '#2da58e', fontWeight: 700, borderRadius: 2 }} onClick={() => router.back()}>
          Back
        </Button>
      </Box>
    </Box>
  );
} 