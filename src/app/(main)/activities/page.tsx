"use client";

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  MenuItem, 
  InputAdornment,
  Divider,
  IconButton,
  Fab,
  CircularProgress,
  Alert,
} from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ActivityList from '@/components/activities/ActivityList';
import CreateActivityDialog from '@/components/activities/CreateActivityDialog';
import { useActivities } from '@/hooks/useActivities';
import { useUser } from '@/hooks/useUser';
import { useSession } from 'next-auth/react';

export default function ActivitiesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { user, loading: userLoading, error: userError } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Only fetch activities if user is logged in
  const { activities, loading: activitiesLoading, error: activitiesError } = useActivities(user?.id);

  const loading = userLoading || activitiesLoading || sessionStatus === 'loading';
  const error = userError || activitiesError;
  
  // Determine authenticated state
  const isAuthenticated = !!session?.user || !!user;

  const filteredActivities = activities
    .filter(activity => {
      // Filter by type
      if (activityType !== 'all' && activity.type !== activityType) return false;
      
      // Filter by search query (name or notes)
      if (searchQuery && !activity.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Activities
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={loading || !isAuthenticated}
            sx={{ 
              backgroundColor: '#2da58e', 
              '&:hover': { backgroundColor: '#1a8a73' } 
            }}
          >
            Add Activity
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : !isAuthenticated && !loading ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please log in to view and manage your activities.
          </Alert>
        ) : (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Button 
                      fullWidth 
                      startIcon={<FilterListIcon />} 
                      variant="outlined"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      Filter
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SortIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                {showFilters && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          select
                          fullWidth
                          label="Activity Type"
                          value={activityType}
                          onChange={(e) => setActivityType(e.target.value)}
                          size="small"
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="run">Running</MenuItem>
                          <MenuItem value="walk">Walking</MenuItem>
                          <MenuItem value="swim">Swimming</MenuItem>
                          <MenuItem value="cycle">Cycling</MenuItem>
                          <MenuItem value="hike">Hiking</MenuItem>
                          <MenuItem value="workout">Workout</MenuItem>
                          
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            <ActivityList 
              activities={filteredActivities} 
              loading={loading} 
              error={error} 
              showSocial={true}
              userId={user?.id}
            />
          </>
        )}

        <CreateActivityDialog 
          open={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)} 
        />

        {/* Mobile FAB for adding activity */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: { sm: 'none' } }}>
          <Fab 
            color="primary" 
            aria-label="add activity"
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={loading || !isAuthenticated}
            sx={{ backgroundColor: '#2da58e', '&:hover': { backgroundColor: '#1a8a73' } }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Container>
    </MainLayout>
  );
} 