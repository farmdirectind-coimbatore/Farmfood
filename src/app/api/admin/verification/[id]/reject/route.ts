import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { sendEmail } from '@/lib/email/resend';
import { purchaseRejectedEmail } from '@/lib/email/templates/investment';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // Get the purchase request
    const { data: pr, error: prError } = await adminClient
      .from('purchase_requests')
      .select('*, user:users!purchase_requests_user_id_fkey(*)')
      .eq('id', id)
      .single();

    if (prError || !pr) {
      return NextResponse.json({ error: 'Purchase request not found' }, { status: 404 });
    }

    if (pr.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // Update purchase request
    const { error: updateError } = await adminClient
      .from('purchase_requests')
      .update({
        status: 'REJECTED',
        rejection_reason: reason.trim(),
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Create notification for user
    await adminClient.from('notifications').insert({
      user_id: pr.user_id,
      type: 'purchase_rejected',
      title: 'Payment Rejected',
      message: `Your payment for ${pr.shares} share${pr.shares > 1 ? 's' : ''} was rejected. Reason: ${reason}. You can submit a new payment proof from your dashboard.`,
      data: {
        shares: pr.shares,
        amount: Number(pr.amount),
        rejection_reason: reason,
      },
    });

    // Create audit log
    await adminClient.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'reject_purchase',
      entity_type: 'purchase_request',
      entity_id: id,
      new_data: { rejection_reason: reason },
    });

    // Send email to user
    await sendEmail({
      to: pr.user.email,
      subject: 'Payment Verification Update - FarmDirect',
      html: purchaseRejectedEmail(
        pr.user.name || 'Investor',
        pr.shares,
        Number(pr.amount),
        reason
      ),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to reject purchase request' },
      { status: 500 }
    );
  }
}