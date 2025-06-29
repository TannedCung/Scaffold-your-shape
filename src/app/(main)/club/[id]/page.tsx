// Club Detail Page
import MainLayout from '@/components/layout/MainLayout';
import ClubDetailPage from '@/components/club/ClubDetailPage';
import React from 'react';

export default async function ClubDetailPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const clubId = (await params).id;

  return (
    <MainLayout>
      <ClubDetailPage clubId={clubId} />
    </MainLayout>
  );
}
