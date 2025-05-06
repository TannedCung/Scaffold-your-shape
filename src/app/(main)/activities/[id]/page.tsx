import { Metadata } from 'next';
import ActivityDetailClient from './ActivityDetailClient';

export const metadata: Metadata = {
  title: 'Activity Details',
  description: 'View and manage your activity details',
};

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  return <ActivityDetailClient id={params.id} />;
} 