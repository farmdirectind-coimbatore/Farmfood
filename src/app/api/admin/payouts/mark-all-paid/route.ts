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
    const { payoutIds } = body;

    if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
      return NextResponse.json({ error: 'Payout IDs required' }, { status: 400 });
    }

    // Get all payouts with holdings and users
    const { data: payouts, error: payoutsError } = await adminClient
      .from('payouts')
      .select(`
        *,
        holding:holdings(*, user:users!holdings_user_id_fkey(*))
      `)
      .in('id', payoutIds)
      .is('marked_by', null);

    if (payoutsError) throw payoutsError;

    if (!payouts || payouts.length === 0) {
      return NextResponse.json({ error: 'No valid pending payouts found' }, { status: 400 });
    }

    const results: { payoutId: string; success: boolean; isComplete: boolean }[] = [];

    // Track running counters per holding so multiple pending payouts for the
    // same holding (multi-day catch-up) accumulate correctly in one batch.
    const holdingState = new Map<string, { weekdaysPaid: number; totalPaid: number }>();
    for (const payout of payouts) {
      if (!holdingState.has(payout.holding_id)) {
        holdingState.set(payout.holding_id, {
          weekdaysPaid: payout.holding.weekdays_paid || 0,
          totalPaid: Number(payout.holding.total_paid || 0),
        });
      }
    }

    for (const payout of payouts) {
      const state = holdingState.get(payout.holding_id)!;
      state.weekdaysPaid += 1;
      state.totalPaid += Number(payout.amount);

      const newWeekdaysPaid = state.weekdaysPaid;
      const newTotalPaid = state.totalPaid;
      const isComplete = newWeekdaysPaid >= INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS;

      // Update payout
      await adminClient
        .from('payouts')
        .update({
          marked_by: admin.id,
          marked_at: new Date().toISOString(),
        })
        .eq('id', payout.id);

      // Update holding
      await adminClient
        .from('holdings')
        .update({
          weekdays_paid: newWeekdaysPaid,
          total_paid: newTotalPaid,
          status: isComplete ? 'COMPLETED' : 'ACTIVE',
        })
        .eq('id', payout.holding_id);

      // Create notification
      await adminClient.from('notifications').insert({
        user_id: payout.user_id,
        type: 'payout_credited',
        title: 'Daily Payout Credited',
        message: `₹${Number(payout.amount).toLocaleString('en-IN')} credited. Total received: ₹${newTotalPaid.toLocaleString('en-IN')}.`,
        data: {
          payout_id: payout.id,
          amount: Number(payout.amount),
          running_total: newTotalPaid,
          weekdays_paid: newWeekdaysPaid,
          is_complete: isComplete,
        },
      });

      // If completed, send completion notification
      if (isComplete) {
        await adminClient.from('notifications').insert({
          user_id: payout.user_id,
          type: 'cycle_completed',
          title: 'Investment Cycle Completed',
          message: `Your holding of ${payout.holding.shares} lot${payout.holding.shares > 1 ? 's' : ''} completed. Total received: ₹${newTotalPaid.toLocaleString('en-IN')}.`,
          data: {
            holding_id: payout.holding_id,
            shares: payout.holding.shares,
            total_invested: Number(payout.holding.amount_invested),
            total_received: newTotalPaid,
          },
        });

        // Send email
        const u = payout.holding.user;
        await sendEmail({
          to: u.email,
          subject: 'Investment Cycle Completed - FarmDirect',
          html: emailTemplate(`
            <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">Investment Cycle Completed</h2>
            <p className="text-[#52796f] leading-relaxed">Hi ${u.name || 'Investor'},</p>
            <p className="text-[#52796f] leading-relaxed">Congratulations! Your investment cycle of <strong>249 weekdays</strong> has been completed.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <tr><td style="padding: 8px 0;">Lots</td><td style="padding: 8px 0; text-align: right;">${payout.holding.shares}</td></tr>
              <tr><td style="padding: 8px 0;">Total Invested</td><td style="padding: 8px 0; text-align: right;">₹${Number(payout.holding.amount_invested).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0;">Total Received</td><td style="padding: 8px 0; text-align: right;">₹${newTotalPaid.toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0;">Net Profit</td><td style="padding: 8px 0; text-align: right;">₹${(newTotalPaid - Number(payout.holding.amount_invested)).toLocaleString('en-IN')}</td></tr>
            </table>
          `, 'Investment cycle completed'),
        });
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        admin_id: admin.id,
        action: 'mark_payout_paid',
        entity_type: 'payout',
        entity_id: payout.id,
        new_data: { weekdays_paid: newWeekdaysPaid, total_paid: newTotalPaid, is_complete: isComplete },
      });

      results.push({ payoutId: payout.id, success: true, isComplete });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Mark all paid error:', error);
    return NextResponse.json(
      { error: 'Failed to mark payouts as paid' },
      { status: 500 }
    );
  }
}