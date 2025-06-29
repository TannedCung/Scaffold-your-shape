'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';

import { challengeApi } from '@/lib/api';
import { ChallengeType, DifficultyLevel, RewardType, ExerciseUnit } from '@/types';

interface CreateChallengeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateChallengeForm({ onSuccess, onCancel }: CreateChallengeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: 0,
    unit: 'reps' as ExerciseUnit,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    challengeType: 'individual' as ChallengeType,
    difficultyLevel: 'beginner' as DifficultyLevel,
    rewardType: 'badge' as RewardType,
    rewardValue: 0,
    isPublic: true,
    maxParticipants: undefined as number | undefined,
    autoJoin: false,
    featured: false,
    rules: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.targetValue <= 0) return 'Target value must be greater than 0';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) return 'End date must be after start date';
    if (formData.rewardType === 'points' && formData.rewardValue <= 0) return 'Reward value must be greater than 0 for points';
    if (formData.maxParticipants && formData.maxParticipants <= 0) return 'Max participants must be greater than 0';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await challengeApi.create(formData);
      
      if (apiError) {
        throw new Error(apiError);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Create New Challenge
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          label="Challenge Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          fullWidth
          required
        />
        
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          fullWidth
          required
          multiline
          minRows={3}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Target Value"
            type="number"
            value={formData.targetValue}
            onChange={(e) => handleInputChange('targetValue', parseInt(e.target.value) || 0)}
            sx={{ flex: 1 }}
            required
          />
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Unit</InputLabel>
            <Select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              label="Unit"
            >
              <MenuItem value="reps">Reps</MenuItem>
              <MenuItem value="meters">Meters</MenuItem>
              <MenuItem value="minutes">Minutes</MenuItem>
              <MenuItem value="hours">Hours</MenuItem>
              <MenuItem value="seconds">Seconds</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Start Date"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            sx={{ flex: 1 }}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            sx={{ flex: 1 }}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Challenge Type</InputLabel>
            <Select
              value={formData.challengeType}
              onChange={(e) => handleInputChange('challengeType', e.target.value)}
              label="Challenge Type"
            >
              <MenuItem value="individual">Individual</MenuItem>
              <MenuItem value="team">Team</MenuItem>
              <MenuItem value="club">Club</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={formData.difficultyLevel}
              onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
              label="Difficulty"
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          label="Max Participants (Optional)"
          type="number"
          value={formData.maxParticipants || ''}
          onChange={(e) => handleInputChange('maxParticipants', e.target.value ? parseInt(e.target.value) : undefined)}
          fullWidth
        />

        <TextField
          label="Rules & Guidelines"
          value={formData.rules}
          onChange={(e) => handleInputChange('rules', e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />

        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              />
            }
            label="Public Challenge"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.autoJoin}
                onChange={(e) => handleInputChange('autoJoin', e.target.checked)}
              />
            }
            label="Auto-join"
          />
        </Stack>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              bgcolor: '#2da58e',
              '&:hover': { bgcolor: '#1b7d6b' }
            }}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creating...' : 'Create Challenge'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
