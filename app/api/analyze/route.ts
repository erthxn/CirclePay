import { NextRequest, NextResponse } from 'next/server';

const SORSA_BASE = 'https://api.sorsa.io/v3';

export async function POST(req: NextRequest) {
  try {
    const { handle, count = 5, pool = 20 } = await req.json();
    if (!handle) {
      return NextResponse.json({ error: 'Handle required' }, { status: 400 });
    }

    const apiKey = process.env.SORSA_API;
    if (!apiKey) {
      return NextResponse.json({ error: 'SORSA_API not configured' }, { status: 500 });
    }

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Primary: mentions in last 7 days
    const mentionsRes = await fetch(`${SORSA_BASE}/mentions`, {
      method: 'POST',
      headers: {
        ApiKey: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: handle.replace('@', ''),
        order: 'latest',
        since_date: since,
      }),
    });

    if (!mentionsRes.ok) {
      const err = await mentionsRes.text();
      return NextResponse.json(
        { error: 'Sorsa request failed', detail: err },
        { status: mentionsRes.status }
      );
    }

    const data = await mentionsRes.json();
    const tweets = data.tweets || [];

    // Aggregate engagement by username
    const scores: Record<string, { score: number; type: string }> = {};

    for (const t of tweets) {
      const user = t.user?.username;
      if (!user || user.toLowerCase() === handle.toLowerCase()) continue;

      let weight = 1;
      if (t.is_quote_status) weight = 3;
      else if (t.is_reply) weight = 1.5;
      else weight = 2; // plain mention

      const engagement =
        (t.likes_count || 0) * 0.5 +
        (t.reply_count || 0) * 1 +
        (t.quote_count || 0) * 2;

      const add = weight * (1 + Math.log1p(engagement));
      if (!scores[user]) scores[user] = { score: 0, type: t.is_quote_status ? 'Quote' : t.is_reply ? 'Reply' : 'Mention' };
      scores[user].score += add;
    }

    const ranked = Object.entries(scores)
      .map(([h, v]) => ({ handle: h, score: Math.round(v.score), type: v.type }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(25, Number(count) || 5));

    if (ranked.length === 0) {
      return NextResponse.json({
        members: [],
        prompt: '',
        message: 'No recent interactions found',
      });
    }

    const totalScore = ranked.reduce((s, m) => s + m.score, 0) || 1;
    const members = ranked.map((m) => ({
      ...m,
      amount: Number(((m.score / totalScore) * Number(pool)).toFixed(2)),
    }));

    const lines = members.map((m) => `- @${m.handle}: $${m.amount.toFixed(2)}`).join('\n');
    const prompt = `Send rewards via PayBox to these X handles:\n${lines}\n\nTotal: $${Number(pool).toFixed(2)}. Execute the transfers.`;

    return NextResponse.json({ members, prompt, handle, pool });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
