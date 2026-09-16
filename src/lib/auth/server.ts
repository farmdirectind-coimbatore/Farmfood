import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*, profile:profiles(*)')
    .eq('supabase_id', user.id)
    .single();

  return profile;
}

export async function requireAuth() {
  const user = await getUserWithProfile();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin() {
  const user = await getUserWithProfile();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }
  return user;
}

export async function createUserProfile(supabaseUser: { id: string; email: string; user_metadata: { full_name?: string; avatar_url?: string } }) {
  const { data: existing } = await adminClient
    .from('users')
    .select('id')
    .eq('supabase_id', supabaseUser.id)
    .single();

  if (existing) {
    return existing;
  }

  const { data: newUser, error } = await adminClient
    .from('users')
    .insert({
      supabase_id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      role: 'USER',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  // Create empty profile
  await adminClient
    .from('profiles')
    .insert({ user_id: newUser.id })
    .single();

  return newUser;
}

export async function getUserRole(supabaseId: string): Promise<'USER' | 'ADMIN' | null> {
  const { data } = await adminClient
    .from('users')
    .select('role')
    .eq('supabase_id', supabaseId)
    .single();

  return data?.role || null;
}