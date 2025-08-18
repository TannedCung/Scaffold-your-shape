'use client';

import React from 'react';
import { useChallengeDetail } from '@/hooks/useChallengeDetail';
import { DetailPageLayout } from '@/components/common/DetailPageLayout';
import ChallengeHeader from './ChallengeHeader.client';
import ChallengeDetailContent from './ChallengeDetailContent';

interface ChallengeDetailPageProps {
  challengeId: string;
}

export default function ChallengeDetailPage({ challengeId }: ChallengeDetailPageProps) {
  const { challenge, loading, error } = useChallengeDetail(challengeId);

  return (
    <DetailPageLayout
      loading={loading}
      error={error}
      maxWidth="xl"
    >
      {/* Challenge Header */}
      <ChallengeHeader challengeId={challengeId} />
      
      {/* Main Content */}
      <ChallengeDetailContent challengeId={challengeId} />
    </DetailPageLayout>
  );
} 