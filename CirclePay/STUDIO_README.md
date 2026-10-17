# CirclePay — Premium Studio Edition

This fork evolves the original CirclePay card studio (`/test/card` page) into a full premium design system at **`/studio`**.

## What's new

### Premium design system
- **250 premium unique card designs** organized in `public/data/cards.json` across **12 categories**:
  Metallic Lux (28), Glassmorphism (24), Neon Cyber (24), Dark Premium (22), Cosmic Galaxy (22),
  Nature Organic (22), Geometric Pattern (22), Luxury Royal (22), Minimal Modern (20),
  Pastel Dream (20), Holographic (12), Vintage Classic (12)
- **100 unique connector wire designs** organized in `public/data/connectors.json` across **10 categories**:
  Solid Lines (12), Dashed Patterns (12), Glowing Neon (12), Gradient Strokes (10),
  Decorative (10), Curved Flowing (10), Energy Flow (10), Twin & Braided (8),
  Textured Metallic (8), Organic Natural (8)
- **14 card styles** (`orbit`, `spokes`, `constellation`, `halo`, `bold`, `radar`, `neural`, `quantum`,
  `filigree`, `halo-glow`, `ribbon`, `diamond`, `starburst`, `lattice`)
- **6 brand marks** (`paybox`, `solana`, `none`, `circlepay`, `diamond`, `crown`)
- Every card and connector is **fully customizable** at runtime via the Studio UI

### New `/studio` route (replaces `/test/card`)
- **Card gallery** grouped by category with native lazy-loading PNG thumbnails
- **Live preview** that renders the active card + connector via inline SVG (crisp, html2canvas-exportable)
- **Customization panel** with color pickers (gradient stops + stroke color), stroke-width slider,
  opacity slider, dash-pattern input, member-count toggle (5/7/10), mark selector, glow filter toggle
- **Connector picker** with category filter chips
- **Download PNG** via html2canvas at 3× scale (matches original /test/card quality)
- **Share link** that encodes the entire customization state into URL query params

### Performance (smooth on low-end mobile AND high-end desktop)
- **IntersectionObserver-based lazy mounting**: gallery tiles only mount interactive overlays when scrolled into view
- **Native `<img loading="lazy" decoding="async">`**: PNG thumbnails load on-demand by the browser
- **GPU layer promotion** via `will-change: transform` + `translateZ(0)` (only on visible tiles)
- **`useDeferredValue`** for filter input — keeps typing responsive on low-end phones
- **`useSyncExternalStore`** for the studio store — components subscribe only to slices they need
- **`prefers-reduced-motion`** honored — disables animations, transitions, and `will-change` when set
- **Touch-friendly 44×44 tap targets** (WCAG 2.5.5) via `.studio-tap` utility class
- **Responsive grid**: 2 cols on mobile, 3 on small tablets, 4 on laptops, 5-6 on wide desktops
- **No new dependencies** — uses existing html2canvas + React 18 + Next 14 + Tailwind 3

### Migration
- Old `/test/card` page is **deleted**
- `next.config.js` adds a 307 redirect: `/test/card` → `/studio`
- Menu component updated with a "Studio" entry between "Home" and "Check your X circle"

## Routes
- `/studio` — new premium card designer
- `/test/card` → 307 redirect → `/studio`
- All other routes (`/`, `/circle`, `/how-it-works`, `/about`, `/admin`, etc.) unchanged

## Build stats
```
Route (app)                              Size     First Load JS
├ ○ /studio                              12.5 kB         145 kB
+ First Load JS shared by all            87.3 kB
```

## Run locally
```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
npm start
```

## Architecture
```
app/
  studio/
    page.tsx              # server component — parses JSON, renders StudioClient
    loading.tsx           # skeleton grid
    error.tsx             # error boundary

components/
  studio/
    StudioClient.tsx       # client orchestrator — owns layout & store init
    CardGallery.tsx        # category-grouped grid (deferred filter)
    CategorySection.tsx   # one category block
    CardTile.tsx           # single tile (lazy mount + lazy img)
    ConnectorPicker.tsx   # 100-connector picker with category chips
    LivePreview.tsx        # the active card with inline SVG + customization
    CustomizationPanel.tsx # all controls (colors, sliders, toggles)
    DownloadButton.tsx     # html2canvas + blob download
    useStudioState.ts      # useSyncExternalStore + useLazyMount + useReducedMotion

lib/
  studio/
    types.ts              # Card, Connector, Customization, StudioState types
    parse.ts              # runtime-safe JSON parsers with defaults
    builders.ts           # pure SVG/CSS string builders for cards/connectors/marks
    store.ts              # framework-agnostic external store (no React)
```
