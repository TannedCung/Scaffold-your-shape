"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  MenuItem, 
  Box,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { createActivity } from '@/services/activityService';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from '@/hooks/useUser';
import { useSession } from 'next-auth/react';
import { SportType, SportUnitMap, SportIconMap } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Define unit options
const unitOptions = [
  { value: 'reps', label: 'Repetitions' },
  { value: 'meters', label: 'Meters' },
  { value: 'kilometers', label: 'Kilometers' },
  { value: 'miles', label: 'Miles' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'calories', label: 'Calories' },
];

// Helper function to format activity type names
const formatActivityType = (type: string): string => {
  return type.replace(/([A-Z])/g, ' $1').trim(); // Add spaces before capital letters
};

export default function CreateActivityDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { data: session, status: sessionStatus } = useSession();
  const { user, loading: userLoading } = useUser();
  const [tabValue, setTabValue] = useState(0);
  
  // Basic activity fields
  const [type, setType] = useState<SportType>(SportType.Run);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(SportUnitMap[SportType.Run]);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  
  // Update unit when activity type changes
  useEffect(() => {
    setUnit(SportUnitMap[type as SportType] || 'kilometers');
  }, [type]);
  
  // Advanced fields (optional)
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Combined authentication check
  const isAuthenticated = !!session?.user || !!user;
  const isAuthLoading = sessionStatus === 'loading' || userLoading;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const resetForm = () => {
    setType(SportType.Run);
    setName('');
    setValue('');
    setUnit(SportUnitMap[SportType.Run]);
    setDate(new Date().toISOString().substring(0, 16));
    setDescription('');
    setLocation('');
    setError(null);
    setSuccess(false);
    setTabValue(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    // First check if user is authenticated at all
    if (!isAuthenticated && !isAuthLoading) {
      setError('You must be logged in to create an activity');
      return;
    }
    
    if (isAuthLoading) {
      setError('Please wait while we verify your login status...');
      return;
    }
    
    // Get user ID from either session or user object
    // NextAuth ID is in session?.user?.id
    // Supabase user ID is in user?.id
    const userId = session?.user?.id || user?.id;
    
    if (!userId) {
      console.error('Missing user ID:', { session, user });
      setError('Unable to determine your user ID. Please try refreshing the page.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await createActivity({
        userId,
        type,
        name: name || type.charAt(0).toUpperCase() + type.slice(1),
        date,
        value: parseFloat(value),
        unit,
        location,
        notes: description,
      });
      
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      console.error('Error creating activity:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = type && date && value && !isNaN(parseFloat(value)) && parseFloat(value) > 0;

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#2da58e',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
      }}>
        <Typography variant="h6" component="div">
          Add New Activity
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose} 
          disabled={loading}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        centered
      >
        <Tab label="Basic Info" />
        <Tab label="Details" />
      </Tabs>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Activity added successfully!
          </Alert>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="activity-type-label">Activity Type</InputLabel>
              <Select
                labelId="activity-type-label"
                id="activity-type"
                value={type}
                label="Activity Type"
                onChange={(e) => {
                  setType(e.target.value as SportType);
                  setUnit(SportUnitMap[e.target.value as SportType]);
                }}
              >
                {Object.values(SportType).map((type) => {
                  const IconComponent = SportIconMap[type];
                  return (
                    <MenuItem key={type} value={type}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconComponent sx={{ mr: 1, color: 'text.secondary' }} />
                        {formatActivityType(type)}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            
            <TextField
              label="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : ''}
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 0, step: 'any' }}
              />
              
              <TextField
                select
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                fullWidth
                required
              >
                {unitOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            
            <TextField
              label="Date & Time"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            
            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              placeholder="e.g., Local Gym, Home, Park"
            />
          </Stack>
        </TabPanel>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          disabled={loading || !isFormValid}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ 
            bgcolor: '#2da58e', 
            '&:hover': { 
              bgcolor: '#1a8a73' 
            } 
          }}
        >
          {loading ? 'Adding...' : 'Add Activity'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 