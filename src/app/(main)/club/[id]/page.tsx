// Club Detail Page
import MainLayout from '@/components/layout/MainLayout';
import ClubDetailContent from '@/components/club/ClubDetailContent';
import React from 'react';

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const clubId = (await params).id;

  return (
    <MainLayout>
      <ClubDetailContent clubId={clubId} />
    </MainLayout>
  );
}
