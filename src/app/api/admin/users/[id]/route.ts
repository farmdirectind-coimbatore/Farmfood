import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if user exists
    const { data: user, error: userError } = await adminClient
      .from('users')
      .select('id, email, role, supabase_id')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting admin users (optional safety check)
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Delete child records manually in FK-safe order. The database FKs are
    // RESTRICT (not CASCADE), so a user with holdings/payouts/requests would
    // otherwise fail to delete. We DO NOT delete the Supabase Auth user, so
    // they can re-register with the same email later.

    // Notifications first (standalone)
    const { error: notifError } = await adminClient
      .from('notifications')
      .delete()
      .eq('user_id', id);
    if (notifError) throw notifError;

    // Payouts reference holdings, so delete before holdings
    const { error: payoutsError } = await adminClient
      .from('payouts')
      .delete()
      .eq('user_id', id);
    if (payoutsError) throw payoutsError;

    // Holdings reference purchase_requests (purchase_request_id), so holdings
    // must go before purchase_requests
    const { error: holdingsError } = await adminClient
      .from('holdings')
      .delete()
      .eq('user_id', id);
    if (holdingsError) throw holdingsError;

    // Purchase requests
    const { error: prError } = await adminClient
      .from('purchase_requests')
      .delete()
      .eq('user_id', id);
    if (prError) throw prError;

    // Profiles
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('user_id', id);
    if (profileError) throw profileError;

    // Audit logs may reference this user via admin_id (their purchase
    // requests were logged with admin_id = user id)
    const { error: auditError } = await adminClient
      .from('audit_logs')
      .delete()
      .eq('admin_id', id);
    if (auditError) throw auditError;

    // Finally delete the user row
    const { error: deleteError } = await adminClient
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Create audit log
    await adminClient.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'delete_user',
      entity_type: 'user',
      entity_id: id,
      new_data: { email: user.email, supabase_id: user.supabase_id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}