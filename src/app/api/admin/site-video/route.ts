import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import {
  SITE_VIDEO_KEY,
  SITE_VIDEO_FOLDER,
  deleteSiteVideoFile,
  getSiteVideoSetting,
  siteVideoPublicUrl,
} from '@/lib/supabase/site-video';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await getSiteVideoSetting();
    if (!setting) {
      return NextResponse.json({ url: null, path: null, updatedAt: null });
    }

    const base = siteVideoPublicUrl(setting.path);
    return NextResponse.json({
      url: `${base}?v=${encodeURIComponent(setting.updatedAt)}`,
      path: setting.path,
      updatedAt: setting.updatedAt,
    });
  } catch (error) {
    console.error('Admin site video fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { path } = body as { path?: string };

    if (!path || !path.startsWith(`${SITE_VIDEO_FOLDER}/`)) {
      return NextResponse.json({ error: 'Invalid upload path' }, { status: 400 });
    }

    const previous = await getSiteVideoSetting();
    if (previous && previous.path !== path) {
      await deleteSiteVideoFile(previous.path);
    }

    const { error } = await adminClient.from('site_settings').upsert(
      {
        key: SITE_VIDEO_KEY,
        value: path,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) throw error;

    await adminClient.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'update_site_video',
      entity_type: 'site_settings',
      entity_id: SITE_VIDEO_KEY,
      new_data: { path },
    });

    return NextResponse.json({
      url: `${siteVideoPublicUrl(path)}?v=${Date.now()}`,
      path,
    });
  } catch (error) {
    console.error('Admin site video update error:', error);
    return NextResponse.json({ error: 'Failed to save video' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await getSiteVideoSetting();

    if (setting) {
      await deleteSiteVideoFile(setting.path);
    }

    const { error } = await adminClient
      .from('site_settings')
      .delete()
      .eq('key', SITE_VIDEO_KEY);

    if (error) throw error;

    await adminClient.from('audit_logs').insert({
      admin_id: admin.id,
      action: 'delete_site_video',
      entity_type: 'site_settings',
      entity_id: SITE_VIDEO_KEY,
      old_data: setting ? { path: setting.path } : null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin site video delete error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
