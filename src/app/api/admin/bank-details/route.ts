import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { getAdminIdentity, requireAdmin } from '@/lib/auth/admin';

const UPI_ID_REGEX = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminIdentity();

    // Admins see all records
    if (admin) {
      const { data, error } = await adminClient
        .from('bank_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    // Regular (or any) logged-in user sees the single active record
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await adminClient
      .from('bank_details')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    return NextResponse.json(data?.[0] || null);
  } catch (error) {
    console.error('Bank details fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank details' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bank details ID required' }, { status: 400 });
    }

    // Validate IFSC if provided
    if (updates.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(updates.ifsc_code)) {
      return NextResponse.json({ error: 'Invalid IFSC code format' }, { status: 400 });
    }

    // Validate UPI-style IDs (generic UPI, GPay, PhonePe) if provided
    for (const field of ['upi_id', 'gpay_id', 'phonepay_id']) {
      const value = updates[field];
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value !== 'string' || !UPI_ID_REGEX.test(value.trim())) {
          return NextResponse.json(
            { error: `Invalid ${field.replace(/_/g, ' ').replace('id', 'ID')} format` },
            { status: 400 }
          );
        }
        updates[field] = value.trim();
      } else if (value === '') {
        updates[field] = null;
      }
    }

    // If setting as active, deactivate others
    if (updates.is_active === true) {
      await adminClient
        .from('bank_details')
        .update({ is_active: false })
        .neq('id', id);
    }

    const { data, error } = await adminClient
      .from('bank_details')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await adminClient.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'update_bank_details',
      entity_type: 'bank_details',
      entity_id: id,
      new_data: updates,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bank details update error:', error);
    return NextResponse.json(
      { error: 'Failed to update bank details' },
      { status: 500 }
    );
  }
}