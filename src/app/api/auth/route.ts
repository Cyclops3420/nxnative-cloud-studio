import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correctPassword = process.env.SITE_PASSWORD || 'darkside3210';

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('nx_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }

    return NextResponse.json({ error: 'Incorrect access password' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('nx_auth');
  return NextResponse.json({ authenticated: cookie?.value === 'authenticated' });
}
