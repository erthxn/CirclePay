import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.X_CLIENT_ID || process.env.CONSUMER_KEY;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET || process.env.CONSUMER_KEY_SECRET;
const REDIRECT_URI = process.env.X_REDIRECT_URI || 'https://circlepay.fun/api/auth/callback';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const errorParam = req.nextUrl.searchParams.get('error');

  const verifier = req.cookies.get('x_verifier')?.value;
  const savedState = req.cookies.get('x_state')?.value;

  // If X sent an error, surface it
  if (errorParam) {
    return NextResponse.redirect(new URL(`/circle?error=${errorParam}`, req.url));
  }

  if (!code || !state || state !== savedState || !verifier) {
    // Clear any leftover cookies
    const fail = NextResponse.redirect(new URL('/circle?error=auth', req.url));
    fail.cookies.delete('x_verifier');
    fail.cookies.delete('x_state');
    return fail;
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
      const txt = await tokenRes.text();
      console.error('Token exchange failed:', txt);
      return NextResponse.redirect(new URL('/circle?error=token', req.url));
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

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

    // Success — set session cookies with SameSite=Lax (normal navigation)
    const res = NextResponse.redirect(new URL('/circle', req.url));

    const sessionOpts = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    };

    res.cookies.set('x_user', username, sessionOpts);
    res.cookies.set('x_access', '1', sessionOpts);

    // Clear temp cookies
    res.cookies.delete('x_verifier');
    res.cookies.delete('x_state');

    return res;
  } catch (e) {
    console.error('OAuth callback error:', e);
    return NextResponse.redirect(new URL('/circle?error=unknown', req.url));
  }
}
