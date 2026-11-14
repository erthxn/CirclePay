# CirclePay

Reward your X circle. Drop an X handle, CirclePay reads who replied, quoted and reposted you in the last 7 days, builds a branded circle card, and you can optionally reward that circle through PayBox, but only after your clear yes.

This repo is the CirclePay front-end and the open **Arc card spec**. MIT licensed.

## The Arc card spec (open source)

Any agent can draw the exact same CirclePay Arc card from these files:

| File | What it is |
| --- | --- |
| [`spec/arc-card.md`](spec/arc-card.md) | Human- and LLM-readable spec: canvas, angle formula for 3 to 15 people, arc math, colors, fonts, pills, summary bubble, stamps, animation timeline, static PNG fallback, picker behavior |
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

A small Next.js app (Tailwind 4) with five clean variants of one minimal page, each styled after a different UI kit. All are yellow (`#FFD400`) on black.

| Route | Style |
| --- | --- |
| `/` | Picker |
| `/a` | shadcn/ui |
| `/b` | Magic UI |
| `/c` | Aceternity UI |
| `/d` | React Bits |
| `/e` | daisyUI |

Every variant has the same content: a hero, one X-handle input with a CTA (opens a pre-filled prompt in Grok), the example Arc card (drawn by `src/arc-card.js`, the reference renderer), a 3-step "how it works", and a footer. Small route handlers serve `spec/arc-card.json`, `spec/arc-card.md` and `src/arc-card.js` straight from the repo, so the site can't drift from the spec.

```
npm install
npm run dev     # http://localhost:3000
npm run build
node scripts/check-spec.js
```

CirclePay rewards are never automatic. They run through the CirclePay template and always need your explicit yes.

## Disclaimers

Not financial advice. Payouts are never automatic and need explicit approval. CirclePay only reads public X activity. It is not affiliated with X, xAI, OpenAI, Anthropic or PayBox. You are responsible for what you send, and crypto transfers can't be reversed.

## License

[MIT](LICENSE), copyright 2026 Majek / @erthxn.
