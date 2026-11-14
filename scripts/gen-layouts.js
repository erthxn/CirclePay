#!/usr/bin/env node
/* Regenerates twoRing.layouts (n = 11..15) in spec/arc-card.json.
 * The search is the deterministic one described in spec/arc-card.md ("Two rings"). Run: node scripts/gen-layouts.js */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'spec', 'arc-card.json');
const T = JSON.parse(fs.readFileSync(file, 'utf8'));
const TW = T.twoRing, W = T.canvas.width, STAGE = T.canvas.stageHeight, C0 = T.center.x, deg = Math.PI / 180;
const pillW = (tile) => Math.max(tile + 8, 48);
const PILL_H = T.pill.height, GAP = T.pill.gapBelowTile, MARK = T.mark.layoutBox;
const bez = (c, k, p, t) => ({ x: (1 - t) * (1 - t) * c.x + 2 * t * (1 - t) * k.x + t * t * p.x, y: (1 - t) * (1 - t) * c.y + 2 * t * (1 - t) * k.y + t * t * p.y });
const ctrlFor = (c, p, a, off) => ({ x: (c.x + p.x) / 2 + Math.cos(a + Math.PI / 2) * off, y: (c.y + p.y) / 2 + Math.sin(a + Math.PI / 2) * off });

function prep(L) { L.forEach((it) => { it.pw = pillW(it.tile); it.box = { x0: it.x - it.pw / 2, x1: it.x + it.pw / 2, y0: it.y - it.tile / 2, y1: it.y + it.tile / 2 + GAP + PILL_H }; }); }
const hit = (a, b, pad) => !(a.x1 + pad <= b.x0 || b.x1 + pad <= a.x0 || a.y1 + pad <= b.y0 || b.y1 + pad <= a.y0);
function check(L, C, centerSize, arcOff) {
  const out = [];
  L.forEach((a) => {
    const b = a.box;
    if (b.x0 < 2 || b.y0 < 2 || b.x1 > W - 2 || b.y1 > STAGE - 2) out.push('out of stage ' + a.i);
    if (hit(b, { x0: MARK.x0, y0: MARK.y0, x1: MARK.x1, y1: MARK.y1 }, 0)) out.push('overlaps mark ' + a.i);
    const cr = centerSize / 2 + 2;
    if (b.x1 > C.x - cr && b.x0 < C.x + cr && b.y1 > C.y - cr && b.y0 < C.y + cr) out.push('overlaps owner ' + a.i);
  });
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) if (hit(L[i].box, L[j].box, 1.5)) out.push('overlap ' + i + '/' + j);
  L.forEach((it) => {
    const P = { x: it.x, y: it.y }, k = ctrlFor(C, P, it.a, arcOff);
    for (let t = 0.08; t < 0.92; t += 0.02) {
      const q = bez(C, k, P, t);
      L.forEach((o) => { if (o === it) return; const b = o.box; if (q.x > b.x0 - 1 && q.x < b.x1 + 1 && q.y > b.y0 - 1 && q.y < b.y1 + 1) { const s = 'arc ' + it.i + ' crosses ' + o.i; if (!out.includes(s)) out.push(s); } });
    }
  });
  return out;
}

function solveLayout(n) {
  const cy = TW.center.y, C = { x: C0, y: cy }, centerSize = TW.centerSize, Rout = TW.outerRadius, tOut = TW.outerTile;
  const k = Math.ceil(n / 3), m = n - k, step = 2 * Math.PI / k;
  const cnt = new Array(k).fill(Math.floor(m / k));
  const rem = m - cnt.reduce((s, x) => s + x, 0);
  for (let r = 0; r < rem; r++) cnt[Math.floor((r + 0.5) * k / rem) % k]++;
  let arcOff = TW.arcOffsetDefault;
  const solve = (target, Rin) => {
    let a = target;
    for (let it = 0; it < 8; it++) {
      const P = { x: C0 + Math.cos(a) * Rout, y: cy + Math.sin(a) * Rout }, ct = ctrlFor(C, P, a, arcOff);
      let best = 0, bd = 1e9;
      for (let t = 0; t <= 1; t += 0.01) { const q = bez(C, ct, P, t), d = Math.abs(Math.hypot(q.x - C0, q.y - cy) - Rin); if (d < bd) { bd = d; best = t; } }
      const q = bez(C, ct, P, best); let diff = target - Math.atan2(q.y - cy, q.x - C0); diff = Math.atan2(Math.sin(diff), Math.cos(diff)); a += diff;
    }
    return a;
  };
  const build = (phi, Rin, spMax, tIn) => {
    const L = [];
    for (let j = 0; j < k; j++) { const a = -Math.PI / 2 + phi + j * step; L.push({ i: j, a, x: C0 + Math.cos(a) * Rin, y: cy + Math.sin(a) * Rin, tile: tIn }); }
    let idx = k;
    for (let g = 0; g < k; g++) {
      const c = cnt[g], centre = -Math.PI / 2 + phi + (g + 0.5) * step, sp = c > 1 ? spMax : 0;
      for (let j = 0; j < c; j++) { const a = solve(centre + (j - (c - 1) / 2) * sp, Rin); L.push({ i: idx++, a, x: C0 + Math.cos(a) * Rout, y: cy + Math.sin(a) * Rout, tile: tOut }); }
    }
    return L;
  };
  let bestL = null, bestScore = 1e9, bestOff = TW.arcOffsetDefault, bestIssues = [];
  for (const ao of TW.arcOffsetCandidates) for (const tIn of TW.innerTileCandidates) for (const Rin of TW.innerRadiusCandidates) for (const spDeg of TW.outerSpreadDegCandidates) for (let s = -15; s <= 15; s++) {
    const ph = s / 30; arcOff = ao;
    const spMax = spDeg * deg, L = build(ph * step, Rin, spMax, tIn); prep(L);
    const issues = check(L, C, centerSize, ao);
    const sc = issues.length * 100 + (34 - tIn) * 2 + Math.abs(ao - 15) * 0.2 + Math.abs(ph) * 10 + Math.abs(Rin - 84) * 0.05 + Math.abs(spMax - 24 * deg);
    if (sc < bestScore) { bestScore = sc; bestL = L; bestOff = ao; bestIssues = issues; }
  }
  return {
    cy, center: centerSize, arcOff: bestOff, issues: bestIssues,
    items: bestL.map((it) => ({ i: it.i, a: +it.a.toFixed(5), x: +it.x.toFixed(2), y: +it.y.toFixed(2), tile: it.tile })),
  };
}

const layouts = {};
for (let n = T.oneRing.maxMembers + 1; n <= T.members.max; n++) {
  const r = solveLayout(n);
  console.log('n=' + n, 'arcOff=' + r.arcOff, 'issues=' + r.issues.length, r.issues.join('; '));
  delete r.issues;
  layouts[String(n)] = r;
}
T.twoRing.layouts = layouts;
fs.writeFileSync(file, JSON.stringify(T, null, 2) + '\n');
console.log('wrote', file);
