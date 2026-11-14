import { renderLegacyCard } from './legacy/legacy-card.js';

const $ = (s, r = document) => r.querySelector(s);
const params = new URLSearchParams(location.search);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const freezeParam = params.get('freeze');
const freezeAt = freezeParam !== null && freezeParam !== '' ? Number(freezeParam) : null;

/* ---------- deep links ---------- */
const SPEC_URL = 'https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.md';
const promptFor = (handle) =>
  'Use CirclePay to find who showed up for ' + (handle ? '@' + handle : 'an X handle') + ' in the last 7 days (replies, quotes and reposts of their posts) and make a CirclePay circle card. ' +
  (handle ? 'The X handle is @' + handle + '. ' : 'Ask me for the X handle first. ') +
  'Show the result first and keep the chat short. ' +
  'Render the CirclePay Arc card exactly as described in ' + SPEC_URL + '. ' +
  'Do not pay anyone. Only offer an optional PayBox payout afterwards, and wait for my clear yes before anything is sent.';
const BASES = { 'link-grok': 'https://grok.com/?q=', 'link-chatgpt': 'https://chatgpt.com/?q=', 'link-claude': 'https://claude.ai/new?q=' };
let PROMPT = promptFor('');
const LINKS = {};
function applyPrompt(handle) {
  PROMPT = promptFor(handle);
  const enc = encodeURIComponent(PROMPT);
  Object.entries(BASES).forEach(([id, base]) => { LINKS[id] = base + enc; const a = document.getElementById(id); if (a) a.href = LINKS[id]; });
  $('#prompt-text').textContent = PROMPT;
  window.__circlepay = { PROMPT, LINKS };
}
applyPrompt('');

const copyBtn = $('#copy-prompt');
const status = $('#copy-status');
copyBtn.addEventListener('click', async () => {
  let ok = false;
  try { await navigator.clipboard.writeText(PROMPT); ok = true; }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = PROMPT; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove();
  }
  status.textContent = ok ? 'Prompt copied. Paste it into the CirclePay Grok Bot template.' : 'Copy failed. Open "See the prompt" below and copy it by hand.';
  copyBtn.classList.toggle('copied', ok);
  if (ok) setTimeout(() => copyBtn.classList.remove('copied'), 2200);
});

/* options card: close X collapses it, the pill brings it back */
const optsBody = $('#opts-body'), optsClose = $('#opts-close'), optsOpen = $('#opts-open');
function setOpts(open) {
  optsBody.hidden = !open; optsOpen.hidden = open; optsClose.hidden = !open;
  optsClose.setAttribute('aria-expanded', String(open));
}
optsClose.addEventListener('click', () => setOpts(false));
optsOpen.addEventListener('click', () => setOpts(true));

/* ---------- counters ---------- */
function ease(x) { return 1 - Math.pow(1 - x, 3); }
const counters = document.querySelectorAll('[data-count]');
counters.forEach((el) => { el.dataset.to = el.dataset.count; });
function runCounter(el) {
  const to = Number(el.dataset.to), from = el.dataset.from !== undefined ? Number(el.dataset.from) : 0;
  if (reduce) { el.textContent = to; return; }
  const t0 = performance.now(), dur = 1300;
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(from + (to - from) * ease(p));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { runCounter(e.target); io.unobserve(e.target); } }), { threshold: 0.6 });
counters.forEach((el) => io.observe(el));
if (freezeAt !== null) counters.forEach((el) => { el.textContent = el.dataset.to; });

/* ---------- typing demo ---------- */
(function typer() {
  const el = $('#typer-text'); if (!el) return;
  const words = ['yourhandle', '@yourhandle'];
  if (reduce || freezeAt !== null) { el.textContent = '@yourhandle'; return; }
  let w = 0, i = 0, dir = 1;
  (function loop() {
    const word = words[w];
    i += dir; el.textContent = word.slice(0, i);
    let d = dir > 0 ? 95 : 45;
    if (dir > 0 && i === word.length) { dir = -1; d = 1500; }
    else if (dir < 0 && i === 0) { dir = 1; w = (w + 1) % words.length; d = 350; }
    setTimeout(loop, d);
  })();
})();

/* ---------- data + studio ---------- */
async function boot() {
  const [tokens, bgData, connData] = await Promise.all([
    fetch('/spec/arc-card.json').then((r) => r.json()),
    fetch('/data/bg_cards.json').then((r) => r.json()),
    fetch('/data/connectors.json').then((r) => r.json()),
  ]);
  const arc = window.ArcCard.create(tokens);
  window.__arc = arc;
  const arcOpts = (n, prefix) => ({ handle: 'yourhandle', date: '14/11/26', members: arc.sampleMembers(n), idPrefix: prefix, freezeAt: freezeAt !== null ? freezeAt : undefined });

  /* hero card: always Arc, never touched by the pickers */
  const heroOpts = (handle) => ({ handle: handle || 'yourhandle', date: '14/11/26', members: arc.sampleMembers(5), idPrefix: 'hero', freezeAt: freezeAt !== null ? freezeAt : undefined });
  window.__heroApi = arc.mount($('#hero-card'), heroOpts(''));
  $('#composer').addEventListener('submit', (e) => {
    e.preventDefault();
    const h = $('#handle-input').value.trim().replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 15).toLowerCase();
    const note = $('#composer-note');
    if (!h) { note.textContent = 'Type an X handle first. Preview only, nothing is sent from this page.'; return; }
    if (window.__heroApi) window.__heroApi.destroy();
    window.__heroApi = arc.mount($('#hero-card'), heroOpts(h));
    $('#me-bubble').textContent = '@' + h;
    applyPrompt(h);
    note.textContent = 'Preview updated for @' + h + '. The links and the prompt now include your handle. Nothing is sent from this page.';
  });

  const bgs = bgData.cards, conns = connData.connectors;
  const ARC_ID = 'curve-001';
  const state = {
    style: conns.some((c) => c.id === params.get('style')) ? params.get('style') : ARC_ID,
    bg: bgs.some((b) => b.id === params.get('theme')) ? params.get('theme') : bgs[0].id,
    n: [3, 5, 7, 10, 12, 15].includes(Number(params.get('n'))) ? Number(params.get('n')) : 5,
    mark: ['paybox', 'migma', 'solana', 'none'].includes(params.get('mark')) ? params.get('mark') : 'paybox',
    cat: 'All',
  };
  const stage = $('#studio-stage');
  let arcApi = null, arcKey = '';

  function legacyN(n) { return n <= 5 ? 5 : n <= 7 ? 7 : 10; }

  function render() {
    const arcMode = state.style === ARC_ID;
    stage.dataset.mode = arcMode ? 'arc' : 'legacy';
    $('#studio-caption').textContent = arcMode
      ? 'Arc: fixed yellow on black, no matter which theme is selected. Placeholder handles, nothing real or paid.'
      : 'Legacy style on the selected theme. Placeholder handles, nothing real or paid.';
    $('#mark-ctl').hidden = arcMode;
    $('#theme-note').textContent = arcMode
      ? 'Arc keeps its own yellow-on-black look. Themes colour Spiral, Solid and the other line styles.'
      : 'This theme is applied to the selected line style.';
    document.querySelectorAll('#seg-n button').forEach((b) => {
      const v = Number(b.dataset.n); b.classList.toggle('on', v === (arcMode ? state.n : legacyN(state.n)));
      b.disabled = !arcMode && ![5, 7, 10].includes(v);
    });
    if (arcMode) {
      const key = String(state.n);
      if (!arcApi || arcKey !== key || !stage.querySelector('[data-arc-card]')) {
        if (arcApi) arcApi.destroy();
        stage.innerHTML = '';
        arcApi = arc.mount(stage, arcOpts(state.n, 'studio'));
        arcKey = key;
      }
    } else {
      if (arcApi) { arcApi.destroy(); arcApi = null; arcKey = ''; }
      renderLegacyCard(stage, {
        bg: bgs.find((b) => b.id === state.bg),
        connector: conns.find((c) => c.id === state.style),
        mark: state.mark, memberCount: legacyN(state.n),
      });
    }
    document.querySelectorAll('#seg-style button').forEach((b) => b.classList.toggle('on', b.dataset.style === state.style));
    $('#sel-style').value = state.style;
    document.querySelectorAll('#theme-grid button').forEach((b) => { const on = b.dataset.id === state.bg; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    $('#theme-name').textContent = '· ' + bgs.find((b) => b.id === state.bg).name;
    document.querySelectorAll('#seg-mark button').forEach((b) => b.classList.toggle('on', b.dataset.mark === state.mark));
  }

  /* line style select */
  const sel = $('#sel-style');
  const cats = [...new Set(conns.map((c) => c.category))];
  cats.forEach((cat) => {
    const g = document.createElement('optgroup'); g.label = cat;
    conns.filter((c) => c.category === cat).forEach((c) => {
      const o = document.createElement('option'); o.value = c.id; o.textContent = c.id === ARC_ID ? 'Arc (payment flow)' : c.name; g.appendChild(o);
    });
    sel.appendChild(g);
  });
  sel.addEventListener('change', () => { state.style = sel.value; render(); });
  document.querySelectorAll('#seg-style button').forEach((b) => b.addEventListener('click', () => { state.style = b.dataset.style; render(); }));

  /* theme grid + categories */
  const grid = $('#theme-grid'), catBox = $('#theme-cats');
  bgs.forEach((b) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'sw'; btn.dataset.id = b.id; btn.dataset.cat = b.category;
    btn.style.background = b.gradient_css; btn.title = b.name; btn.setAttribute('aria-label', b.name); btn.setAttribute('role', 'option');
    btn.addEventListener('click', () => { state.bg = b.id; render(); });
    grid.appendChild(btn);
  });
  ['All', ...bgData.categories].forEach((c) => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'chip' + (c === 'All' ? ' on' : ''); btn.textContent = c;
    btn.addEventListener('click', () => {
      state.cat = c; catBox.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === btn));
      grid.querySelectorAll('.sw').forEach((s) => { s.hidden = c !== 'All' && s.dataset.cat !== c; });
    });
    catBox.appendChild(btn);
  });

  /* people + mark */
  const segN = $('#seg-n');
  [3, 5, 7, 10, 12, 15].forEach((v) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.n = v; b.textContent = v;
    b.addEventListener('click', () => { state.n = v; render(); });
    segN.appendChild(b);
  });
  document.querySelectorAll('#seg-mark button').forEach((b) => b.addEventListener('click', () => { state.mark = b.dataset.mark; render(); }));

  window.__studio = { state, render };
  render();
  document.documentElement.dataset.ready = '1';
}
boot().catch((e) => { console.error(e); document.documentElement.dataset.ready = 'error'; });
