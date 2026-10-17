export default function HowItWorks() {
  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-6 text-[var(--text)]">How it works</h1>

      <div className="space-y-4">
        {[
          { n: '01', t: 'Enter any public X handle. CirclePay looks at recent high-quality interactions (quotes and mentions prioritized) from the last 7 days.' },
          { n: '02', t: 'It ranks the people who engaged with you the most and splits your chosen reward pool by score.' },
          { n: '03', t: 'You get a ready-to-copy prompt. Paste it into Claude, Grok, or ChatGPT with PayBox connected and the AI sends to each handle.' },
        ].map((step) => (
          <div key={step.n} className="neu-raised p-5">
            <div className="text-[var(--accent)] text-xs font-semibold mb-2">{step.n}</div>
            <p className="text-sm leading-relaxed text-[var(--text)]">{step.t}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 neu-pressed p-4 text-xs text-[var(--text-muted)] leading-relaxed">
        Recipients must have connected their X account on PayBox and turned on “Let people pay me by @handle” for the transfer to resolve.
      </div>
    </div>
  );
}
