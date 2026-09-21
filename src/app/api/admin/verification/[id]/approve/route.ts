import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { calculateEndDate, INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';
import { sendEmail } from '@/lib/email/resend';
import { purchaseApprovedEmail, adminNewRequestEmail, investmentConfirmationEmail } from '@/lib/email/templates/investment';

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

    const startDate = new Date();
    const endDate = calculateEndDate(startDate);

    // Create holding
    const { data: holding, error: holdingError } = await adminClient
      .from('holdings')
      .insert({
        user_id: pr.user_id,
        purchase_request_id: pr.id,
        shares: pr.shares,
        amount_invested: pr.amount,
        daily_payout: pr.daily_payout,
        total_projected_return: pr.total_projected_return,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (holdingError) throw holdingError;

    // Update purchase request
    const { error: updateError } = await adminClient
      .from('purchase_requests')
      .update({
        status: 'APPROVED',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Create notification for user
    await adminClient.from('notifications').insert({
      user_id: pr.user_id,
      type: 'purchase_approved',
      title: 'Payment Approved - Holding Activated',
      message: `Your payment for ${pr.shares} lot${pr.shares > 1 ? 's' : ''} (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(pr.amount))}) has been approved. Daily payouts will begin from ${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      data: {
        shares: pr.shares,
        amount: Number(pr.amount),
        daily_payout: Number(pr.daily_payout),
        total_projected_return: Number(pr.total_projected_return),
        holding_id: holding.id,
      },
    });

    // Create audit log
    await adminClient.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'approve_purchase',
      entity_type: 'purchase_request',
      entity_id: id,
      new_data: { holding_id: holding.id, start_date: startDate.toISOString() },
    });

    // Send email to user - payment approved
    await sendEmail({
      to: pr.user.email,
      subject: 'Payment Approved - Your FarmDirect Holding is Active',
      html: purchaseApprovedEmail(
        pr.user.name || 'Investor',
        pr.shares,
        Number(pr.amount),
        Number(pr.daily_payout),
        Number(pr.total_projected_return),
        startDate
      ),
    });

    // Send investment confirmation email
    await sendEmail({
      to: pr.user.email,
      subject: `Investment Confirmed: ${pr.shares} Lot${pr.shares > 1 ? 's' : ''} - FarmDirect`,
      html: investmentConfirmationEmail(
        pr.user.name || 'Investor',
        pr.shares,
        Number(pr.amount),
        Number(pr.daily_payout),
        Number(pr.total_projected_return)
      ),
    });

    return NextResponse.json({ success: true, holding });
  } catch (error) {
    console.error('Approve purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to approve purchase request' },
      { status: 500 }
    );
  }
}