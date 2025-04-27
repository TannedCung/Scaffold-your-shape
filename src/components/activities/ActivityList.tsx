"use client";

import React, { useState } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { Box, Typography, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ActivityEditDialog from './ActivityEditDialog';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types';

export default function ActivityList({ userId }: { userId?: string }) {
  const { activities, loading, error } = useActivities(userId);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from('activities').delete().eq('id', deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Activities</Typography>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Stack spacing={2}>
        {activities.map(activity => (
          <Box key={activity.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{activity.type}</Typography>
              <Typography variant="body2" color="text.secondary">{activity.name} {activity.value} {activity.unit}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => setEditActivity(activity)}><EditIcon sx={{ color: '#2da58e' }} /></IconButton>
              <IconButton onClick={() => setDeleteId(activity.id)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
            </Box>
          </Box>
        ))}
      </Stack>
      <ActivityEditDialog open={!!editActivity} activity={editActivity} onClose={() => setEditActivity(null)} />
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Activity?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this activity?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
