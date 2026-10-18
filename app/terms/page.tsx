export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10 text-[var(--text)]">
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-xs text-[var(--text-muted)] mb-6">Last updated October 13, 2026</p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>CirclePay is a free tool that reads public X (Twitter) interactions and generates a ranked list plus a text prompt. It does not process payments, hold funds, or connect to any wallet.</p>

        <h2 className="text-base font-semibold pt-2">What we do</h2>
        <p>You enter a public X handle. We fetch recent public interactions, rank them, and show a prompt you can copy into an AI agent that is connected to PayBox by you. CirclePay never sends money.</p>

        <h2 className="text-base font-semibold pt-2">What we do not do</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We do not collect passwords, private keys, or wallet addresses.</li>
          <li>We do not execute transfers.</li>
          <li>We do not store payment details.</li>
          <li>We are not affiliated with PayBox, MoonPay, or X.</li>
        </ul>

        <h2 className="text-base font-semibold pt-2">Your responsibility</h2>
        <p>You are responsible for any prompt you copy and any action your AI agent takes. CirclePay only generates text. If you use PayBox or any payment service, that service’s own terms apply.</p>

        <h2 className="text-base font-semibold pt-2">No guarantee</h2>
        <p>Rankings are estimates based on public data. We do not guarantee accuracy, completeness, or that any recipient will receive funds. Use at your own risk.</p>

        <h2 className="text-base font-semibold pt-2">Acceptable use</h2>
        <p>Do not use CirclePay to harass, impersonate, or attempt to defraud anyone. We may limit access if the service is abused.</p>

        <h2 className="text-base font-semibold pt-2">Contact</h2>
        <p>Questions: reach @erthxn on X.</p>
      </div>
    </div>
  );
}
