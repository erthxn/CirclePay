import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/logger';

export async function GET() {
  return NextResponse.json({ logs: getLogs() });
}
