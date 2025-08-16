"use client";
import type { Activity } from '@/types';

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
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { updateActivity } from '@/services/activityService';
import { useUser } from '@/hooks/useUser';
import { SportType, SportIconMap, SportColorMap } from '@/types';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from '@/contexts/SnackbarProvider';

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
      id={`edit-tabpanel-${index}`}
      aria-labelledby={`edit-tab-${index}`}
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

// Use SportType enum for activity type options
const activityTypes = [
  // Running
  { value: SportType.Run, label: 'Run' },
  { value: SportType.TrailRun, label: 'Trail Run' },
  { value: SportType.Treadmill, label: 'Treadmill' },
  
  // Cycling
  { value: SportType.Ride, label: 'Ride' },
  { value: SportType.MountainBikeRide, label: 'Mountain Bike' },
  
  // Swimming
  { value: SportType.Swim, label: 'Swim' },
  
  // Walking/Hiking
  { value: SportType.Walk, label: 'Walk' },
  { value: SportType.Hike, label: 'Hike' },
  
  // Gym/Fitness
  { value: SportType.WeightTraining, label: 'Weight Training' },
  { value: SportType.Workout, label: 'Workout' },
  { value: SportType.Crossfit, label: 'Crossfit' },
  { value: SportType.Pushup, label: 'Pushup' },
  { value: SportType.Situp, label: 'Situp' },
  { value: SportType.PullUp, label: 'Pull Up' },
  { value: SportType.ParallelBars, label: 'Parallel Bars' },
  { value: SportType.Yoga, label: 'Yoga' }
];

const unitOptions = [
  { value: 'reps', label: 'Repetitions' },
  { value: 'meters', label: 'Meters' },
  { value: 'kilometers', label: 'Kilometers' },
  { value: 'miles', label: 'Miles' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'calories', label: 'Calories' },
];

export default function ActivityEditDialog({ 
  open, 
  activity, 
  onClose, 
  onSuccess 
}: { 
  open: boolean, 
  activity: Activity | null, 
  onClose: () => void,
  onSuccess?: () => void 
}) {
  const { user } = useUser();
  const theme = useTheme();
  const { showSuccess, showError } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  
  // Basic activity fields
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState('');
  
  // Advanced fields (optional)
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (activity) {
      // Map the activity type to SportType if possible
      const sportType = Object.values(SportType).find(
        (sport) => sport.toLowerCase() === activity.type.toLowerCase()
      );
      setType(sportType || SportType.Run);
      setName(activity.name || '');
      setValue(activity.value?.toString() || '');
      setUnit(activity.unit || 'reps');
      // Set location and description if they exist
      setLocation(activity.location || '');
      setDescription(activity.notes || '');
      
      // Format date for datetime-local input
      const dateObj = new Date(activity.date);
      if (!isNaN(dateObj.getTime())) {
        // Make sure it's a valid date before formatting
        const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDate(localDate);
      } else {
        setDate(new Date().toISOString().slice(0, 16));
      }
      
      // Reset state
      setTabValue(0);
    }
  }, [activity]);

  const handleSave = async () => {
    if (!activity || !user) return;
    
    setLoading(true);
    
    try {
      // Send only the fields that should be updated, using database field names
      const updateData = {
        type,
        name: name || type.charAt(0).toUpperCase() + type.slice(1),
        date,
        value: parseFloat(value),
        unit,
        location,
        notes: description,
        updated_at: new Date().toISOString(),
      };

      await updateActivity(activity.id, updateData);
      
      showSuccess('Activity updated successfully!');
      onSuccess?.(); // Optional callback for parent component
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = type && date && value && !isNaN(parseFloat(value)) && parseFloat(value) > 0;

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
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
        bgcolor: theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
      }}>
        <Typography variant="h6" component="div">
          Edit Activity
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
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
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <TextField
              select
              label="Activity Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              required
            >
              {activityTypes.map((option) => {
                const Icon = SportIconMap[option.value as SportType];
                const color = SportColorMap[option.value as SportType];
                
                return (
                  <MenuItem key={option.value} value={option.value}>
                    <ListItemIcon>
                      <Icon sx={{ color }} />
                    </ListItemIcon>
                    <ListItemText>{option.label}</ListItemText>
                  </MenuItem>
                );
              })}
            </TextField>
            
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
          onClick={onClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || !isFormValid}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            '&:hover': { 
              bgcolor: theme.palette.primary.dark 
            } 
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
