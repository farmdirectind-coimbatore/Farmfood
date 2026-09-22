import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from './admin-session';

export interface AdminIdentity {
  id: string;
  name: string | null;
  email: string;
  authMethod: 'cookie' | 'supabase';
}

export async function getSystemAdmin(): Promise<AdminIdentity | null> {
  const email = process.env.ADMIN_EMAILS || 'farmdirect.ind@gmail.com';

  const { data: existing, error } = await adminClient
    .from('users')
    .select('id, name, email')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return { id: existing.id, name: existing.name, email: existing.email, authMethod: 'cookie' };
  }

  if (error) return null;

  const { data: created, error: createError } = await adminClient
    .from('users')
    .insert({
      id: 'admin-placeholder',
      supabase_id: 'admin-placeholder',
      email,
      name: 'FarmDirect Admin',
      role: 'ADMIN',
    })
    .select('id, name, email')
    .single();

  if (createError || !created) return null;

  return { id: created.id, name: created.name, email: created.email, authMethod: 'cookie' };
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (await verifyAdminSession(adminToken)) {
    return getSystemAdmin();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await adminClient
    .from('users')
    .select('id, name, email, role')
    .eq('supabase_id', user.id)
    .single();

  if (!profile || profile.role !== 'ADMIN') return null;

  return { id: profile.id, name: profile.name, email: profile.email, authMethod: 'supabase' };
}

export async function requireAdmin(): Promise<AdminIdentity | null> {
  return getAdminIdentity();
}