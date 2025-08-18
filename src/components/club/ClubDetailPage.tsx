'use client';

import React from 'react';
import { useClubDetail } from '@/hooks/useClubDetail';
import { DetailPageLayout } from '@/components/common/DetailPageLayout';
import ClubHeader from '@/app/(main)/club/[id]/ClubHeader.client';
import ClubDetailContent from './ClubDetailContent';

interface ClubDetailPageProps {
  clubId: string;
}

export default function ClubDetailPage({ clubId }: ClubDetailPageProps) {
  const { club, loading, error } = useClubDetail(clubId);

  return (
    <DetailPageLayout
      loading={loading}
      error={error || (club ? null : 'Club not found')}
      maxWidth="xl"
      containerPadding={false}
    >
      {club && <ClubHeader club={club} />}
      <ClubDetailContent clubId={clubId} />
    </DetailPageLayout>
  );
} 