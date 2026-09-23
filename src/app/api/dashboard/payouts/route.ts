import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { zonedStartOfMonth, zonedStartOfYear } from '@/lib/utils/time';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile } = await adminClient
      .from('users')
      .select('id')
      .eq('supabase_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: payouts, error } = await adminClient
      .from('payouts')
      .select(`
        *,
        holding:holdings(shares, amount_invested)
      `)
      .eq('user_id', userProfile.id)
      .not('marked_by', 'is', null)
      .order('payout_date', { ascending: false });

    if (error) throw error;

    const now = new Date();
    const startOfMonth = zonedStartOfMonth(now);
    const startOfYear = zonedStartOfYear(now);

    let totalPayouts = 0;
    let totalAmount = 0;
    let thisMonthAmount = 0;
    let thisYearAmount = 0;

    const processedPayouts = payouts?.map(payout => {
      totalPayouts++;
      const amount = Number(payout.amount);
      totalAmount += amount;

      const payoutDate = new Date(payout.payout_date);
      if (payoutDate >= startOfMonth) thisMonthAmount += amount;
      if (payoutDate >= startOfYear) thisYearAmount += amount;

      return {
        ...payout,
        amount,
        running_total: Number(payout.running_total),
        holding: payout.holding ? {
          lots: Number(payout.holding.shares),
          amount_invested: Number(payout.holding.amount_invested),
        } : null,
      };
    }) || [];

    return NextResponse.json({
      payouts: processedPayouts,
      summary: {
        totalPayouts,
        totalAmount,
        thisMonthAmount,
        thisYearAmount,
      },
    });
  } catch (error) {
    console.error('Payouts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}