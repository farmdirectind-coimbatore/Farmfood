import { adminClient } from './admin';
import { env } from '@/lib/env';

const BUCKET_NAME = 'payment-screenshots';

export async function ensureBucketExists() {
  const { data: buckets } = await adminClient.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!exists) {
    await adminClient.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
  }
}

export async function getSignedUploadUrl(
  userId: string,
  fileName: string
): Promise<{ url: string; path: string } | { error: string }> {
  await ensureBucketExists();
  
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${userId}/${timestamp}_${sanitizedFileName}`;

  const { data, error } = await adminClient.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(path);

  if (error) {
    return { error: error.message };
  }

  return { url: data.signedUrl, path };
}

export async function getSignedDownloadUrl(path: string): Promise<string | null> {
  const { data, error } = await adminClient.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 3600); // 1 hour

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await adminClient.storage
    .from(BUCKET_NAME)
    .remove([path]);

  return !error;
}

export function getPublicUrl(path: string): string {
  const { data } = adminClient.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}