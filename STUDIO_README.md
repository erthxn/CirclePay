# CirclePay — Studio v2 (Premium Edition)

This fork evolves the original CirclePay card studio into a **full premium design system** with **4 dedicated studio routes**, **200 unique premium background cards** (separate from the 250 cards-with-members), **100 unique connector wires**, and a polished UI inspired by Vercel/Linear/Arc Browser.

## What's new in v2

### 1. Premium design system — now with separate bg cards
- **250 premium unique card designs** in `cards.json` (12 categories, 14 layout styles, 6 brand marks) — these are cards WITH member tiles
- **NEW: 200 unique premium background cards** in `bg_cards.json` (10 categories — pure backgrounds, no member tiles) — these replace the dull 6-gradient system (steel/moon/navy/gold/dusk/ink) used in `/circle/pay`
- **100 unique connector wire designs** in `connectors.json` (10 categories)
- **250 cards × 100 connectors × 200 bg cards = 5,000,000 combinations**

#### BG card categories (10 categories, 200 designs)
| Category | Count | Inspired by |
|---|---|---|
| Sunset Glow | 20 | Sunset gradients (coral, peach, warm honey, violet sunset) |
| Ocean Depths | 20 | Aqua/electric/abyssal (Triton, lagoon, arctic) |
| Aurora Cosmic | 20 | Nebulae/auroras (Milky Way, supernova, Pulsar, deep field) |
| Metallic Premium | 25 | Robinhood Gold, Apple Titanium, Revolut Steel, Stripe Holo |
| Neon Cyber | 20 | Synthwave, Outrun, Tokyo Night, Matrix |
| Pastel Dream | 20 | Cotton candy, lavender mist, mint cream |
| Dark Lux | 20 | Obsidian, Onyx, Carbon, Vantablack |
| Glassmorphism | 20 | iOS 18/macOS Sequoia style (24px blur, frosted crystal) |
| Holographic | 20 | Rainbow prism, opal, iridescent pearl |
| Geometric Mesh | 15 | Hex tech, circuit board, topographic, crystalline |

Each bg card uses researched hex palettes from 2024-2026 premium UI trends (Robinhood Gold `#C9A227 → #F4D160 → #B8860B`, Mercury Aurora `#6155F5 → #D55F5A → #F2C14E`, Phantom Violet `#AB9FF2 → #6E3FF3 → #4123D5`, etc.).

### 2. Refactored studio into 4 dedicated routes
- **`/studio/libraries?type=cards|bg|connectors`** — browse inbuilt cards, backgrounds, connectors (with segmented control to switch between the 3 libraries, each with counts)
- **`/studio/templates`** — 12 curated pre-built combinations (card + bg + connector) ready to use as starting points
- **`/studio/custom`** — pick a card + bg + connector on the left, then tweak everything on the right with full customization panel
- **`/studio/preview`** — full-bleed preview of your design, mobile/desktop optimized
- `/studio` itself redirects to `/studio/libraries`
- Old `/test/card` redirects to `/studio/libraries` (307)
- The 4 routes share the same store via `useSyncExternalStore` — selections persist across route changes

### 3. Animated navbar & UI (premium VFX feel)
- **Morphing tab pill** — active tab indicator animates between positions via `layoutId` + spring physics (no Framer Motion dependency, hand-rolled in `motion.tsx`)
- **Magnetic hover** on desktop — nav items lift 1px on hover with spring easing
- **`studio-fade-up`** entrance animation for headers and content (cubic-bezier(0.22, 1, 0.36, 1))
- **`studio-stagger-in`** for gallery tiles (with delayChildren-style stagger)
- **`studio-pop`** spring scale entrance for cards
- **`studio-slide-in-right`** for the bg card picker side sheet (mobile/desktop modal)
- **Glassmorphism panel** `.studio-glass` (24px blur, 180% saturation, hairline border, inset highlight — matches iOS 18 / Linear style)
- **Premium scrollbar** on desktop (10px thumb, var(--bg-dark) track, hover lift)
- **`studio-glow-accent`** for active accent buttons (3-layer box-shadow: ring + glow + inset highlight)
- All animations honor `prefers-reduced-motion: reduce` — disabled when set

### 4. Customization (now in `/studio/custom`)
- Gradient stop editor (add/remove rows + color pickers, shows hex)
- Gradient angle slider
- Stroke width slider (0.2–4)
- Stroke opacity slider
- Stroke color picker (overrides connector's default)
- Dash pattern text input (with examples)
- Member count toggle (5/7/10)
- Brand mark selector (6 marks: paybox, solana, circlepay, diamond, crown, none)
- Glow filter toggle (with switch animation)
- Reset button (restores defaults from selected card + connector)

### 5. `/circle/pay` page now uses bg_cards system
The original page had 6 dull gradients (steel/moon/navy/gold/dusk/ink). Now it:
- Loads all 200 premium bg cards from `bg_cards.json` at build time (parsed once, type-safe)
- Adds a "Pick a background" trigger button that opens a full-screen modal on mobile / side sheet on desktop
- Modal shows all 200 bg cards grouped by category, with search and live selection ring
- The picked bg card is stored in the URL (`?b=bg-card-id`) — survives refresh and share
- The live preview uses the bg card's `gradient_css` + optional pattern overlay (radial-glow, halo-glow, vignette)
- Download via html2canvas at 3× scale still works perfectly with the new backgrounds

### 6. Performance (smooth on low-end mobile AND high-end desktop)
- **Native `<img loading="lazy" decoding="async">`** on all 450 PNG previews (250 cards + 200 bg cards + 100 connectors)
- **`IntersectionObserver` lazy mount** of interactive overlays (300px root margin)
- **`useDeferredValue`** for filter input — keeps typing responsive on low-end phones
- **`useSyncExternalStore`** for the studio store — slice-level subscriptions
- **`prefers-reduced-motion`** fully honored — disables all animations, transitions, `will-change`, and even glassmorphism blur
- **44×44 touch targets** (WCAG 2.5.5) via `.studio-tap` utility class
- **Responsive grid**: 2 cols mobile → 3 tablet → 4 laptop → 5-6 desktop
- **GPU layer promotion** via `will-change: transform` + `translateZ(0)` (only on visible tiles)
- **No new dependencies** — uses existing html2canvas + React 18 + Next 14 + Tailwind 3. Motion is hand-rolled (no framer-motion).

### 7. Mobile/desktop editor UX
- On mobile: stacked layout (gallery above, preview+panel below)
- On `xl:` desktop: 3-pane sticky layout (gallery left | preview + panel right)
- Bg card picker on `/circle/pay`: full-screen modal on mobile, side sheet (480px) on desktop
- All buttons are `studio-tap` (min 44×44) for touch accessibility
- Tab nav collapses to compact 4-col grid on mobile, full pill bar on desktop

## Architecture

```
app/
  studio/
    libraries/page.tsx          # /studio/libraries?type=cards|bg|connectors
    templates/page.tsx          # /studio/templates (curated combinations)
    custom/page.tsx             # /studio/custom (full editor + panel)
    preview/page.tsx            # /studio/preview (bg-focused gallery)
    loading.tsx                 # skeleton grid (shared)
    error.tsx                   # error boundary (shared)
  circle/
    pay/page.tsx                # REFACTORED — uses bg_cards system

components/
  studio/
    StudioClient.tsx            # shared orchestrator (gallery + preview + panel)
    StudioNav.tsx               # 4-tab nav with morphing pill
    LibraryTabs.tsx             # 3-library switch (cards/bg/connectors)
    LivePreview.tsx             # active card + connector + bg pattern overlay
    CustomizationPanel.tsx      # full customization controls
    CardGallery.tsx             # 250 cards grouped by category
    BgCardGallery.tsx           # 200 bg cards grouped by category
    ConnectorPicker.tsx         # 100 connectors with category chips
    CardTile.tsx                # lazy card tile
    BgCardTile.tsx              # lazy bg card tile
    CategorySection.tsx         # category heading + grid
    DownloadButton.tsx          # html2canvas + blob download
    useStudioState.ts           # useSyncExternalStore + useLazyMount + useReducedMotion
    motion.tsx                  # hand-rolled spring animations (no framer-motion dep)

lib/
  studio/
    types.ts                    # Card, Connector, BgCard, Customization, StudioState, StudioAction
    parse.ts                    # runtime-safe JSON parsers with defaults
    builders.ts                 # SVG string builders for connectors + bg patterns + marks
    store.ts                    # framework-agnostic external store + URL encode/decode

public/
  data/
    cards.json                  # 250 cards (212 KB)
    connectors.json             # 100 connectors (50 KB)
    bg_cards.json               # 200 bg cards (151 KB)
  previews/
    cards/                      # 250 PNG + 250 SVG (400x400)
    bg_cards/                   # 200 PNG + 200 SVG (400x400)
    connectors/                 # 100 PNG + 100 SVG (400x400)
```

## Build stats
```
Route (app)                              Size     First Load JS
├ ○ /circle/pay                          19.4 kB         152 kB   (was 3.94 kB / 137 kB — grew because bg_cards.json inline)
├ ○ /studio/custom                       187 B           157 kB
├ ○ /studio/libraries                    845 B           158 kB
├ ○ /studio/preview                      187 B           157 kB
├ ○ /studio/templates                    1.66 kB        97.6 kB   (gallery only — no LivePreview/CustomizationPanel)
+ First Load JS shared by all            87.3 kB
```

## Routes
- `/` — unchanged
- `/studio/libraries?type=cards|bg|connectors` — NEW browse libraries
- `/studio/templates` — NEW curated templates
- `/studio/custom` — NEW full editor
- `/studio/preview` — NEW preview-focused view
- `/studio` → 307 → `/studio/libraries`
- `/test/card` → 307 → `/studio/libraries`
- `/circle` — unchanged (analyze)
- `/circle/pay` — REFACTORED to use bg_cards system
- All other routes (`/about`, `/admin`, etc.) unchanged

## Run locally
```bash
npm install
npm run dev    # http://localhost:3000/studio/libraries
npm run build  # production build
npm start
```

## Premium design references adapted (researched from 2024-2026 web trends)
- **Robinhood Gold Card** — warm gold gradient `#C9A227 → #F4D160 → #B8860B` with vertical brushed-metal sheen
- **Apple Card** — titanium white `#F5F5F7` with faint radial edge-light
- **Revolut Metal** — 5 shades of steel (graphite/gunmetal/slate)
- **Mercury Aurora** — `#6155F5 → #D55F5A → #F2C14E` (violet→coral→gold)
- **Stripe Card** — iridescent purple `#635BFF` with holographic shift
- **Phantom Wallet** — aubergine + lavender `#AB9FF2 → #6E3FF3 → #4123D5`
- **Rainbow Wallet** — prismatic multi-stop full hue sweep
- **Linear** — 18px blur glass panels on near-black `#08090A`, subtle grain overlay
- **iOS 18 / macOS Sequoia** — 24px blur + 180% saturation glassmorphism
- **Apple Vision Pro** — glass materials with specular highlights on edges
- **CapCut/Lightroom mobile** — bottom sheet modal patterns, segmented controls, swipe gestures
