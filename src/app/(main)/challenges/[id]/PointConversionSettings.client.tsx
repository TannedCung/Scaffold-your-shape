'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, Paper, CircularProgress, Snackbar } from '@mui/material';
import { fetchChallengeConversionRates, upsertChallengeConversionRates } from '@/services/activityPointService';
import { ChallengePointConversion } from '@/types';
import { DEFAULT_ACTIVITY_POINT_CONVERSION } from '@/constants/defaultActivityPointConversion';

export default function PointConversionSettings({ challengeId }: { challengeId: string }) {
  const [rows, setRows] = useState<ChallengePointConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchChallengeConversionRates(challengeId)
      .then(data => {
        if (data.length === 0) {
          setRows(DEFAULT_ACTIVITY_POINT_CONVERSION.map(row => ({ ...row, challenge_id: challengeId })));
        } else {
          setRows(data);
        }
      })
      .finally(() => setLoading(false));
  }, [challengeId]);

  const handleRateChange = (idx: number, value: number) => {
    setRows(rows => rows.map((row, i) => i === idx ? { ...row, rate: value } : row));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertChallengeConversionRates(challengeId, rows);
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#2da58e', fontWeight: 700 }}>Challenge Activity Point Conversion</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Activity Type</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Points per Unit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.activity_type + row.unit}>
              <TableCell>{row.activity_type}</TableCell>
              <TableCell>{row.unit}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  value={row.rate}
                  onChange={e => handleRateChange(idx, parseFloat(e.target.value))}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ width: 100 }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Button
          variant="contained"
          sx={{ bgcolor: '#2da58e', color: '#fff', fontWeight: 700, px: 4, borderRadius: 2, ':hover': { bgcolor: '#24977e' } }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
        message="Saved!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
} 