"use client";

import React, { useState } from 'react';
import { activityApi } from '@/lib/api';
import { Box, Button, TextField, Stack, Typography, MenuItem } from '@mui/material';

const activityTypes = [
  { value: 'run', label: 'Run' },
  { value: 'walk', label: 'Walk' },
  { value: 'swim', label: 'Swim' },
  { value: 'cycle', label: 'Cycle' },
  { value: 'hike', label: 'Hike' },
  { value: 'other', label: 'Other' },
];

export default function CreateActivityForm() {
  const [type, setType] = useState('run');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await activityApi.create({
        type,
        distance: distance ? Number(distance) : undefined,
        movingTime: duration ? Number(duration) : undefined,
        date,
        location,
        notes
      });
      
      if (error) throw new Error(error);
      
      setSuccess(true);
      setType('run');
      setDistance('');
      setDuration('');
      setDate('');
      setLocation('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 0, border: '1px solid #e0e0e0', maxWidth: 400 }}>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Add Activity</Typography>
      <Stack spacing={2}>
        <TextField select label="Type" value={type} onChange={e => setType(e.target.value)} size="small" fullWidth>
          {activityTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </TextField>
        <TextField label="Distance (meters)" value={distance} onChange={e => setDistance(e.target.value)} size="small" fullWidth type="number" />
        <TextField label="Duration (seconds)" value={duration} onChange={e => setDuration(e.target.value)} size="small" fullWidth type="number" />
        <TextField label="Date" value={date} onChange={e => setDate(e.target.value)} size="small" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} />
        <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} size="small" fullWidth />
        <TextField label="Notes" value={notes} onChange={e => setNotes(e.target.value)} size="small" fullWidth multiline minRows={2} />
        <Button onClick={handleCreate} disabled={loading || !type || !date} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' }, borderRadius: 1, textTransform: 'none' }}>
          {loading ? 'Adding...' : 'Add Activity'}
        </Button>
        {success && <Typography color="success.main">Activity added!</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
    </Box>
  );
}
