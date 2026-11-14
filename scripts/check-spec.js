#!/usr/bin/env node
/* Sanity checks: node scripts/check-spec.js
 * - every n in 3..15 lays out with no overlaps, nothing outside the stage, nothing under the brand mark, no arc through another person
 * - the static SVG is deterministic and has the right handle/date/total */
const fs = require('fs');
const path = require('path');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'spec', 'arc-card.json'), 'utf8'));
const arc = require('../src/arc-card.js').create(T);
const W = T.canvas.width, STAGE = T.canvas.stageHeight, M = T.mark.layoutBox, P = T.pill;
const bez = (c, k, p, t) => ({ x: (1 - t) * (1 - t) * c.x + 2 * t * (1 - t) * k.x + t * t * p.x, y: (1 - t) * (1 - t) * c.y + 2 * t * (1 - t) * k.y + t * t * p.y });
const hit = (a, b, pad) => !(a.x1 + pad <= b.x0 || b.x1 + pad <= a.x0 || a.y1 + pad <= b.y0 || b.y1 + pad <= a.y0);
let bad = 0;
for (let n = T.members.min; n <= T.members.max; n++) {
  const L = arc.layout(n), out = [];
  const boxes = L.items.map((it) => ({ i: it.i, x0: it.x - it.pw / 2, x1: it.x + it.pw / 2, y0: it.y - it.tile / 2, y1: it.y + it.tile / 2 + P.gapBelowTile + P.height }));
  boxes.forEach((b) => {
    if (b.x0 < 2 || b.y0 < 2 || b.x1 > W - 2 || b.y1 > STAGE - 2) out.push('outside stage ' + b.i);
    if (hit(b, M, 0)) out.push('under mark ' + b.i);
    const cr = L.centerSize / 2 + 2;
    if (b.x1 > L.center.x - cr && b.x0 < L.center.x + cr && b.y1 > L.center.y - cr && b.y0 < L.center.y + cr) out.push('touches owner ' + b.i);
  });
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (hit(boxes[i], boxes[j], 1.5)) out.push('overlap ' + i + '/' + j);
  L.items.forEach((it) => {
    const p = { x: it.x, y: it.y }, k = { x: (L.center.x + p.x) / 2 + Math.cos(it.a + Math.PI / 2) * L.arcOff, y: (L.center.y + p.y) / 2 + Math.sin(it.a + Math.PI / 2) * L.arcOff };
    for (let t = 0.08; t < 0.92; t += 0.02) {
      const q = bez(L.center, k, p, t);
      boxes.forEach((b) => { if (b.i !== it.i && q.x > b.x0 - 1 && q.x < b.x1 + 1 && q.y > b.y0 - 1 && q.y < b.y1 + 1 && !out.includes('arc ' + it.i + ' through ' + b.i)) out.push('arc ' + it.i + ' through ' + b.i); });
    }
  });
  console.log('n=' + n, out.length ? 'ISSUES: ' + out.join('; ') : 'ok');
  bad += out.length;
}
const a = arc.svg({ handle: '@YourHandle', date: '14/11/26', members: arc.sampleMembers(5) });
const b = arc.svg({ handle: 'yourhandle', date: '14/11/26', members: arc.sampleMembers(5) });
if (a !== b) { console.log('NOT deterministic / handle not normalized'); bad++; }
if (!a.includes('@yourhandle') || !a.includes('14/11/26') || !a.includes('$20.00')) { console.log('missing handle/date/total'); bad++; }
console.log(bad ? 'FAILED' : 'all checks passed');
process.exit(bad ? 1 : 0);
