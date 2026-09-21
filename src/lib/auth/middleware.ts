import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/auth/admin-session';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAdminViaCookie = await verifyAdminSession(adminCookie);

  const isAdminLoginPath = path === '/admin/login';
  const isDashboardPath = path === '/dashboard' || path.startsWith('/dashboard/');
  const isAdminPath = path === '/admin' || path.startsWith('/admin/');
  const isWelcomePath = path === '/welcome';
  const hasRedirectParam = !!request.nextUrl.searchParams.get('redirect');

  // Admin login page: serve the form. If a verified admin cookie already
  // exists (and we are not returning from a failed attempt), go straight in.
  if (isAdminLoginPath) {
    if (isAdminViaCookie && !hasRedirectParam) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return supabaseResponse;
  }

  // Resolve role only when a Supabase session exists
  let role: string | null = null;
  if (user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('supabase_id', user.id)
      .single();
    role = userProfile?.role ?? null;
  }

  // ── Admin paths ─────────────────────────────────────────────────
  if (isAdminPath) {
    // A logged-in investor account (explicitly role USER) is NEVER
    // allowed into admin, even if a stale admin cookie exists.
    if (user && role === 'USER') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.delete('redirect');
      return NextResponse.redirect(url);
    }

    // No verified admin cookie → send to password login.
    if (!isAdminViaCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    // Verified admin cookie (and not an explicit investor account) → allow.
    return supabaseResponse;
  }

  // ── Dashboard / welcome paths ──────────────────────────────────
  if (isDashboardPath || isWelcomePath) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}