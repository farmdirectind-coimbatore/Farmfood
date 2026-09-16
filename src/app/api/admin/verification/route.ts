import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { getSignedDownloadUrl } from '@/lib/supabase/storage';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'PENDING';
    const pageSize = 20;

    let query = adminClient
      .from('purchase_requests')
      .select(`
        *,
        user:users!purchase_requests_user_id_fkey(id, name, email, avatar_url)
      `, { count: 'exact' });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`user.name.ilike.%${search}%,user.email.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data: requests, error, count } = await query;

    if (error) throw error;

    const enrichedRequests = await Promise.all(
      (requests || []).map(async (req) => {
        if (req.screenshot_url) {
          const signedUrl = await getSignedDownloadUrl(req.screenshot_url);
          return { ...req, screenshot_url: signedUrl || req.screenshot_url };
        }
        return req;
      })
    );

    return NextResponse.json({
      requests: enrichedRequests,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Verification fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification requests' },
      { status: 500 }
    );
  }
}