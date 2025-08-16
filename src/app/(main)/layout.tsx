'use client';

import { ProfileProvider } from '@/contexts/EnsureProfile';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
} 