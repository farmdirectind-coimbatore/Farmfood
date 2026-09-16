import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';
import { sendEmail } from '@/lib/email/resend';
import { emailTemplate } from '@/lib/email/templates/base';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { payoutId } = body;

    if (!payoutId) {
      return NextResponse.json({ error: 'Payout ID required' }, { status: 400 });
    }

    // Get the payout
    const { data: payout, error: payoutError } = await adminClient
      .from('payouts')
      .select('*, holding:holdings(*, user:users!holdings_user_id_fkey(*))')
      .eq('id', payoutId)
      .single();

    if (payoutError || !payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    if (payout.marked_by) {
      return NextResponse.json({ error: 'Payout already marked as paid' }, { status: 400 });
    }

    const newWeekdaysPaid = payout.weekdays_paid;
    const newTotalPaid = Number(payout.running_total);
    const isComplete = newWeekdaysPaid >= INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS;

    // Update payout
    const { error: updatePayoutError } = await adminClient
      .from('payouts')
      .update({
        marked_by: admin.id,
        marked_at: new Date().toISOString(),
      })
      .eq('id', payoutId);

    if (updatePayoutError) throw updatePayoutError;

    // Update holding
    const { error: updateHoldingError } = await adminClient
      .from('holdings')
      .update({
        weekdays_paid: newWeekdaysPaid,
        total_paid: newTotalPaid,
        status: isComplete ? 'COMPLETED' : 'ACTIVE',
      })
      .eq('id', payout.holding_id);

    if (updateHoldingError) throw updateHoldingError;

    // Create notification for user
    await adminClient.from('notifications').insert({
      user_id: payout.user_id,
      type: 'payout_credited',
      title: 'Daily Payout Credited',
      message: `₹${Number(payout.amount).toLocaleString('en-IN')} has been credited to your wallet for holding ${payout.holding.shares} share${payout.holding.shares > 1 ? 's' : ''}. Total received: ₹${newTotalPaid.toLocaleString('en-IN')}.`,
      data: {
        payout_id: payoutId,
        amount: Number(payout.amount),
        running_total: newTotalPaid,
        weekdays_paid: newWeekdaysPaid,
        is_complete: isComplete,
      },
    });

    // If cycle completed, send completion notification
    if (isComplete) {
      await adminClient.from('notifications').insert({
        user_id: payout.user_id,
        type: 'cycle_completed',
        title: 'Investment Cycle Completed',
        message: `Congratulations! Your holding of ${payout.holding.shares} share${payout.holding.shares > 1 ? 's' : ''} has completed its 249-weekday cycle. Total received: ₹${newTotalPaid.toLocaleString('en-IN')}.`,
        data: {
          holding_id: payout.holding_id,
          shares: payout.holding.shares,
          total_invested: Number(payout.holding.amount_invested),
          total_received: newTotalPaid,
        },
      });

      // Send cycle completion email
      const user = payout.holding.user;
      await sendEmail({
        to: user.email,
        subject: 'Investment Cycle Completed - FarmDirect',
        html: emailTemplate(`
          <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">Investment Cycle Completed</h2>
          <p className="text-[#52796f] leading-relaxed">Hi ${user.name || 'Investor'},</p>
          <p className="text-[#52796f] leading-relaxed">Congratulations! Your investment cycle of <strong>249 weekdays</strong> has been completed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr><td style="padding: 8px 0;">Shares Held</td><td style="padding: 8px 0; text-align: right;">${payout.holding.shares}</td></tr>
            <tr><td style="padding: 8px 0;">Total Invested</td><td style="padding: 8px 0; text-align: right;">₹${Number(payout.holding.amount_invested).toLocaleString('en-IN')}</td></tr>
            <tr><td style="padding: 8px 0;">Total Received</td><td style="padding: 8px 0; text-align: right;">₹${newTotalPaid.toLocaleString('en-IN')}</td></tr>
            <tr><td style="padding: 8px 0;">Net Profit</td><td style="padding: 8px 0; text-align: right;">₹${(newTotalPaid - Number(payout.holding.amount_invested)).toLocaleString('en-IN')}</td></tr>
          </table>
          <p className="text-[#52796f] leading-relaxed">Thank you for investing with FarmDirect.</p>
        `, 'Investment cycle completed'),
      });
    }

    // Create audit log
    await adminClient.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'mark_payout_paid',
      entity_type: 'payout',
      entity_id: payoutId,
      new_data: { weekdays_paid: newWeekdaysPaid, total_paid: newTotalPaid, is_complete: isComplete },
    });

    return NextResponse.json({ success: true, isComplete });
  } catch (error) {
    console.error('Mark payout paid error:', error);
    return NextResponse.json(
      { error: 'Failed to mark payout as paid' },
      { status: 500 }
    );
  }
}