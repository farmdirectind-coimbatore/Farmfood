export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://farmdirect.co.in',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'noreply@fairfoodcbe.in',
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || 'farmdirect.ind@gmail.com',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'farmdirect',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'farm@369',
  ADMIN_AUTH_SECRET: process.env.ADMIN_AUTH_SECRET || 'farmdirect-admin-session-secret-v1',
} as const;

export function validateEnv() {
  // Server-only secrets (SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY) are never
  // available in browser bundles, and dynamic process.env access is not inlined,
  // so validation must be skipped on the client.
  if (typeof window !== 'undefined') return;

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();