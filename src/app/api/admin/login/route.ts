import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getAdminConfig, signAdminSession } from '@/lib/auth/admin-session';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json().catch(() => ({}));

    const { username: adminUsername, password: adminPassword } = getAdminConfig();

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await signAdminSession(adminUsername);
    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
  }
}