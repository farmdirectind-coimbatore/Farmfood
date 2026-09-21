import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'all').toLowerCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    let query = adminClient
      .from('payouts')
      .select(`
        id,
        holding_id,
        user_id,
        amount,
        running_total,
        payout_date,
        marked_by,
        marked_at,
        weekdays_paid,
        user:users!payouts_user_id_fkey(id, name, email),
        holding:holdings(shares, amount_invested)
      `)
      .order('payout_date', { ascending: false })
      .limit(limit);

    if (status === 'paid') {
      query = query.not('marked_by', 'is', null);
    } else if (status === 'pending') {
      query = query.is('marked_by', null);
    }

    const { data: payouts, error } = await query;

    if (error) throw error;

    // Summary for the history toolbar
    const { data: allPayouts, error: allError } = await adminClient
      .from('payouts')
      .select('amount, marked_by');

    if (allError) throw allError;

    const paid = (allPayouts || []).filter(p => p.marked_by);
    const pending = (allPayouts || []).filter(p => !p.marked_by);

    const processed = (payouts || []).map((raw: any) => {
      const p = raw as { user?: unknown; holding?: any; marked_by: string | null };
      const userArray = (p.user as any) ?? null;
      const user = Array.isArray(userArray) ? (userArray as any[])[0] : userArray;
      const holding = p.holding
        ? { lots: Number(p.holding.shares), amount_invested: Number(p.holding.amount_invested) }
        : null;
      return {
        id: (p as any).id,
        holding_id: (p as any).holding_id,
        user_id: (p as any).user_id,
        user: user
          ? { id: user.id, name: user.name, email: user.email }
          : null,
        holding,
        amount: Number((p as any).amount),
        running_total: Number((p as any).running_total),
        payout_date: (p as any).payout_date,
        marked_by: (p as any).marked_by,
        marked_at: (p as any).marked_at,
        weekdays_paid: (p as any).weekdays_paid,
        status: p.marked_by ? 'paid' : 'pending',
      };
    });

    return NextResponse.json({
      payouts: processed,
      summary: {
        all: (allPayouts || []).length,
        paid: paid.length,
        pending: pending.length,
        paidAmount: paid.reduce((s, p) => s + Number(p.amount), 0),
        pendingAmount: pending.reduce((s, p) => s + Number(p.amount), 0),
      },
    });
  } catch (error) {
    console.error('Payout history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout history' },
      { status: 500 }
    );
  }
}