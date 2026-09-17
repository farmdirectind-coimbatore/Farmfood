import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { calculateHoldingProgress, eligibleWeekdayBatchDates, INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users
    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select('id, role, created_at');

    if (usersError) throw usersError;

    // Fetch purchase requests
    const { data: purchaseRequests, error: prError } = await adminClient
      .from('purchase_requests')
      .select('id, status, user_id, shares, amount')
      .eq('status', 'PENDING');

    if (prError) throw prError;

    // Fetch holdings
    const { data: holdings, error: holdingsError } = await adminClient
      .from('holdings')
      .select('id, user_id, shares, amount_invested, daily_payout, total_projected_return, start_date, end_date, weekdays_paid, total_paid, status');

    if (holdingsError) throw holdingsError;

    // Today's payouts (only rows actually due today, i.e. past the 6 AM batch)
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isWeekday = today.getDay() !== 0 && today.getDay() !== 6;

    const { data: todaysPayouts, error: payoutsError } = await adminClient
      .from('payouts')
      .select('id, holding_id, marked_by')
      .gte('payout_date', today.toISOString())
      .lt('payout_date', tomorrow.toISOString());

    if (payoutsError) throw payoutsError;

    const markedToday = new Set(todaysPayouts?.filter(p => p.marked_by).map(p => p.holding_id) ?? []);

    let paidToday = 0;
    let pendingToday = 0;
    for (const h of holdings ?? []) {
      if (h.status !== 'ACTIVE') continue;
      const startDate = new Date(h.start_date);
      startDate.setHours(0, 0, 0, 0);
      if (startDate > today) continue;
      const endDate = new Date(h.end_date);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < today) continue;
      if (!isWeekday) continue;

      const eligibleDates = eligibleWeekdayBatchDates(new Date(h.start_date), now);
      if (eligibleDates.length === 0) continue;
      const last = eligibleDates[eligibleDates.length - 1];
      const dueToday =
        last.getFullYear() === today.getFullYear() &&
        last.getMonth() === today.getMonth() &&
        last.getDate() === today.getDate();
      if (!dueToday) continue;

      if (markedToday.has(h.id)) {
        paidToday++;
      } else {
        pendingToday++;
      }
    }

    const todaysPayoutCount = paidToday + pendingToday;

    // Calculate stats
    const totalUsers = users?.length || 0;
    const verifiedUsers = users?.filter(u => u.role === 'USER').length || 0;

    const totalShares = holdings?.reduce((sum, h) => sum + h.shares, 0) || 0;
    const totalInvested = holdings?.reduce((sum, h) => sum + Number(h.amount_invested), 0) || 0;

    const pendingRequests = purchaseRequests?.length || 0;

    // Holdings completing soon (less than 10 weekdays left)
    const completingSoon = holdings?.filter(h => {
      if (h.status !== 'ACTIVE') return false;
      const progress = calculateHoldingProgress(h, today);
      return progress.daysLeft > 0 && progress.daysLeft <= 10;
    }).length || 0;

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      totalShares,
      totalInvested,
      pendingRequests,
      todaysPayouts: todaysPayoutCount,
      paidToday,
      pendingToday,
      completingSoon,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}