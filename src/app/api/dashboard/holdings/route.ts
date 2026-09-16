import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { calculateHoldingProgress } from '@/lib/calculations/investment';

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

    const { data: holdings, error } = await adminClient
      .from('holdings')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const today = new Date();
    const processedHoldings = holdings?.map(holding => {
      const progress = calculateHoldingProgress(holding, today);
      return {
        ...holding,
        amount_invested: Number(holding.amount_invested),
        daily_payout: Number(holding.daily_payout),
        total_projected_return: Number(holding.total_projected_return),
        total_paid: Number(holding.total_paid),
        progress,
      };
    }) || [];

    return NextResponse.json(processedHoldings);
  } catch (error) {
    console.error('Holdings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}