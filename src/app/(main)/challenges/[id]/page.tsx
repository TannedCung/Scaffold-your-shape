'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ChallengeDetailPage from '@/components/challenges/ChallengeDetailPage';

export default function ChallengeDetailPageComponent() {
  const params = useParams();
  const challengeId = params?.id as string;

  return (
    <MainLayout>
      <ChallengeDetailPage challengeId={challengeId} />
    </MainLayout>
  );
} 