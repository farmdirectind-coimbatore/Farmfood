export const ADMIN_COOKIE_NAME = 'fd_admin';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getAdminConfig() {
  return {
    username: process.env.ADMIN_USERNAME || 'farmdirect',
    password: process.env.ADMIN_PASSWORD || 'farm@369',
  };
}

function getSecret(): string {
  return process.env.ADMIN_AUTH_SECRET || 'farmdirect-admin-session-secret-v1';
}

function encodeUtf8(input: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(input));
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSha256(payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encodeUtf8(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encodeUtf8(payload));
  return new Uint8Array(signature);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function signAdminSession(username: string): Promise<string> {
  const payload = bytesToBase64Url(
    encodeUtf8(JSON.stringify({ username, exp: Date.now() + SESSION_TTL_MS }))
  );
  const signature = bytesToBase64Url(await hmacSha256(payload));
  return `${payload}.${signature}`;
}

export async function verifyAdminSession(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = await hmacSha256(payload);
  const provided = base64UrlToBytes(signature);

  if (!constantTimeEqual(provided, expected)) return false;

  try {
    const data = JSON.parse(decodeUtf8(base64UrlToBytes(payload)));
    return (
      typeof data === 'object' &&
      data.username === getAdminConfig().username &&
      typeof data.exp === 'number' &&
      data.exp > Date.now()
    );
  } catch {
    return false;
  }
}