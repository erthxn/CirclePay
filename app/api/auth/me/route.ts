import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const user = req.cookies.get('x_user')?.value;
  const access = req.cookies.get('x_access')?.value === '1';
  return NextResponse.json({ user: user || null, access });
}
