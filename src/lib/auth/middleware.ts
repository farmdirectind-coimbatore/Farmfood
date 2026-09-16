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

  // Public paths that don't require auth
  const publicPaths = ['/', '/how-it-works', '/terms', '/privacy', '/risk-disclosure', '/contact', '/login', '/api', '/admin/login'];
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p + '/'));
  const isAdminLoginPath = path === '/admin/login';

  // Dashboard paths (require USER role)
  const dashboardPaths = ['/dashboard'];
  const isDashboardPath = dashboardPaths.some(p => path === p || path.startsWith(p + '/'));

  // Admin paths (require ADMIN role)
  const adminPaths = ['/admin'];
  const isAdminPath = adminPaths.some(p => path === p || path.startsWith(p + '/'));

  // Welcome path (requires auth, any role)
  const isWelcomePath = path === '/welcome';

  // Admin login page: always reachable, redirect into /admin once an admin session exists
  if (isAdminLoginPath) {
    if (isAdminViaCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return supabaseResponse;
  }

  // Verified admin cookie grants access to all admin paths
  if (isAdminPath && isAdminViaCookie) {
    return supabaseResponse;
  }

  if (!user) {
    if (isDashboardPath || isAdminPath || isWelcomePath) {
      const url = request.nextUrl.clone();
      url.pathname = isAdminPath ? '/admin/login' : '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Check user role for protected routes
  if (isDashboardPath || isAdminPath) {
    // We need to check the role from our users table
    // For middleware, we'll do a quick check
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('supabase_id', user.id)
      .single();

    const role = userProfile?.role || 'USER';

    if (isAdminPath && role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (isDashboardPath && role === 'ADMIN') {
      // Allow admins to access dashboard too
    }
  }

  return supabaseResponse;
}