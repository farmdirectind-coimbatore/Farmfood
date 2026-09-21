import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { normalizeProfile } from '@/lib/utils/profile';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const role = (searchParams.get('role') || 'all').toLowerCase();
    const sort = searchParams.get('sort') || 'newest';
    const pageSize = 20;

    let query = adminClient
      .from('users')
      .select(`
        id,
        supabase_id,
        email,
        name,
        avatar_url,
        role,
        created_at,
        holdings:holdings(shares, amount_invested),
        purchase_requests:purchase_requests!purchase_requests_user_id_fkey(status, shares),
        profile:profiles!profiles_user_id_fkey(phone, account_holder_name, account_number, ifsc_code, upi_id)
      `, { count: 'exact' })
      .neq('role', 'ADMIN');

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role !== 'all' && (role === 'ADMIN' || role === 'USER')) {
      query = query.eq('role', role);
    }

    const sortByLots = sort === 'shares' || sort === 'lots' || sort === 'invested';
    const sortAsc = sort === 'oldest';

    query = query.order('created_at', { ascending: sortAsc });

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Process users with stats
    const processedUsers = users?.map(u => {
      const totalLots = u.holdings?.reduce((sum: number, h: any) => sum + (h.shares || 0), 0) || 0;
      const totalInvested = u.holdings?.reduce((sum: number, h: any) => sum + Number(h.amount_invested), 0) || 0;
      const pendingRequests = u.purchase_requests?.filter((pr: any) => pr.status === 'PENDING').length || 0;
      const profile = normalizeProfile(u.profile);

      return {
        id: u.id,
        supabase_id: u.supabase_id,
        email: u.email,
        name: u.name,
        avatar_url: u.avatar_url,
        role: u.role,
        created_at: u.created_at,
        profile: profile
          ? {
              phone: profile.phone,
              account_holder_name: profile.account_holder_name,
              account_number: profile.account_number,
              ifsc_code: profile.ifsc_code,
              upi_id: profile.upi_id,
            }
          : null,
        _stats: {
          total_lots: totalLots,
          total_invested: totalInvested,
          pending_requests: pendingRequests,
        },
      };
    }) || [];

    // Sort by lots/invested after stats are computed, then paginate in JS
    let pageUsers = processedUsers;
    if (sortByLots) {
      const key = sort === 'shares' || sort === 'lots' ? 'total_lots' : 'total_invested';
      pageUsers = [...processedUsers].sort((a, b) => b._stats[key] - a._stats[key]);
    }
    const slicedUsers = pageUsers.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      users: slicedUsers,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}