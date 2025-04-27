"use client";
import type { Activity } from '@/types';

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

export default function ActivityEditDialog({ open, activity, onClose }: { open: boolean, activity: Activity | null, onClose: () => void }) {
  const [type, setType] = useState('run');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('reps');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (activity) {
      setType(activity.type || 'run');
      setName(activity.name || '');
      setValue(activity.value?.toString() || '');
      setUnit(activity.unit || 'reps');
      setDate(activity.date ? activity.date.slice(0, 16) : '');
      setError(null);
      setSuccess(false);
    }
  }, [activity]);

  const handleSave = async () => {
    if (!activity) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('activities').update({
      type,
      name,
      value: value ? Number(value) : null,
      unit,
      date,
    }).eq('id', activity.id);
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
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" fullWidth />
          <TextField label="Value" value={value} onChange={e => setValue(e.target.value)} size="small" fullWidth type="number" />
          <TextField label="Unit" value={unit} onChange={e => setUnit(e.target.value)} size="small" fullWidth />
          <TextField label="Date" value={date} onChange={e => setDate(e.target.value)} size="small" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} />
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
