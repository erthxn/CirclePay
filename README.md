# CirclePay

Reward your X circle. Drop an X handle, CirclePay reads who replied, quoted and reposted you in the last 7 days, builds a branded circle card, and you can optionally reward that circle through PayBox, but only after your clear yes.

This repo is the CirclePay front-end and the open **Arc card spec**. MIT licensed.

## The Arc card spec (open source)

Any agent can draw the exact same CirclePay Arc card from these files:

| File | What it is |
| --- | --- |
| [`spec/arc-card.md`](spec/arc-card.md) | Human- and LLM-readable spec: canvas, angle formula for 3 to 15 people, arc math, colors, fonts, pills, receipt strip, stamps, animation timeline, static PNG fallback, picker behavior |
| [`spec/arc-card.json`](spec/arc-card.json) | The same numbers as machine-readable tokens |
| [`src/arc-card.js`](src/arc-card.js) | Reference renderer, built from the tokens. The website uses this exact file |

### Copy-paste prompt for any agent

```
Render the CirclePay Arc card per https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.md
(tokens: https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.json).
Use the members and amounts I give you. Output an SVG and a PNG at 1080x1350.
```

### Use the renderer

```js
const arc = ArcCard.create(tokens);                       // tokens = spec/arc-card.json
arc.svg({ handle: 'yourhandle', date: '14/11/26', members: arc.sampleMembers(5) }); // static final frame
arc.mount(document.querySelector('#card'), { members: arc.sampleMembers(7) });      // animated
```

`node scripts/check-spec.js` checks the layout for 3 to 15 people. `node scripts/gen-layouts.js` regenerates the frozen two-ring layouts.

## The site

`public/` is a static site (plain HTML, CSS and JS). A minimal Next.js shell serves it so the existing Vercel project keeps building: `next.config.js` rewrites `/` to `/index.html`, and small route handlers serve `spec/arc-card.json`, `spec/arc-card.md` and `src/arc-card.js` straight from the repo, so the site can't drift from the spec.

```
npm install
npm run dev     # http://localhost:3000
npm run build
```

* Deep links open a pre-filled CirclePay prompt: Grok (`https://grok.com/?q=`) sends it automatically; ChatGPT (`https://chatgpt.com/?q=`) and Claude (`https://claude.ai/new?q=`) fill it and you press send. Grok Bot has no public prompt link, so use the Copy prompt button. These URL formats are not official and can change.
* The card studio keeps the theme picker and the line-style picker. **Arc** is the new payment card and ignores the theme; **Spiral**, **Solid** and the other line styles use the original studio code in `public/js/legacy/` unchanged.

## Disclaimers

Not financial advice. Payouts are never automatic and need explicit approval. CirclePay only reads public X activity. It is not affiliated with X, xAI, OpenAI, Anthropic or PayBox. You are responsible for what you send, and crypto transfers can't be reversed.

## License

[MIT](LICENSE), copyright 2026 Majek / @erthxn.
