import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile, error: userError } = await adminClient
      .from('users')
      .select('id, name, email, avatar_url, created_at')
      .eq('supabase_id', user.id)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('phone, address, pan_number')
      .eq('user_id', userProfile.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { count: pendingCount } = await adminClient
      .from('purchase_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userProfile.id)
      .eq('status', 'PENDING');

    return NextResponse.json({
      ...profile,
      pendingCount: pendingCount || 0,
      user: userProfile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile } = await adminClient
      .from('users')
      .select('id')
      .eq('supabase_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { phone, address, pan_number, name } = body;

    if (name?.trim()) {
      await adminClient
        .from('users')
        .update({ name: name.trim() })
        .eq('id', userProfile.id);
    }

    const { error } = await adminClient
      .from('profiles')
      .update({
        phone: phone || null,
        address: address || null,
        pan_number: pan_number?.toUpperCase() || null,
      })
      .eq('user_id', userProfile.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}