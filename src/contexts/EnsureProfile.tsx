import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function EnsureProfile({ children }: { children: React.ReactNode }) {
  console.log('[EnsureProfile] Component rendered');
  const { data: session, status } = useSession();
  console.log('[EnsureProfile] session', session);
  console.log('[EnsureProfile] status', status);
  useEffect(() => {
    async function ensureProfile() {
      if (status !== 'authenticated' || !session?.user?.id) return;
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!data && !error) {
        // Insert new profile
        const { error: insertError, data: insertData } = await supabase.from('profiles').insert([
          {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || '',
            avatar_url: session.user.image || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    }
    ensureProfile();
  }, [session, status]);

  return <>{children}</>;
}
