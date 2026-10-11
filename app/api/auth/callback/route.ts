import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.X_CLIENT_ID || process.env.CONSUMER_KEY;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET || process.env.CONSUMER_KEY_SECRET;
const REDIRECT_URI = process.env.X_REDIRECT_URI || 'https://circlepay.fun/api/auth/callback';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const verifier = req.cookies.get('x_verifier')?.value;
  const savedState = req.cookies.get('x_state')?.value;

  if (!code || !state || state !== savedState || !verifier) {
    return NextResponse.redirect(new URL('/circle?error=auth', req.url));
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/circle?error=config', req.url));
  }

  try {
    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    });

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body,
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/circle?error=token', req.url));
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    // Fetch user
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=username,profile_image_url', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/circle?error=user', req.url));
    }

    const userData = await userRes.json();
    const username = userData.data?.username;

    if (!username) {
      return NextResponse.redirect(new URL('/circle?error=nouser', req.url));
    }

    // Set session cookies
    const res = NextResponse.redirect(new URL('/circle', req.url));
    res.cookies.set('x_user', username, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
    res.cookies.set('x_access', '1', { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
    // Clear temp cookies
    res.cookies.delete('x_verifier');
    res.cookies.delete('x_state');
    return res;
  } catch {
    return NextResponse.redirect(new URL('/circle?error=unknown', req.url));
  }
}
