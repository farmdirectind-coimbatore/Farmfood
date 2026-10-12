import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import {
  createSiteVideoUploadUrl,
  SITE_VIDEO_MAX_BYTES,
  SITE_VIDEO_TYPES,
} from '@/lib/supabase/site-video';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { fileName, fileSize, fileType } = body as {
      fileName?: string;
      fileSize?: number;
      fileType?: string;
    };

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing file information' }, { status: 400 });
    }

    if (!SITE_VIDEO_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'Only MP4 and WebM videos are allowed' },
        { status: 400 }
      );
    }

    if (typeof fileSize === 'number' && fileSize > SITE_VIDEO_MAX_BYTES) {
      return NextResponse.json(
        { error: 'Video must be 20 MB or smaller' },
        { status: 400 }
      );
    }

    const result = await createSiteVideoUploadUrl(fileName);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Site video sign error:', error);
    return NextResponse.json({ error: 'Failed to prepare upload' }, { status: 500 });
  }
}
