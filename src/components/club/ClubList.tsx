import React, { useState } from 'react';
import { useClubs } from '@/hooks/useClubs';
import { Box, Typography, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClubEditDialog from './ClubEditDialog';
import { supabase } from '@/lib/supabase';

export default function ClubList() {
  const { clubs, loading, error } = useClubs();
  const [editClub, setEditClub] = useState(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from('clubs').delete().eq('id', deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#2da58e', mb: 2 }}>Clubs</Typography>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Stack spacing={2}>
        {clubs.map(club => (
          <Box key={club.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{club.name}</Typography>
              <Typography variant="body2" color="text.secondary">{club.description}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => setEditClub(club)}><EditIcon sx={{ color: '#2da58e' }} /></IconButton>
              <IconButton onClick={() => setDeleteId(club.id)}><DeleteIcon sx={{ color: '#ef4444' }} /></IconButton>
            </Box>
          </Box>
        ))}
      </Stack>
      <ClubEditDialog open={!!editClub} club={editClub} onClose={() => setEditClub(null)} />
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Club?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this club?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
