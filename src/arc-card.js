/*!
 * CirclePay Arc card reference renderer (MIT).
 * Built entirely from spec/arc-card.json (tokens) and described in spec/arc-card.md.
 * Pure functions of (tokens, options, time t). Works in browsers and in Node (string output).
 *
 *   const arc = ArcCard.create(tokens);
 *   arc.svg({ handle: 'yourhandle', date: '14/11/26', members: arc.sampleMembers(5) })           // static final frame, SVG string
 *   arc.svg({ ... }, 3.2)                                                                       // any frame t (seconds)
 *   arc.mount(element, { ... })                                                                 // animated, returns { play, pause, seek, destroy }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ArcCard = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PI = Math.PI;
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function r2(v) { return (Math.round(v * 100) / 100).toString(); }
  function r1(v) { return (Math.round(v * 10) / 10).toString(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function easeOutCubic(x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); }
  function easeOutBack(x) { x = clamp(x, 0, 1); var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function bez(c, k, p, t) {
    var u = 1 - t;
    return { x: u * u * c.x + 2 * t * u * k.x + t * t * p.x, y: u * u * c.y + 2 * t * u * k.y + t * t * p.y };
  }
  function ctrlFor(c, p, a, off) {
    return { x: (c.x + p.x) / 2 + Math.cos(a + PI / 2) * off, y: (c.y + p.y) / 2 + Math.sin(a + PI / 2) * off };
  }

  function create(T) {
    var W = T.canvas.width, H = T.canvas.height, STAGE = T.canvas.stageHeight;
    var TH = T.themes[T.themes.default];
    var F = T.fonts;

    function pillW(tile) { return Math.max(tile + 8, 48); }
    function byTile(tile, obj, keyHi, keyMid, keyLo) {
      return tile >= 44 ? obj[keyHi] : tile >= 36 ? obj[keyMid] : obj[keyLo];
    }

    /* ---------- layout ---------- */
    function layout(n) {
      n = clamp(Math.round(n), T.members.min, T.members.max);
      var C0 = T.center, items = [], cy = C0.y, centerSize, arcOff = T.arc.offsetOneRing, strokeW = T.arc.strokeWidthOneRing;
      if (n <= T.oneRing.maxMembers) {
        var band = T.oneRing.bands.filter(function (b) { return n <= b.maxN; })[0];
        var R = band.radiusPct * W / 100;
        centerSize = band.center;
        for (var i = 0; i < n; i++) {
          var a = (i / n) * PI * 2 - PI / 2;
          items.push({ i: i, a: a, x: C0.x + Math.cos(a) * R, y: C0.y + Math.sin(a) * R, tile: band.tile });
        }
      } else {
        var L = T.twoRing.layouts[String(n)];
        cy = L.cy; centerSize = L.center; arcOff = L.arcOff; strokeW = T.arc.strokeWidthTwoRing;
        items = L.items.map(function (it) { return { i: it.i, a: it.a, x: it.x, y: it.y, tile: it.tile }; });
      }
      items.forEach(function (it) { it.pw = pillW(it.tile); });
      return { n: n, items: items, center: { x: C0.x, y: cy }, centerSize: centerSize, arcOff: arcOff, strokeW: strokeW };
    }

    /* ---------- sample data ---------- */
    function sampleMembers(n) {
      n = clamp(Math.round(n), T.members.min, T.members.max);
      var w = [], sum = 0, i;
      for (i = 0; i < n; i++) { w.push(n - i + 2); sum += n - i + 2; }
      var cents = w.map(function (x) { return Math.floor(T.sample.totalCents * x / sum); });
      var left = T.sample.totalCents - cents.reduce(function (s, x) { return s + x; }, 0);
      for (i = 0; left > 0; i = (i + 1) % n, left--) cents[i] += 1;
      return cents.map(function (c, i) { return { handle: 'friend' + (i + 1), amount: c / 100 }; });
    }

    /* ---------- timeline ---------- */
    function times(n) {
      var tl = T.timeline, step = Math.min(0.34, 3.4 / n), out = [];
      for (var i = 0; i < n; i++) {
        var launch = tl.firstLaunch + i * step, land = launch + tl.flight;
        out.push({ launch: launch, land: land });
      }
      return out;
    }

    /* ---------- static pieces ---------- */
    function fontAttr(size, weight, fill, extra) {
      return ' font-family="' + F.sans + '" font-size="' + size + '" font-weight="' + weight + '" fill="' + fill + '" style="font-variant-numeric:tabular-nums"' + (extra || '');
    }

    function backdrop(L) {
      var s = '<rect width="' + W + '" height="' + H + '" fill="' + TH.background + '"/>';
      s += '<circle cx="' + L.center.x + '" cy="' + L.center.y + '" r="260" fill="url(#__P__-bg)"/>';
      T.rings.radii.forEach(function (r) {
        s += '<circle cx="' + L.center.x + '" cy="' + L.center.y + '" r="' + r + '" fill="none" stroke="' + TH.ringLine + '" stroke-width="' + T.rings.strokeWidth + '"/>';
      });
      s += '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="' + (T.canvas.cornerRadius - 0.5) + '" fill="none" stroke="' + TH.line + '"/>';
      return s;
    }

    function markGlyph(cx, cy, width, fill) {
      var M = T.mark, vb = M.viewBox.split(' ').map(Number), h = width * vb[3] / vb[2];
      var paths = M.paths.map(function (d) { return '<path d="' + d + '"/>'; }).join('');
      return '<svg x="' + r2(cx - width / 2) + '" y="' + r2(cy - h / 2) + '" width="' + width + '" height="' + r2(h) + '" viewBox="' + M.viewBox + '" fill="' + fill + '">' + paths + '</svg>';
    }

    function headerSvg() {
      var M = T.mark;
      return '<circle cx="' + M.badgeCenter[0] + '" cy="' + M.badgeCenter[1] + '" r="' + M.badgeRadius + '" fill="' + TH.yellow + '"/>' +
        markGlyph(M.badgeCenter[0], M.badgeCenter[1], M.markWidth, TH.ink) +
        '<text x="' + M.title.x + '" y="' + M.title.y + '"' + fontAttr(M.title.size, M.title.weight, TH.text) + '>' + M.title.text + '</text>' +
        '<text x="' + M.status.x + '" y="' + M.status.y + '"' + fontAttr(M.status.size, M.status.weight, TH.muted) + '>' + M.status.text + '</text>';
    }

    function avatarSvg(id, x, y, size, img) {
      var A = T.avatar, r = size / 2, s = '';
      s += '<clipPath id="' + id + '"><circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r) + '"/></clipPath>';
      s += '<circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r) + '" fill="' + TH[A.fill] + '"/>';
      if (img) {
        s += '<image href="' + esc(img) + '" x="' + r2(x - r) + '" y="' + r2(y - r) + '" width="' + r2(size) + '" height="' + r2(size) + '" preserveAspectRatio="' + A.imageFit + '" clip-path="url(#' + id + ')"/>';
      } else {
        s += '<g clip-path="url(#' + id + ')" fill="' + TH.yellow + '" fill-opacity="0.85">' +
          '<circle cx="' + r2(x) + '" cy="' + r2(y - 0.10 * size) + '" r="' + r2(0.17 * size) + '"/>' +
          '<ellipse cx="' + r2(x) + '" cy="' + r2(y + 0.42 * size) + '" rx="' + r2(0.30 * size) + '" ry="' + r2(0.26 * size) + '"/></g>';
      }
      s += '<circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r - A.ringWidth / 2) + '" fill="none" stroke="' + TH.yellow + '" stroke-width="' + A.ringWidth + '"/>';
      return s;
    }

    function footerFrame(handle, date) {
      var Fo = T.footer, b = Fo.bubble, a = Fo.avatar, h = Fo.handle, d = Fo.date;
      var s = '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="' + b.radius + '" fill="' + TH[b.fill] + '"/>';
      s += '<circle cx="' + a.cx + '" cy="' + a.cy + '" r="' + a.r + '" fill="' + TH[a.fill] + '"/>' + markGlyph(a.cx, a.cy, a.markWidth, TH.ink);
      s += '<text x="' + h.x + '" y="' + h.y + '"' + fontAttr(h.size, h.weight, TH.text) + '>' + esc('@' + handle) + '</text>';
      s += '<text x="' + d.x + '" y="' + d.y + '"' + fontAttr(d.size, d.weight, TH[d.fill]) + '>' + esc(date) + '</text>';
      var t = Fo.total, x0 = t.right - t.w;
      s += '<rect x="' + x0 + '" y="' + t.y + '" width="' + t.w + '" height="' + t.h + '" rx="' + t.radius + '" fill="' + TH.yellow + '"/>';
      return s;
    }

    function norm(opts) {
      var handle = String(opts.handle || T.sample.handle).replace(/^@/, '').toLowerCase();
      var members = (opts.members && opts.members.length ? opts.members : sampleMembers(5)).slice(0, T.members.max);
      if (members.length < T.members.min) members = members.concat(sampleMembers(T.members.min).slice(members.length));
      var p = String(opts.idPrefix || 'arc');
      return { handle: handle, date: opts.date || T.sample.date, members: members, avatar: opts.avatar || null, p: p };
    }

    /* ---------- static layer ---------- */
    function staticLayer(o, L) {
      var s = backdrop(L).replace('__P__', o.p);
      s += '<g data-arc="dyn-a"></g>';
      s += avatarSvg(o.p + '-cav', L.center.x, L.center.y, L.centerSize, o.avatar);
      L.items.forEach(function (it) {
        var m = o.members[it.i];
        s += avatarSvg(o.p + '-av' + it.i, it.x, it.y, it.tile, m.avatar);
      });
      s += '<g data-arc="dyn-p"></g>';
      s += headerSvg();
      s += footerFrame(o.handle, o.date);
      s += '<g data-arc="dyn-b"></g>';
      return s;
    }

    /* ---------- dynamic layers ---------- */
    function badge(x, y, rad, scale, opacity) {
      var S = T.stamp;
      return '<g transform="translate(' + r2(x) + ' ' + r2(y) + ') scale(' + r2(scale) + ')" opacity="' + r2(opacity) + '"><circle r="' + r2(rad) + '" fill="' + TH.yellow + '" stroke="' + TH[S.ringColor] + '" stroke-width="' + S.ringWidth + '"/>' +
        '<polyline points="' + r2(-0.45 * rad) + ',' + r2(0.02 * rad) + ' ' + r2(-0.12 * rad) + ',' + r2(0.35 * rad) + ' ' + r2(0.48 * rad) + ',' + r2(-0.32 * rad) + '" fill="none" stroke="' + TH.ink + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>';
    }

    function frame(o, L, t, isStatic) {
      var tl = T.timeline, TM = times(L.n), n = L.n, C = L.center;
      var fade = t >= tl.fadeOut.start ? clamp(1 - (t - tl.fadeOut.start) / tl.fadeOut.duration, 0, 1) : 1;
      if (t >= tl.fadeOut.start + tl.fadeOut.duration) fade = 0;
      var a = '', p = '', b = '', j;
      var streamOn = !isStatic;
      // dyn-a: arcs, center pulses, particles
      L.items.forEach(function (it) {
        var P = { x: it.x, y: it.y }, k = ctrlFor(C, P, it.a, L.arcOff);
        var draw = easeOutCubic((t - tl.arcDraw.start - it.i * tl.arcDraw.stagger) / tl.arcDraw.duration);
        if (isStatic) draw = 1;
        a += '<path d="M' + r2(C.x) + ' ' + r2(C.y) + ' Q' + r2(k.x) + ' ' + r2(k.y) + ' ' + r2(P.x) + ' ' + r2(P.y) + '" fill="none" stroke="' + TH.yellow + '" stroke-width="' + L.strokeW + '" stroke-opacity="' + T.arc.strokeOpacity + '" stroke-linecap="' + T.arc.lineCap + '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="' + r2(1 - draw) + '"/>';
      });
      if (streamOn && t >= tl.firstLaunch && fade > 0) {
        var cp = tl.centerPulse;
        for (j = 0; j < 2; j++) {
          var ph = ((t - tl.firstLaunch) / cp.period + j * 0.5) % 1;
          a += '<circle cx="' + r2(C.x) + '" cy="' + r2(C.y) + '" r="' + r2(L.centerSize / 2 + cp.grow * ph) + '" fill="none" stroke="' + TH.yellow + '" stroke-width="1" stroke-opacity="' + r2((1 - ph) * 0.4 * fade) + '"/>';
        }
        var pc = T.particles;
        L.items.forEach(function (it) {
          var P = { x: it.x, y: it.y }, k = ctrlFor(C, P, it.a, L.arcOff);
          for (var q = 0; q < pc.perArc; q++) {
            var u = (t - TM[it.i].launch - q * pc.spacing) / pc.flight;
            if (u < 0) continue;
            var s = u - Math.floor(u), pt = bez(C, k, P, s);
            a += '<circle cx="' + r2(pt.x) + '" cy="' + r2(pt.y) + '" r="' + pc.glow.radius + '" fill="url(#' + o.p + '-glow)" opacity="' + r2(fade) + '"/>';
            pc.trail.forEach(function (tr) {
              var s2 = s - tr.dt / pc.flight; if (s2 < 0) return;
              var p2 = bez(C, k, P, s2);
              a += '<circle cx="' + r2(p2.x) + '" cy="' + r2(p2.y) + '" r="' + tr.r + '" fill="' + TH.particleCore + '" opacity="' + r2(tr.opacity * fade) + '"/>';
            });
            a += '<circle cx="' + r2(pt.x) + '" cy="' + r2(pt.y) + '" r="' + pc.core.radius + '" fill="' + TH.particleCore + '" opacity="' + r2(fade) + '"/>';
          }
        });
      }
      // dyn-p: pills (under the person avatars), dyn-b: ripples, stamps, footer total
      var totalCents = 0, allLanded = TM[n - 1].land;
      L.items.forEach(function (it) {
        var m = o.members[it.i], cents = Math.round(m.amount * 100), e = easeOutCubic((t - TM[it.i].land) / tl.tick.duration);
        if (isStatic) e = 1;
        var shown = Math.round(cents * e);
        totalCents += shown;
        var P = T.pill, x0 = it.x - it.pw / 2, y0 = it.y + it.tile / 2 + P.gapBelowTile;
        var landed = t >= TM[it.i].land || isStatic;
        var fs = byTile(it.tile, P.fontSize, 'tileGte44', 'tileGte36', 'else');
        p += '<rect x="' + r2(x0) + '" y="' + r2(y0) + '" width="' + it.pw + '" height="' + P.height + '" rx="' + P.radius + '" fill="' + (landed ? TH.yellow : TH[P.preLandFill]) + '"/>';
        p += '<text x="' + r2(it.x) + '" y="' + r2(y0 + P.height / 2) + '" text-anchor="middle" dominant-baseline="central"' + fontAttr(fs, P.fontWeight, landed ? TH.ink : TH[P.preLandText]) + '>$' + (shown / 100).toFixed(2) + '</text>';
        if (!isStatic) {
          var rp = (t - TM[it.i].land) / tl.landRipple.duration;
          if (rp >= 0 && rp <= 1 && fade > 0) b += '<circle cx="' + r2(it.x) + '" cy="' + r2(it.y) + '" r="' + r2(it.tile / 2 + tl.landRipple.radiusGrow * rp) + '" fill="none" stroke="' + TH.yellow + '" stroke-width="1.5" stroke-opacity="' + r2((1 - rp) * 0.8 * fade) + '"/>';
        }
        var sp = isStatic ? 1 : easeOutBack((t - TM[it.i].land - tl.stamp.delayAfterLand) / tl.stamp.duration);
        if (sp > 0.001) b += badge(it.x + 0.36 * it.tile, it.y - 0.36 * it.tile, clamp(0.2 * it.tile, 5, 9), sp, fade);
      });
      var Fo = T.footer, tt = Fo.total, x0t = tt.right - tt.w, cxT = x0t + tt.w / 2, cyT = tt.y + tt.h / 2;
      b += '<text x="' + r2(cxT) + '" y="' + r2(cyT) + '" text-anchor="middle" dominant-baseline="central"' + fontAttr(tt.amountSize, tt.amountWeight, TH.ink) + '><tspan fill-opacity="' + tt.labelOpacity + '" font-size="' + tt.labelSize + '" font-weight="' + tt.labelWeight + '">' + tt.label + '  </tspan>$' + (totalCents / 100).toFixed(2) + '</text>';
      var pp = isStatic ? 1 : easeOutBack((t - allLanded - tl.paidBadge.delayAfterLastLand) / tl.paidBadge.duration);
      if (pp > 0.001) b += badge(x0t + 4, tt.y + 2, 9, pp, fade);
      return { a: a, p: p, b: b };
    }

    function defs(p) {
      var stops = TH.glowStops.map(function (g) { return '<stop offset="' + g[0] + '" stop-color="' + g[1] + '" stop-opacity="' + g[2] + '"/>'; }).join('');
      return '<defs><radialGradient id="' + p + '-glow">' + stops + '</radialGradient>' +
        '<radialGradient id="' + p + '-bg"><stop offset="0" stop-color="' + TH.backgroundGlow + '"/><stop offset="1" stop-color="' + TH.background + '" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="' + p + '-card"><rect width="' + W + '" height="' + H + '" rx="' + T.canvas.cornerRadius + '"/></clipPath></defs>';
    }

    function wrap(o, inner) {
      var aria = 'CirclePay Arc card for @' + o.handle + ': ' + o.members.length + ' people connected by arcs with their amounts, and a summary with the circle total.';
      return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(aria) + '" data-arc-card="1" style="shape-rendering:geometricPrecision">' +
        defs(o.p) + '<g clip-path="url(#' + o.p + '-card)">' + inner + '</g></svg>';
    }

    /** Full SVG string. t === undefined -> static final frame (PNG fallback). */
    function svg(opts, t) {
      opts = opts || {};
      var o = norm(opts), L = layout(o.members.length);
      var isStatic = (t === undefined || t === null);
      var tt = isStatic ? T.timeline.finalFrame : t;
      var fr = frame(o, L, tt, isStatic);
      var inner = staticLayer(o, L).replace('<g data-arc="dyn-a"></g>', '<g data-arc="dyn-a">' + fr.a + '</g>').replace('<g data-arc="dyn-p"></g>', '<g data-arc="dyn-p">' + fr.p + '</g>').replace('<g data-arc="dyn-b"></g>', '<g data-arc="dyn-b">' + fr.b + '</g>');
      return wrap(o, inner);
    }

    /** Animated mount (browser). */
    function mount(el, opts) {
      opts = opts || {};
      var o = norm(opts), L = layout(o.members.length);
      var reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var staticOnly = reduce || opts.static === true;
      el.innerHTML = svg(opts, staticOnly ? undefined : (opts.freezeAt != null ? opts.freezeAt : 0));
      var gA = el.querySelector('[data-arc="dyn-a"]'), gP = el.querySelector('[data-arc="dyn-p"]'), gB = el.querySelector('[data-arc="dyn-b"]');
      var raf = 0, playing = false, t0 = 0, offset = 0, destroyed = false;
      function draw(t) { var fr = frame(o, L, t, false); gA.innerHTML = fr.a; gP.innerHTML = fr.p; gB.innerHTML = fr.b; }
      function loopT(ms) { return ((ms - t0) / 1000 + offset) % T.timeline.loop; }
      function tick(ms) { if (!playing || destroyed) return; draw(loopT(ms)); raf = requestAnimationFrame(tick); }
      var api = {
        play: function () { if (staticOnly || playing || destroyed) return; playing = true; t0 = performance.now(); raf = requestAnimationFrame(function (ms) { t0 = ms; tick(ms); }); },
        pause: function () { playing = false; cancelAnimationFrame(raf); },
        seek: function (t) { api.pause(); offset = t; draw(t); },
        replay: function () { offset = 0; api.pause(); api.play(); },
        destroy: function () { destroyed = true; api.pause(); },
        layout: L
      };
      if (opts.freezeAt != null && !staticOnly) { draw(opts.freezeAt); }
      else if (!staticOnly) {
        if (typeof IntersectionObserver === 'function') {
          var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) api.play(); else api.pause(); }); }, { threshold: 0.1 });
          io.observe(el);
        } else api.play();
      }
      return api;
    }

    return { tokens: T, layout: layout, svg: svg, mount: mount, sampleMembers: sampleMembers, times: times, FINAL_T: T.timeline.finalFrame };
  }

  return { create: create, version: '1.0.0' };
});
