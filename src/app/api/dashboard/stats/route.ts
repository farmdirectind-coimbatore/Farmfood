import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { calculateHoldingProgress, INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';

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
    const today = new Date();
    let totalShares = 0;
    let totalInvested = 0;
    let dailyPayoutRate = 0;
    let totalWeekdaysPaid = 0;
    let totalReceived = 0;
    let projectedRemaining = 0;

    const processedHoldings = holdings?.map(holding => {
      const progress = calculateHoldingProgress(holding, today);
      
      totalShares += holding.shares;
      totalInvested += Number(holding.amount_invested);
      dailyPayoutRate += Number(holding.daily_payout);
      totalWeekdaysPaid += progress.weekdaysPaid;
      totalReceived += progress.amountReceived;
      projectedRemaining += progress.amountRemaining;

      return {
        ...holding,
        amount_invested: Number(holding.amount_invested),
        daily_payout: Number(holding.daily_payout),
        total_projected_return: Number(holding.total_projected_return),
        total_paid: Number(holding.total_paid),
        weekdays_paid: progress.weekdaysPaid,
        progress_percent: progress.progressPercent,
        is_complete: progress.isComplete,
      };
    }) || [];

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
      totalShares,
      totalInvested,
      dailyPayoutRate,
      weekdaysPaid: totalWeekdaysPaid,
      totalReceived,
      projectedRemaining,
      holdings: processedHoldings,
      latestPurchase,
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