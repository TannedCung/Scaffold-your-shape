import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography, MenuItem } from '@mui/material';
import { supabase } from '@/lib/supabase';

const activityTypes = [
  { value: 'run', label: 'Run' },
  { value: 'walk', label: 'Walk' },
  { value: 'swim', label: 'Swim' },
  { value: 'cycle', label: 'Cycle' },
  { value: 'hike', label: 'Hike' },
  { value: 'other', label: 'Other' },
];

export default function ActivityEditDialog({ open, activity, onClose }: { open: boolean, activity: any, onClose: () => void }) {
  const [type, setType] = useState('run');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (activity) {
      setType(activity.type || 'run');
      setDistance(activity.distance?.toString() || '');
      setDuration(activity.duration?.toString() || '');
      setDate(activity.date ? activity.date.slice(0, 16) : '');
      setLocation(activity.location || '');
      setNotes(activity.notes || '');
      setError(null);
      setSuccess(false);
    }
  }, [activity]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('activities').update({ type, distance: distance ? Number(distance) : null, duration: duration ? Number(duration) : null, date, location, notes }).eq('id', activity.id);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Activity</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Type" value={type} onChange={e => setType(e.target.value)} size="small" fullWidth>
            {activityTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>
          <TextField label="Distance (meters)" value={distance} onChange={e => setDistance(e.target.value)} size="small" fullWidth type="number" />
          <TextField label="Duration (seconds)" value={duration} onChange={e => setDuration(e.target.value)} size="small" fullWidth type="number" />
          <TextField label="Date" value={date} onChange={e => setDate(e.target.value)} size="small" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} />
          <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} size="small" fullWidth />
          <TextField label="Notes" value={notes} onChange={e => setNotes(e.target.value)} size="small" fullWidth multiline minRows={2} />
          {success && <Typography color="success.main">Saved!</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading || !type || !date} variant="contained" sx={{ bgcolor: '#2da58e', color: '#fff', ':hover': { bgcolor: '#22796a' } }}>{loading ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
