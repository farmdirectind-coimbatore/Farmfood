import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ role: null }, { status: 401 });
    }
    const { data: profile, error } = await adminClient
      .from('users')
      .select('role')
      .eq('supabase_id', user.id)
      .single();
    if (error || !profile) {
      return NextResponse.json({ role: 'USER' });
    }
    return NextResponse.json({ role: profile.role });
  } catch (error) {
    console.error('Role check error:', error);
    return NextResponse.json({ error: 'Failed to check role' }, { status: 500 });
  }
}