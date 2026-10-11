import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLIENT_ID = process.env.X_CLIENT_ID || process.env.CONSUMER_KEY;
const REDIRECT_URI = process.env.X_REDIRECT_URI || 'https://circlepay.fun/api/auth/callback';

function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export async function GET(req: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json({ error: 'X_CLIENT_ID not set' }, { status: 500 });
  }

  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(verifier));
  const state = base64URLEncode(crypto.randomBytes(16));

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'tweet.read users.read offline.access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const url = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

  const res = NextResponse.redirect(url);
  // Store verifier + state in short-lived cookies
  res.cookies.set('x_verifier', verifier, { httpOnly: true, secure: true, maxAge: 600, path: '/' });
  res.cookies.set('x_state', state, { httpOnly: true, secure: true, maxAge: 600, path: '/' });
  return res;
}
