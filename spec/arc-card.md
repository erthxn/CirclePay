# CirclePay Arc card: specification v2.0.0

This document tells any agent (Grok, ChatGPT, Claude, Grok Bot, CirclePay) or any human how to draw the **CirclePay Arc card** so that every implementation gives the same picture. All numbers here also live in [`arc-card.json`](./arc-card.json), and the reference renderer [`src/arc-card.js`](../src/arc-card.js) is built from that JSON, so the three cannot drift apart. When this text and the JSON disagree, the JSON wins. MIT licensed.

> **Copy-paste prompt for any agent:** `Render the CirclePay Arc card per https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.md (tokens: https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.json). Use the members and amounts I give you. Output an SVG and a PNG at 1080x1350.`

The card is a soft, rounded, chat-style card in yellow on black. One owner sits in the middle and 3 to 15 people around them. Curved arcs run from the owner to each person. Glowing yellow particles travel along the arcs. When a stream lands, that person's amount pill turns yellow and ticks up, and a small yellow check badge pops onto their avatar. A rounded summary bubble at the bottom holds the handle, the date and the circle total.

Use only real data the user gave you (handles, amounts, optional avatar images). Never invent people. Placeholder cards use `@yourhandle`, `@friend1`..`@friendN`, generic silhouettes and the date `14/11/26`.

## 1. Canvas and coordinates

| Item | Value |
| --- | --- |
| Canvas | **384 x 480** units, aspect ratio **4:5** |
| Arc stage | the top **384 x 384** square (y = 0..384) |
| Summary bubble | the bottom area, y = 396..464 |
| Corner radius | **32** (clip the whole card) |
| Origin | top-left, +x right, +y down |
| PNG export | scale 2.8125, so **1080 x 1350 px** |

## 2. Palette (the one theme: `arc-yellow-black`)

| Token | Hex | Used for |
| --- | --- | --- |
| background | `#0c0c0d` | card fill |
| backgroundGlow | `#161617` | soft radial glow behind the owner (radius 260, fades to transparent) |
| surface | `#1c1c1e` | summary bubble |
| surfaceHigh | `#2c2c2e` | avatar fill, pill before its payment lands |
| line | `#2a2a2c` | 1 unit card outline |
| ringLine | `#1f1f21` | faint concentric rings |
| text | `#F5F5F7` | handle, brand name |
| muted | `#A1A1A6` | date, status text |
| yellow | `#FFD400` | arcs, rings of avatars, pills, badges, total pill |
| yellowSoft | `#FFE14D` | accents |
| ink | `#0A0A0A` | text on yellow |
| particleCore | `#FFF3A3` | particle core and trail |
| glow gradient | radial: `#FFD400` at 0% opacity .8, 50% opacity .25, 100% opacity 0 | particle halo |

Arc has exactly one palette. **The studio's theme picker (the 150 gradient themes) and the line-style picker never change Arc, and Arc never changes them.** Selecting a theme while Arc is active only stores the choice for the other line styles. Switching to Spiral or Solid and back to Arc gives a byte-identical Arc.

## 3. Font

One friendly sans for everything: `Inter, -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, system-ui, Arial, sans-serif`. Use **tabular figures** (`font-variant-numeric: tabular-nums`) for every number so amounts do not jitter while they tick. If Inter is not available, any system sans is fine; keep the sizes below.

## 4. Center avatar and people layout

The owner avatar sits at the center point `C`.

### 4.1 One ring (3 to 10 people)

```
a_i = (i / n) * 2*PI - PI/2          i = 0..n-1   (clockwise from 12 o'clock)
R   = radiusPct * 384 / 100
x_i = 192 + cos(a_i) * R
y_i = 192 + sin(a_i) * R
```

| n | radiusPct | R (units) | person avatar (tile) | owner avatar size | center C |
| --- | --- | --- | --- | --- | --- |
| 3 to 5 | 30 | 115.2 | 50 | 58 | (192, 192) |
| 6 to 7 | 32 | 122.88 | 44 | 52 | (192, 192) |
| 8 to 10 | 34 | 130.56 | 38 | 52 | (192, 192) |

Example, n = 5: person 0 is at (192, 76.8), person 1 at (301.56, 156.4), person 2 at (259.71, 285.2), person 3 at (124.29, 285.2), person 4 at (82.44, 156.4).

### 4.2 Two rings (11 to 15 people)

Above 10 people the owner moves up to **C = (192, 182)** with size **46**, and people sit on two concentric rings: `k = ceil(n/3)` people on the inner ring and `m = n - k` on the outer ring (radius 158, tile 32), the outer people placed in the gaps between inner people. The exact search (inner radius, inner tile, arc offset, spread, phase) is deterministic and described in `arc-card.json -> twoRing`. Its winning result for n = 11, 12, 13, 14, 15 is **frozen** in `arc-card.json -> twoRing.layouts[n]` as `{cy, center, arcOff, items: [{i, a, x, y, tile}]}`. Use those numbers; do not re-run the search. (`node scripts/gen-layouts.js` regenerates them and reports zero layout issues.)

The search guarantees: person boxes (avatar plus pill) stay inside the 384 x 384 stage with a 2 unit margin, never overlap each other (1.5 gap), never touch the owner avatar, never touch the header box (8,8)-(104,38), and no arc passes through another person's box.

## 5. Rings and arcs

Behind the arcs, three faint concentric circles are centered on the owner `C` with radii **92, 160 and 228**, stroke `#1f1f21`, width 1.

Each person is joined to the owner by a **quadratic Bezier**:

```
C    = owner center, P = person center (x_i, y_i)
ctrl = ( (C.x+P.x)/2 + cos(a_i + PI/2) * off ,
         (C.y+P.y)/2 + sin(a_i + PI/2) * off )
path = M C.x C.y  Q ctrl.x ctrl.y  P.x P.y
```

`a_i` is the person's angle from the owner (section 4) and `off` is the arc offset: **28.8** for one ring and `layouts[n].arcOff` (15) for two rings. This sideways bend gives every arc the same clockwise curl.

| Stroke | One ring | Two rings |
| --- | --- | --- |
| width | 3.84 | 3.2 |
| color | `#FFD400` | `#FFD400` |
| opacity | 0.5 | 0.5 |
| cap | round | round |

Draw order, bottom to top: background, glow, rings, arcs and particles, owner avatar, person avatars, pills, header, summary bubble, animated stamps and total.

## 6. Avatars

* Circle of diameter `tile` (people) or the owner size, fill `#2c2c2e`.
* If an image URL is given, draw it clipped to the circle (`xMidYMid slice`). Otherwise draw a **generic silhouette** in `#FFD400` at 85% opacity: head circle radius `0.17*size` at `(x, y - 0.10*size)`, shoulders ellipse `rx = 0.30*size`, `ry = 0.26*size` at `(x, y + 0.42*size)`, both clipped to the avatar circle.
* A **2 unit yellow ring** (`#FFD400`) sits on top; its circle has radius `size/2 - 1`.

## 7. Amount pill

Each person has a soft pill directly **under** their avatar.

| Item | Value |
| --- | --- |
| height | 17 |
| width | `max(tile + 8, 48)` |
| gap below avatar | 5 (pill top = `y + tile/2 + 5`) |
| left | `x - width/2` |
| shape | fully rounded rect, radius 8.5 |
| before landing | fill `#2c2c2e`, text `#A1A1A6` showing `$0.00` |
| after landing | fill `#FFD400`, text `#0A0A0A` |
| text | `$` plus the amount to two decimals, centered in the pill, weight 650, tabular figures. Font size 10 (tile >= 44), 9.5 (tile >= 36), else 8.5 |

## 8. Handle and date format

* Handle: `@` followed by the **lowercase** X handle with any leading `@` removed (`@YourHandle` becomes `@yourhandle`).
* Date: **DD/MM/YY** with zero padding, for example `14/11/26`.

## 9. Header (top-left)

A small yellow circle badge (radius 12 at (26, 22)) holding the CirclePay mark in ink (15 units wide; paths in `arc-card.json -> mark.paths`, viewBox `190 370 1560 1260`), then the title `CirclePay` (13, weight 650, `#F5F5F7`) at (44, 21) and the status `last 7 days` (9, weight 500, `#A1A1A6`) at (44, 33).

## 10. Summary bubble (bottom)

A rounded chat bubble, fill `#1c1c1e`:

* Bubble: x 16, y 396, 352 x 68, radius 22.
* Left: a yellow circle (radius 16 at (44, 430)) holding the ink mark; the handle at (68, 427) (15, weight 650, `#F5F5F7`); the date at (68, 445) (12, weight 500, `#A1A1A6`).
* Right: a **total pill**, yellow, 124 x 30, radius 15, right edge at x = 352, top y = 415. Inside, centered: `Total` (11, weight 500, ink at 65%) then two spaces then `$XX.XX` (15, weight 700, ink).
* The total is the sum of the displayed amounts (in cents, so no rounding drift).
* When every payment has landed, a check badge (same design as section 11, radius 9) pops onto the pill's top-left corner at (x0 + 4, 417), where x0 = 228 is the pill's left edge.

## 11. Paid stamp (per person)

A yellow circle badge with an ink check, on the top-right of each avatar: radius `clamp(0.2*tile, 5, 9)`, center `(x + 0.36*tile, y - 0.36*tile)`, fill `#FFD400`, a 2 unit ring in the card background `#0c0c0d`, check polyline `(-0.45,0.02) (-0.12,0.35) (0.48,-0.32)` times the radius, ink stroke 1.6, round caps and joins. It pops in (scale 0 to 1, easeOutBack, 0.35 s) 0.5 s after that person's payment lands.

## 12. Particles

Each arc carries **3 glowing particles** with spacing 0.38 s, travelling the arc's own Bezier from owner to person in **1.0 s**, linear in time, looping. A particle is a soft radial-gradient halo (radius 6), a core dot (radius 2, `#FFF3A3`) and three trail dots behind it (0.03, 0.06 and 0.09 s back; radius 1.8, 1.4, 1.0; opacity .6, .4, .2). The owner also emits two expanding pulse rings (period 1.6 s, growing 22 units, 1 unit stroke, fading).

## 13. Animation timeline (loop = 11 s)

| Time | What happens | Easing |
| --- | --- | --- |
| 0.1 s + 0.04 s per person | the arcs draw in (`pathLength=1`, dashoffset 1 to 0, 0.7 s each) | easeOutCubic |
| 0.9 s + i * step | person i's first particle launches; `step = min(0.34, 3.4/n)` seconds | none |
| launch + 1.0 s | **landing**: the pill turns yellow, a ring ripples out of the avatar (0.6 s, grows 10 units) and the amount starts ticking | |
| land to land + 0.8 s | the amount ticks from `$0.00` to the full value: `shown = round(cents * ease) / 100` | easeOutCubic |
| land + 0.5 s | the paid check badge pops in (0.35 s) | easeOutBack |
| last landing + 0.9 s | the total pill's check badge pops in (0.35 s) | easeOutBack |
| 9.6 to 10.2 s | everything animated fades out | linear |
| 11 s | loop restarts at 0 | |

`easeOutCubic(x) = 1 - (1-x)^3`; `easeOutBack(x) = 1 + c3*(x-1)^3 + c1*(x-1)^2`, `c1 = 1.70158`, `c3 = c1 + 1`. Respect `prefers-reduced-motion`: show the static final frame instead of animating.

## 14. Static PNG fallback (final frame)

The static image is the frame at **t = 9.0 s** with particles and pulse rings hidden: arcs fully drawn, every pill yellow with its final amount, every paid badge shown, the total badge shown, the total complete. Render it as SVG at 384 x 480 and rasterize at 1080 x 1350 (scale 2.8125). In the reference renderer: `arc.svg(options)` with no time argument returns exactly this.

## 15. Interaction with the studio pickers

The studio has a line-style picker and a theme picker.

* **Arc** (connector id `curve-001`, the default): drawn only from this spec. The theme picker is shown but does not affect Arc. Any number of people from 3 to 15.
* **Spiral**, **Solid** and the other line styles: drawn by the legacy studio code, completely unchanged, on the selected theme. They support 5, 7 or 10 people.
* The Arc renderer takes no input from the pickers, so its output is identical no matter which theme or style was picked before. Do not add theme-dependent colors to Arc.

## 16. Reference inputs and outputs

```js
const arc = ArcCard.create(tokens);               // tokens = arc-card.json
arc.svg({ handle: 'yourhandle', date: '14/11/26',
          members: [{ handle: 'friend1', amount: 5.6 }, ...] });   // static final SVG string
arc.svg(options, 3.2);                            // frame at t = 3.2 s
arc.mount(element, options);                      // animated; returns { play, pause, seek, replay, destroy }
arc.sampleMembers(n);                             // deterministic placeholder amounts that total $20.00
```

Placeholder amounts: weights `w_i = n - i + 2`, `cents_i = floor(2000 * w_i / sum(w))`, leftover cents go one each to members 0, 1, 2 in order. Members are ordered biggest first.

Optional per-member `avatar` (image URL) and `avatar` for the owner. Never embed real people's photos or wallet addresses in demos or examples.
