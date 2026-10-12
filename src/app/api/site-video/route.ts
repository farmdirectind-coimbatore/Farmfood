import { NextResponse } from 'next/server';
import { getSiteVideoSetting, siteVideoPublicUrl } from '@/lib/supabase/site-video';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await getSiteVideoSetting();

    if (!setting) {
      return NextResponse.json({ url: null, updatedAt: null });
    }

    const base = siteVideoPublicUrl(setting.path);
    const url = `${base}?v=${encodeURIComponent(setting.updatedAt)}`;

    return NextResponse.json({ url, updatedAt: setting.updatedAt });
  } catch (error) {
    console.error('Site video fetch error:', error);
    return NextResponse.json({ url: null, updatedAt: null });
  }
}
