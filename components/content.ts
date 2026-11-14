export const COPY = {
  title: 'See who showed up for you.',
  lede: 'Drop an X handle. CirclePay finds who replied, quoted and reposted in the last 7 days and turns them into a circle card.',
  cta: 'Make my circle card',
  placeholder: 'yourhandle',
  note: 'Opens Grok with your prompt. Reads public X activity only.',
  steps: [
    { n: '1', t: 'Drop a handle', d: 'Type any X handle. No sign-in.' },
    { n: '2', t: 'See your circle', d: 'CirclePay finds who replied, quoted and reposted in the last 7 days.' },
    { n: '3', t: 'Get your card', d: 'Share the circle card. Optional rewards go through the CirclePay template, only after your clear yes.' },
  ],
  footer: 'Reads public X activity only. Not affiliated with X, xAI or PayBox.',
};

export const VARIANTS = [
  { key: 'a', name: 'shadcn/ui', line: 'Quiet zinc cards, hairline borders, the default app look.' },
  { key: 'b', name: 'Magic UI', line: 'Dot grid, blur-in, a shimmer button and a border beam.' },
  { key: 'c', name: 'Aceternity UI', line: 'Spotlight and background beams over a big centered hero.' },
  { key: 'd', name: 'React Bits', line: 'Animated gradient text, squares grid and star-border CTA.' },
  { key: 'e', name: 'daisyUI', line: 'Plain component classes, a custom yellow theme.' },
] as const;

export const LINKS = {
  github: 'https://github.com/erthxn/CirclePay',
  spec: 'https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.md',
};
