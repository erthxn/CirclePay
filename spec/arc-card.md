# CirclePay Arc card: specification v1.0.0

This document tells any agent (Grok, ChatGPT, Claude, Grok Bot, CirclePay) or any human how to draw the **CirclePay Arc card** so that every implementation gives the same picture. All numbers here also live in [`arc-card.json`](./arc-card.json), and the reference renderer [`src/arc-card.js`](../src/arc-card.js) is built from that JSON, so the three cannot drift apart. When this text and the JSON disagree, the JSON wins. MIT licensed.

> **Copy-paste prompt for any agent:** `Render the CirclePay Arc card per https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.md (tokens: https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.json). Use the members and amounts I give you. Output an SVG and a PNG at 1080x1350.`

The card shows one owner in the middle and 3 to 15 people around them. Curved arcs run from the owner to each person. Glowing yellow particles travel along the arcs. When a particle stream lands, that person's coin-chip amount ticks up and a paid check stamp appears. A receipt strip at the bottom holds the handle, the date and the circle total.

Use only real data the user gave you (handles, amounts, optional avatar images). Never invent people. Placeholder cards use `@yourhandle`, `@friend1`..`@friendN`, generic silhouettes and the date `14/11/26`.

## 1. Canvas and coordinates

| Item | Value |
| --- | --- |
| Canvas | **384 x 480** units, aspect ratio **4:5** |
| Arc stage | the top **384 x 384** square (y = 0..384) |
| Receipt strip | the bottom area, y = 396..478 |
| Corner radius | 28 (clip the whole card) |
| Origin | top-left, +x right, +y down |
| PNG export | scale 2.8125, so **1080 x 1350 px** |
| Background | `#0a0a0a` |

## 2. Palette (the one theme: `arc-yellow-black`)

| Token | Hex |
| --- | --- |
| background | `#0a0a0a` |
| yellow | `#FFD400` |
| yellowSoft | `#FFE14D` |
| ink | `#0a0a0a` |
| avatarBg | `#1a1a1a` |
| particleCore | `#FFF6B8` |
| glow gradient | radial: `#FFD400` at 0% opacity .95, 45% opacity .35, 100% opacity 0 |

Arc has exactly one palette. **The studio's theme picker (the 150 gradient themes) and the line-style picker never change Arc, and Arc never changes them.** Selecting a theme while Arc is active only stores the choice for the other line styles. Switching to Spiral or Solid and back to Arc gives a byte-identical Arc.

## 3. Fonts

* Mono (every number, the handle, the date, labels): `'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace`
* Sans (only the small brand word): `'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`

If the fonts are not available the fallback monospace is fine; keep the sizes below.

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

Above 10 people the owner moves up to **C = (192, 182)** with size **46**, and people sit on two concentric rings: `k = ceil(n/3)` people on the inner ring and `m = n - k` on the outer ring (radius 158, tile 32), the outer people placed in the gaps between inner people. The exact search (inner radius, inner tile, arc offset, spread, phase) is deterministic and described in `arc-card.json -> twoRing`. Its winning result for n = 11, 12, 13, 14, 15 is **frozen** in `arc-card.json -> twoRing.layouts[n]` as `{cy, center, arcOff, items: [{i, a, x, y, tile}]}`. Use those numbers; do not re-run the search. (`node scripts/gen-layouts.js` regenerates them and reports zero layout issues: no overlaps, nothing outside the stage, nothing under the brand mark, no arc crossing another person.)

Layout rules the search guarantees: person boxes (avatar plus pill) stay inside the 384 x 384 stage with a 2 unit margin, never overlap each other (1.5 gap), never touch the owner avatar, never touch the brand mark box (8,8)-(100,34), and no arc passes through another person's box.

## 5. Arcs

Each person is joined to the owner by a **quadratic Bezier**:

```
C    = owner center, P = person center (x_i, y_i)
ctrl = ( (C.x+P.x)/2 + cos(a_i + PI/2) * off ,
         (C.y+P.y)/2 + sin(a_i + PI/2) * off )
path = M C.x C.y  Q ctrl.x ctrl.y  P.x P.y
```

`a_i` is the person's angle from the owner (section 4) and `off` is the arc offset: **28.8** for one ring (3 to 10 people) and the value stored in `layouts[n].arcOff` (15) for two rings. This sideways bend gives every arc the same clockwise curl.

| Stroke | One ring | Two rings |
| --- | --- | --- |
| width | 3.84 | 3.2 |
| color | `#FFD400` | `#FFD400` |
| opacity | 0.55 | 0.55 |
| cap | butt | butt |

Arcs are drawn under the avatars, so both ends are hidden by avatar circles. Draw order, bottom to top: background, guilloche, arcs and particles, owner avatar, person avatars with their pills, brand mark, receipt strip, animated amounts and stamps.

## 6. Avatars

* Circle of diameter `tile` (people) or the owner size, fill `#1a1a1a`.
* If an image URL is given, draw it clipped to the circle (`xMidYMid slice`). Otherwise draw a **generic silhouette** in `#FFD400` at 90% opacity: head circle radius `0.17*size` at `(x, y - 0.10*size)`, shoulders ellipse `rx = 0.30*size`, `ry = 0.26*size` at `(x, y + 0.42*size)`, both clipped to the avatar circle.
* A **2 unit yellow ring** (`#FFD400`) sits on top; its circle has radius `size/2 - 1`.

## 7. Amount pill (coin chip)

Each person has a pill directly **under** their avatar.

| Item | Value |
| --- | --- |
| height | 17 |
| width | `max(tile + 8, 48)` |
| gap below avatar | 5 (pill top = `y + tile/2 + 5`) |
| left | `x - width/2` |
| shape | rounded rect, radius 8.5, fill `#FFD400` |
| coin | circle at `(pillLeft + 8.5, pillTop + 8.5)`, radius 6.5 (tile >= 44), 6 (tile >= 36), else 5.5, fill `#0a0a0a`; inner dashed ring radius `coin - 1.5`, stroke `#FFD400` 0.4 at 60%, dash `1.2 1`; a `$` in mono 700, size `coin*1.15`, `#FFD400`, centered |
| text | amount to two decimals **without** the dollar sign (the coin carries it), mono 700, `#0a0a0a`, centered at `x = pillLeft + 17 + (width - 21)/2`, vertically centered. Font size 10 (tile >= 44), 9.5 (tile >= 36), else 8.5 |
| before landing | text shows `0.00` at 55% opacity |

## 8. Handle and date format

* Handle: `@` followed by the **lowercase** X handle with any leading `@` removed (`@YourHandle` becomes `@yourhandle`).
* Date: **DD/MM/YY** with zero padding, for example `14/11/26`.

## 9. Brand mark (top-left)

The CirclePay mark (the three-part circle with two bars, `arc-card.json -> mark.paths`, viewBox `190 370 1560 1260`) in `#FFD400`, 24 units wide at `(14, 12)`, followed by the word `circlepay` in mono 600, size 9, 85% opacity, at `(44, 25)`.

## 10. Background art (guilloche)

Fine banknote-style line work, all `#FFD400`, under everything else:

* Two hypotrochoid rosettes centered at (192, 192): `(R=96, r=29, d=70)` scale 1.5, stroke 0.5, opacity 0.10 and `(R=100, r=43, d=60)` scale 1.7, stroke 0.5, opacity 0.07. Formula: `x = (R-r) cos t + d cos(((R-r)/r) t)`, `y = (R-r) sin t - d sin(((R-r)/r) t)`, `t = 0 .. 2*PI*r` in steps of `PI/24`, then scale around the center.
* A wavy border band at inset 8: two sine lines (phase 0 and PI, amplitude 2.5, wavelength 14, stroke 0.6, opacity 0.22) running up the left edge, across the top and down the right edge to y = 470. No bottom edge.

## 11. Receipt strip

A yellow `#FFD400` receipt with a serrated bottom edge and perforation notches:

* Panel: x 12..372, y 396..472. Serrated bottom: 30 teeth, each 12 wide and 6 deep (valleys at y = 472, tips at y = 478).
* Perforation: dashed ink line (`2 3`, width 1) from x = 22 to 362 at y = 428, with two background-colored notch circles of radius 6 at (12, 428) and (372, 428).
* Above the perforation: label `CIRCLE TOTAL` (mono 600, size 7.5, letter-spacing 1, ink at 70%) at (24, 408); the total `$XX.XX` (mono 700, size 16) at (24, 424); a barcode (ink bars, x from 262, y 404, height 16, widths from the `receipt.barcode.pattern` times 1.6, bars at even indexes); the **PAID stamp**: a rounded rectangle outline 56 x 21 with the text `PAID` (mono 700, size 11, letter-spacing 2), centered at (190, 414), rotated -9 degrees, 85% opacity, ink stroke 1.5.
* Below the perforation: the handle at (24, 452), mono 700, size 15; the date right-aligned at x = 360, same baseline; the tagline `reward your x circle · last 7 days` at (24, 466), mono, size 7, 65% opacity.
* The total is the sum of the displayed amounts (in cents, so no rounding drift).

## 12. Paid stamp (per person)

A yellow circle badge with an ink check, on the top-right of each avatar: radius `clamp(0.2*tile, 5, 9)`, center `(x + 0.36*tile, y - 0.36*tile)`, fill `#FFD400`, ink stroke 1.5, check polyline `(-0.45,0.02) (-0.12,0.35) (0.48,-0.32)` times the radius, ink stroke 1.6, round caps and joins. It pops in (scale 0 to 1, easeOutBack, 0.35 s) 0.5 s after that person's payment lands.

## 13. Particles

Each arc carries **3 glowing particles** with spacing 0.38 s, travelling the arc's own Bezier from owner to person in **1.0 s**, linear in time, looping. A particle is a radial-gradient glow (radius 7), a core dot (radius 2.2, `#FFF6B8`) and three trail dots behind it (0.03, 0.06 and 0.09 s back; radius 1.8, 1.4, 1.0; opacity .6, .4, .2). The owner also emits two expanding pulse rings (period 1.6 s, growing 22 units, 1 unit stroke, fading).

## 14. Animation timeline (loop = 11 s)

| Time | What happens | Easing |
| --- | --- | --- |
| 0.1 s + 0.04 s per person | the arcs draw in (`pathLength=1`, dashoffset 1 to 0, 0.7 s each) | easeOutCubic |
| 0.9 s + i * step | person i's first particle launches; `step = min(0.34, 3.4/n)` seconds | none |
| launch + 1.0 s | **landing**: a ring ripples out of the avatar (0.6 s, grows 10 units) and the amount starts ticking | |
| land to land + 0.8 s | the amount ticks from 0.00 to the full value: `shown = round(cents * ease) / 100` | easeOutCubic |
| land + 0.5 s | the paid check stamp pops in (0.35 s) | easeOutBack |
| last landing + 0.9 s | the receipt `PAID` stamp lands (0.4 s, scale 1.5 to 1, fades in) | easeOutCubic |
| 9.6 to 10.2 s | everything animated fades out | linear |
| 11 s | loop restarts at 0 | |

`easeOutCubic(x) = 1 - (1-x)^3`; `easeOutBack(x) = 1 + c3*(x-1)^3 + c1*(x-1)^2`, `c1 = 1.70158`, `c3 = c1 + 1`. Respect `prefers-reduced-motion`: show the static final frame instead of animating.

## 15. Static PNG fallback (final frame)

The static image is the frame at **t = 9.0 s** with particles and pulse rings hidden: arcs fully drawn, every amount at its final value, every paid stamp shown, the `PAID` stamp shown, the total complete. Render it as SVG at 384 x 480 and rasterize at 1080 x 1350 (scale 2.8125). In the reference renderer: `arc.svg(options)` with no time argument returns exactly this.

## 16. Interaction with the studio pickers

The studio has a line-style picker and a theme picker.

* **Arc** (connector id `curve-001`, the default): drawn only from this spec. The theme picker is shown but does not affect Arc. Any number of people from 3 to 15.
* **Spiral**, **Solid** and the other line styles: drawn by the legacy studio code, completely unchanged, on the selected theme. They support 5, 7 or 10 people.
* The Arc renderer takes no input from the pickers, so its output is identical no matter which theme or style was picked before. Do not add theme-dependent colors to Arc.

## 17. Reference inputs and outputs

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
