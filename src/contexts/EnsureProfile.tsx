import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function EnsureProfile({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    async function ensureProfile() {
      if (status !== 'authenticated' || !session?.user?.id) return;
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();
      if (!data && !error) {
        // Insert new profile
        await supabase.from('profiles').insert([
          {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || '',
            avatarUrl: session.user.image || null,
            created_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
    }
    ensureProfile();
  }, [session, status]);

  return <>{children}</>;
}
