import { Metadata } from 'next';
import ActivityDetailClient from './ActivityDetailClient';

export const metadata: Metadata = {
  title: 'Activity Details',
  description: 'View and manage your activity details',
};

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <ActivityDetailClient id={id} />;
} 