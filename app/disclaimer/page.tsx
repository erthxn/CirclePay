export default function Disclaimer() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10 text-[var(--text)]">
      <h1 className="text-2xl font-bold mb-2">Disclaimer</h1>
      <p className="text-xs text-[var(--text-muted)] mb-6">Last updated October 13, 2026</p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>CirclePay is an independent project. It is not affiliated with, endorsed by, or connected to PayBox, MoonPay, X (Twitter), or any payment provider.</p>

        <h2 className="text-base font-semibold pt-2">No payments processed</h2>
        <p>CirclePay does not send, receive, or hold money. It only creates a text prompt. Any transfer happens only if you paste that prompt into an AI agent you control and that agent is connected to a payment service you authorized.</p>

        <h2 className="text-base font-semibold pt-2">No financial advice</h2>
        <p>Nothing on this site is financial, investment, or legal advice. Rankings and amounts are illustrative based on public engagement data.</p>

        <h2 className="text-base font-semibold pt-2">Public data only</h2>
        <p>We only use publicly available X interactions. We do not access private accounts or messages.</p>

        <h2 className="text-base font-semibold pt-2">Use at your own risk</h2>
        <p>The service is provided as-is. We are not responsible for actions taken by third-party agents, payment providers, or for any loss resulting from use of the generated prompt.</p>
      </div>
    </div>
  );
}
