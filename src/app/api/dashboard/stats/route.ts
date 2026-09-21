import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's internal ID
    const { data: userProfile } = await adminClient
      .from('users')
      .select('id')
      .eq('supabase_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch all holdings for this user
    const { data: holdings, error: holdingsError } = await adminClient
      .from('holdings')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (holdingsError) {
      throw holdingsError;
    }

    // Calculate stats
    let totalLots = 0;
    let totalInvested = 0;
    let dailyPayoutRate = 0;
    let totalWeekdaysPaid = 0;
    let totalReceived = 0;
    let projectedRemaining = 0;

    // Total confirmed (admin-approved) payouts for this user
    const { data: confirmedPayouts } = await adminClient
      .from('payouts')
      .select('amount')
      .eq('user_id', userProfile.id)
      .not('marked_by', 'is', null);
    totalReceived = confirmedPayouts?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

    const processedHoldings = holdings?.map(holding => {
      const weekdaysPaid = holding.weekdays_paid || 0;
      const totalPaid = Number(holding.total_paid || 0);
      const totalProjectedReturn = Number(holding.total_projected_return);
      const progressPercent = Math.min(100, (weekdaysPaid / INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS) * 100);
      const isComplete = holding.status === 'COMPLETED' || weekdaysPaid >= INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS;

      totalLots += holding.shares;
      totalInvested += Number(holding.amount_invested);
      dailyPayoutRate += Number(holding.daily_payout);
      totalWeekdaysPaid += weekdaysPaid;

      return {
        ...holding,
        lots: Number(holding.shares),
        amount_invested: Number(holding.amount_invested),
        daily_payout: Number(holding.daily_payout),
        total_projected_return: totalProjectedReturn,
        total_paid: totalPaid,
        weekdays_paid: weekdaysPaid,
        progress_percent: progressPercent,
        is_complete: isComplete,
      };
    }) || [];

    projectedRemaining = Math.max(0, (holdings?.reduce((sum, h) => sum + Number(h.total_projected_return || 0), 0) || 0) - totalReceived);

    const { data: profileRow } = await adminClient
      .from('profiles')
      .select('phone')
      .eq('user_id', userProfile.id)
      .single();

    const { data: latestPurchase } = await adminClient
      .from('purchase_requests')
      .select('id, shares, amount, status, rejection_reason, created_at')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      totalLots,
      totalInvested,
      dailyPayoutRate,
      weekdaysPaid: totalWeekdaysPaid,
      totalReceived,
      projectedRemaining,
      holdings: processedHoldings,
      latestPurchase: latestPurchase
        ? { ...latestPurchase, lots: Number(latestPurchase.shares) }
        : null,
      onboardingComplete: !!profileRow?.phone,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}