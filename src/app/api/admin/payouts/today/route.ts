import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { eligibleWeekdayBatchDates, INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';
import { zonedStartOfDay } from '@/lib/utils/time';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const today = zonedStartOfDay(now);
    const todayStart = today.toISOString();

    // Get all active holdings with user + bank profile
    const { data: holdings, error: holdingsError } = await adminClient
      .from('holdings')
      .select(`
        *,
        user:users!holdings_user_id_fkey(
          id, name, email,
          profiles:profiles!profiles_user_id_fkey(phone, account_holder_name, account_number, ifsc_code, upi_id)
        )
      `)
      .eq('status', 'ACTIVE');

    if (holdingsError) throw holdingsError;

    // Get all existing payout rows for active holdings
    const activeHoldingIds = (holdings || []).map(h => h.id);
    const { data: allPayouts, error: payoutsError } = await adminClient
      .from('payouts')
      .select('*')
      .in('holding_id', activeHoldingIds.length > 0 ? activeHoldingIds : ['__none__']);

    if (payoutsError) throw payoutsError;

    const existingByHolding = new Map<string, Map<string, any>>();
    for (const payout of allPayouts || []) {
      if (!existingByHolding.has(payout.holding_id)) {
        existingByHolding.set(payout.holding_id, new Map());
      }
      existingByHolding.get(payout.holding_id)!.set(payout.payout_date.slice(0, 10), payout);
    }

    const pending: any[] = [];
    const paidToday: any[] = [];
    const nearingCompletion: any[] = [];

    // Generate + bucket payouts for each active holding
    for (const holding of holdings || []) {
      const startDate = new Date(holding.start_date);
      const endDate = new Date(holding.end_date);
      if (endDate < today) continue;

      const eligibleDates = eligibleWeekdayBatchDates(startDate, now);
      const holdingRows = existingByHolding.get(holding.id) || new Map();
      const confirmedWeekdays = holding.weekdays_paid || 0;

      for (let i = 0; i < eligibleDates.length; i++) {
        const batchIndex = i + 1;
        if (batchIndex <= confirmedWeekdays) continue;

        const date = eligibleDates[i];
        const dateKey = date.toISOString().slice(0, 10);
        let row = holdingRows.get(dateKey);

        if (!row) {
          const runningTotal = Number(holding.total_paid) + Number(holding.daily_payout) * (batchIndex - confirmedWeekdays);
          const { data: newRow, error: insertError } = await adminClient
            .from('payouts')
            .insert({
              holding_id: holding.id,
              user_id: holding.user_id,
              payout_date: date.toISOString(),
              amount: holding.daily_payout,
              running_total: runningTotal,
              weekdays_paid: batchIndex,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          row = newRow;
          holdingRows.set(dateKey, row);
        }

        if (row.marked_by) {
          if (row.marked_at && row.marked_at >= todayStart) {
            paidToday.push({ ...row, holding: { ...holding, lots: Number(holding.shares) }, amount: Number(row.amount), running_total: Number(row.running_total) });
          }
        } else {
          pending.push({ ...row, holding: { ...holding, lots: Number(holding.shares) }, amount: Number(row.amount), running_total: Number(row.running_total) });
        }
      }

      // Nearing completion (1..10 confirmed weekdays left)
      const remaining = INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS - confirmedWeekdays;
      if (remaining > 0 && remaining <= 10) {
        nearingCompletion.push({
          id: `nearing-${holding.id}`,
          holding_id: holding.id,
          holding: { ...holding, lots: Number(holding.shares) },
          amount: Number(holding.daily_payout),
          running_total: Number(holding.total_paid),
          weekdays_paid: holding.weekdays_paid,
          payout_date: today.toISOString(),
          marked_by: null,
        });
      }
    }

    // Completed holdings
    const { data: completedHoldings, error: completedError } = await adminClient
      .from('holdings')
      .select(`
        *,
        user:users!holdings_user_id_fkey(
          id, name, email,
          profiles:profiles!profiles_user_id_fkey(phone, account_holder_name, account_number, ifsc_code, upi_id)
        )
      `)
      .eq('status', 'COMPLETED');

    if (completedError) throw completedError;

    const completed = (completedHoldings || []).map(h => ({
      id: `completed-${h.id}`,
      holding_id: h.id,
      holding: { ...h, lots: Number(h.shares) },
      amount: Number(h.daily_payout),
      running_total: Number(h.total_paid),
      weekdays_paid: h.weekdays_paid,
      payout_date: h.end_date,
      marked_by: h.id,
    }));

    return NextResponse.json({
      pending,
      paid: paidToday,
      nearingCompletion,
      completed,
    });
  } catch (error) {
    console.error('Todays payouts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}