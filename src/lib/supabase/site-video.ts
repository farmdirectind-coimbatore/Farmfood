import { adminClient } from './admin';

export const SITE_VIDEO_BUCKET = 'site-videos';
export const SITE_VIDEO_KEY = 'home_promo_video';
export const SITE_VIDEO_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
export const SITE_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const SITE_VIDEO_FOLDER = 'promo';

export interface SiteVideoSetting {
  path: string;
  updatedAt: string;
}

export async function ensureSiteVideoBucket(): Promise<void> {
  const { data: buckets } = await adminClient.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === SITE_VIDEO_BUCKET);

  if (!exists) {
    await adminClient.storage.createBucket(SITE_VIDEO_BUCKET, {
      public: true,
      fileSizeLimit: SITE_VIDEO_MAX_BYTES,
      allowedMimeTypes: SITE_VIDEO_TYPES,
    });
  }
}

export async function getSiteVideoSetting(): Promise<SiteVideoSetting | null> {
  const { data, error } = await adminClient
    .from('site_settings')
    .select('value, updated_at')
    .eq('key', SITE_VIDEO_KEY)
    .maybeSingle();

  if (error || !data?.value) return null;
  return { path: data.value, updatedAt: data.updated_at };
}

export function siteVideoPublicUrl(path: string): string {
  const { data } = adminClient.storage.from(SITE_VIDEO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function buildSiteVideoFilePath(fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${SITE_VIDEO_FOLDER}/${Date.now()}_${sanitized}`;
}

export async function createSiteVideoUploadUrl(
  fileName: string
): Promise<{ url: string; path: string } | { error: string }> {
  await ensureSiteVideoBucket();

  const path = buildSiteVideoFilePath(fileName);
  const { data, error } = await adminClient.storage
    .from(SITE_VIDEO_BUCKET)
    .createSignedUploadUrl(path);

  if (error) return { error: error.message };
  return { url: data.signedUrl, path };
}

export async function deleteSiteVideoFile(path: string): Promise<boolean> {
  const { error } = await adminClient.storage.from(SITE_VIDEO_BUCKET).remove([path]);
  return !error;
}
