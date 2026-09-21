import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user details
    const { data: user, error: userError } = await adminClient
      .from('users')
      .select('id, email, name, role, created_at, avatar_url')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('phone, account_holder_name, account_number, ifsc_code, upi_id')
      .eq('user_id', id)
      .single();

    // Get holdings with payouts
    const { data: holdings } = await adminClient
      .from('holdings')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Get all payouts for user's holdings
    const holdingIds = holdings?.map(h => h.id) || [];
    let payouts: any[] = [];
    if (holdingIds.length > 0) {
      const { data: payoutsData } = await adminClient
        .from('payouts')
        .select('*')
        .in('holding_id', holdingIds)
        .order('payout_date', { ascending: false });
      payouts = payoutsData || [];
    }

    // Get purchase requests
    const { data: purchaseRequests } = await adminClient
      .from('purchase_requests')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Calculate totals
    const totalLots = holdings?.reduce((sum, h) => sum + (h.shares || 0), 0) || 0;
    const totalInvested = holdings?.reduce((sum, h) => sum + Number(h.amount_invested), 0) || 0;
    const totalReceived = payouts
      .filter(p => p.marked_by)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingPayouts = payouts
      .filter(p => !p.marked_by)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Build holding details with progress
    const holdingsWithProgress = (holdings || []).map(h => {
      const holdingPayouts = payouts.filter(p => p.holding_id === h.id);
      const confirmedPayouts = holdingPayouts.filter(p => p.marked_by);
      const weekdaysPaid = confirmedPayouts.length;
      const totalPaid = confirmedPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalProjectedReturn = Number(h.total_projected_return);
      const progressPercent = Math.min(100, (weekdaysPaid / 249) * 100);
      const isComplete = h.status === 'COMPLETED' || weekdaysPaid >= 249;

      return {
        ...h,
        lots: Number(h.shares),
        amount_invested: Number(h.amount_invested),
        daily_payout: Number(h.daily_payout),
        total_projected_return: totalProjectedReturn,
        total_paid: totalPaid,
        weekdays_paid: weekdaysPaid,
        progress_percent: progressPercent,
        is_complete: isComplete,
        payouts: holdingPayouts.map(p => ({
          ...p,
          amount: Number(p.amount),
          running_total: Number(p.running_total),
        })),
      };
    });

    // Map purchase requests shares → lots
    const mappedPurchaseRequests = (purchaseRequests || []).map(pr => ({
      ...pr,
      lots: Number(pr.shares),
    }));

    return NextResponse.json({
      user,
      profile,
      holdings: holdingsWithProgress,
      purchaseRequests: mappedPurchaseRequests,
      summary: {
        totalLots,
        totalInvested,
        totalReceived,
        pendingPayouts,
        totalHoldings: holdings?.length || 0,
      },
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}