'use client';

import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useClubDetail } from '@/hooks/useClubDetail';
import ClubHeader from '@/app/(main)/club/[id]/ClubHeader.client';
import ClubDetailContent from './ClubDetailContent';

interface ClubDetailPageProps {
  clubId: string;
}

export default function ClubDetailPage({ clubId }: ClubDetailPageProps) {
  const { club, loading, error } = useClubDetail(clubId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !club) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Club not found'}</Alert>
      </Box>
    );
  }

  return (
    <>
      <ClubHeader club={club} />
      <ClubDetailContent clubId={clubId} />
    </>
  );
} 