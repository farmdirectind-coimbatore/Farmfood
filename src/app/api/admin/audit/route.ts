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
    const page = parseInt(searchParams.get('page') || '1');
    const action = searchParams.get('action') || 'all';
    const entityType = searchParams.get('entityType') || 'all';
    const search = searchParams.get('search') || '';
    const pageSize = 50;

    let query = adminClient
      .from('audit_logs')
      .select(`
        *,
        admin:users!audit_logs_admin_id_fkey(id, name, email)
      `, { count: 'exact' });

    if (action !== 'all') {
      query = query.eq('action', action);
    }

    if (entityType !== 'all') {
      query = query.eq('entity_type', entityType);
    }

    if (search) {
      query = query.or(`admin.name.ilike.%${search}%,admin.email.ilike.%${search}%,action.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data: logs, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Audit log fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}