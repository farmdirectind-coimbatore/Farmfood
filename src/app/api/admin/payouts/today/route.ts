import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { calculateHoldingProgress, INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isWeekday = today.getDay() !== 0 && today.getDay() !== 6;

    // Get all active holdings
    const { data: holdings, error: holdingsError } = await adminClient
      .from('holdings')
      .select(`
        *,
        user:users!holdings_user_id_fkey(id, name, email)
      `)
      .eq('status', 'ACTIVE');

    if (holdingsError) throw holdingsError;

    // Get today's payouts
    const { data: todaysPayouts, error: payoutsError } = await adminClient
      .from('payouts')
      .select('*')
      .gte('payout_date', today.toISOString())
      .lt('payout_date', tomorrow.toISOString());

    if (payoutsError) throw payoutsError;

    const paidPayoutIds = new Set(todaysPayouts?.filter(p => p.marked_by).map(p => p.id) || []);

    // Process pending payouts for today (only on weekdays)
    let pending: any[] = [];
    let paid: any[] = [];

    if (isWeekday) {
      // Find holdings that should get a payout today
      for (const holding of holdings || []) {
        const startDate = new Date(holding.start_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(holding.end_date);
        endDate.setHours(0, 0, 0, 0);

        if (startDate > today || endDate < today) continue;

        const progress = calculateHoldingProgress(holding, today);
        
        // Check if this holding already has a payout for today
        const existingPayout = todaysPayouts?.find(p => p.holding_id === holding.id);
        
        if (existingPayout) {
          if (existingPayout.marked_by) {
            paid.push({
              ...existingPayout,
              holding,
              amount: Number(existingPayout.amount),
              running_total: Number(existingPayout.running_total),
            });
          } else {
            pending.push({
              ...existingPayout,
              holding,
              amount: Number(existingPayout.amount),
              running_total: Number(existingPayout.running_total),
            });
          }
        } else {
          // Need to create payout record for today
          const nextWeekdayPaid = holding.weekdays_paid + 1;
          const runningTotal = Number(holding.total_paid) + Number(holding.daily_payout);
          
          // Create the payout record
          const { data: newPayout } = await adminClient
            .from('payouts')
            .insert({
              holding_id: holding.id,
              user_id: holding.user_id,
              payout_date: today.toISOString(),
              amount: holding.daily_payout,
              running_total: runningTotal,
              weekdays_paid: nextWeekdayPaid,
            })
            .select()
            .single();

          if (newPayout) {
            pending.push({
              ...newPayout,
              holding,
              amount: Number(newPayout.amount),
              running_total: Number(newPayout.running_total),
            });
          }
        }
      }
    }

    // Paid today (including from previous days if marked today)
    const paidToday = todaysPayouts?.filter(p => p.marked_by).map(p => ({
      ...p,
      amount: Number(p.amount),
      running_total: Number(p.running_total),
    })) || [];

    // Nearing completion (less than 10 weekdays left)
    const nearingCompletion = holdings?.filter(h => {
      if (h.status !== 'ACTIVE') return false;
      const progress = calculateHoldingProgress(h, today);
      return progress.daysLeft > 0 && progress.daysLeft <= 10;
    }).map(h => {
      // Create a mock payout object for display
      const progress = calculateHoldingProgress(h, today);
      return {
        id: `nearing-${h.id}`,
        holding_id: h.id,
        holding: h,
        amount: Number(h.daily_payout),
        running_total: Number(h.total_paid),
        weekdays_paid: progress.weekdaysPaid,
        payout_date: today.toISOString(),
        marked_by: null,
      };
    }) || [];

    // Completed holdings
    const completedHoldings = holdings?.filter(h => h.status === 'COMPLETED') || [];
    const completed = completedHoldings.map(h => ({
      id: `completed-${h.id}`,
      holding_id: h.id,
      holding: h,
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