'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSupabaseSession } from '@/components/SupabaseSessionProvider';

export function useAuth() {
  const { session, isLoading } = useSupabaseSession();
  const router = useRouter();

  const login = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }, [router]);

  const user = session?.user ?? null;
  const isAuthenticated = !!session;

  return { user, isLoading, isAuthenticated, login, logout };
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  return { user, isLoading, isAuthenticated };
}

export function useRequireAdmin() {
  const { user, isLoading, isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  return { user, isLoading, isAuthenticated };
}