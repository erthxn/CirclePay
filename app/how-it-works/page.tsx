export default function HowItWorks() {
  return (
    <div className="max-w-md mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-6">How it works</h1>

      <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
        <div>
          <div className="text-[#0D5CFF] text-xs font-medium mb-1">01</div>
          <p>Enter any public X handle. CirclePay looks at recent high-quality interactions (quotes and mentions prioritized) from the last 7 days.</p>
        </div>
        <div>
          <div className="text-[#0D5CFF] text-xs font-medium mb-1">02</div>
          <p>It ranks the people who engaged with you the most and splits your chosen reward pool by score.</p>
        </div>
        <div>
          <div className="text-[#0D5CFF] text-xs font-medium mb-1">03</div>
          <p>You get a ready-to-copy prompt. Paste it into Claude, Grok, or ChatGPT with PayBox connected and the AI sends to each handle.</p>
        </div>
      </div>

      <div className="mt-10 p-4 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-500">
        Recipients must have connected their X account on PayBox and turned on “Let people pay me by @handle” for the transfer to resolve.
      </div>
    </div>
  );
}
