import { readFileSync } from 'fs';
import { join } from 'path';

// Serves the canonical file straight from the repo so the site can never drift from it.
export const dynamic = 'force-static';

export function GET() {
  const body = readFileSync(join(process.cwd(), 'spec/arc-card.md'), 'utf8');
  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}
