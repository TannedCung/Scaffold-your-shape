'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  CircularProgress, 
  Alert,
  Box,
  Slider,
  Stack,
  TextField,
  MenuItem
} from '@mui/material';
import { useStrava } from '@/hooks/useStrava';
import { importActivitiesFromStrava } from '@/services/stravaClientService';
import { CloudDownload as ImportIcon } from '@mui/icons-material';

interface StravaActivityImporterProps {
  onImportComplete?: (count: number) => void;
}

export default function StravaActivityImporter({ onImportComplete }: StravaActivityImporterProps) {
  const { connected } = useStrava();
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [limit, setLimit] = useState(30);
  const [page, setPage] = useState(1);

  const handleOpen = () => {
    setOpen(true);
    // Reset state when opening
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await importActivitiesFromStrava({ limit, page });

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      setSuccess(`Successfully imported ${data.imported} activities from Strava!`);
      if (onImportComplete) {
        onImportComplete(data.imported);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import activities');
    } finally {
      setImporting(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outlined" 
        startIcon={<ImportIcon />}
        onClick={handleOpen}
        sx={{ 
          borderColor: '#fc4c02',
          color: '#fc4c02',
          '&:hover': { 
            borderColor: '#fc4c02',
            backgroundColor: 'rgba(252, 76, 2, 0.04)',
          }
        }}
      >
        Import from Strava
      </Button>

      <Dialog
        open={open}
        onClose={importing ? undefined : handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{ 
            bgcolor: '#fc4c02',
            color: 'white',
            p: 2
          }}
        >
          Import Activities from Strava
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              Import your recent activities from Strava to your account. Duplicate activities will be skipped.
            </Typography>
          </Box>

          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Number of activities to import
              </Typography>
              <Slider
                value={limit}
                onChange={(_, newValue) => setLimit(newValue as number)}
                step={5}
                marks
                min={5}
                max={100}
                valueLabelDisplay="auto"
                disabled={importing}
                sx={{
                  color: '#fc4c02',
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0px 0px 0px 8px rgba(252, 76, 2, 0.16)',
                    },
                  },
                }}
              />
            </Box>

            <TextField
              select
              label="Page"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              disabled={importing}
              helperText="For older activities, increase the page number"
              fullWidth
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <MenuItem key={value} value={value}>
                  Page {value}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={importing}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importing}
            startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <ImportIcon />}
            sx={{ 
              bgcolor: '#fc4c02', 
              '&:hover': { 
                bgcolor: '#e34402' 
              } 
            }}
          >
            {importing ? 'Importing...' : 'Import Activities'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 