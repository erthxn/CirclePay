export default function GuidesPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Connect PayBox</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">How to link your X handle and AI agent</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-[var(--text)]">1. Connect your X account to PayBox</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text)]">
          <li>Download the PayBox app (iOS / Android) or go to <a href="https://app.paybox.sh/settings" target="_blank" rel="noopener" className="text-[var(--accent)] underline">app.paybox.sh/settings</a></li>
          <li>Sign in and open Settings</li>
          <li>Tap “Connect X” and authorize with your X account</li>
          <li>Your X handle is now linked to a Solana + EVM wallet</li>
        </ol>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Anyone can then send you crypto just by using your @handle.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-[var(--text)]">2. Connect PayBox to your AI agent</h2>
        <p className="text-sm text-[var(--text)] mb-3">Works with Claude, ChatGPT, Grok, and most agents that support MCP or custom connectors.</p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text)]">
          <li>In your AI app, go to Settings → Connectors / Plugins</li>
          <li>Add a custom connector</li>
          <li>Name it <strong>PayBox</strong></li>
          <li>Paste the MCP URL: <code className="bg-[var(--bg-dark)] px-1.5 py-0.5 rounded text-xs">https://api.paybox.sh/mcp</code></li>
          <li>Authenticate with OAuth and approve the grant</li>
        </ol>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          After connecting, ask your agent “is my PayBox connected?” to confirm.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-[var(--text)]">3. Use CirclePay</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text)]">
          <li>Enter your X handle and a reward pool</li>
          <li>We rank your top engagers from the last 7 days</li>
          <li>Copy the generated prompt</li>
          <li>Paste it into your AI agent that has PayBox connected</li>
          <li>Approve the transfers</li>
        </ol>
      </section>

      <div className="neu-raised p-4 text-center">
        <p className="text-sm font-medium text-[var(--text)]">Not affiliated with PayBox or MoonPay</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Official docs: <a href="https://paybox.sh" target="_blank" rel="noopener" className="text-[var(--accent)]">paybox.sh</a></p>
      </div>
    </div>
  );
}
