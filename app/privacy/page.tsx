export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10 text-[var(--text)]">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-xs text-[var(--text-muted)] mb-6">Last updated October 13, 2026</p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>CirclePay does not require an account. We do not ask for your email, password, or wallet.</p>

        <h2 className="text-base font-semibold pt-2">What we process</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>The public X handle you type.</li>
          <li>Public interaction data returned by the data source for that handle.</li>
          <li>The reward pool amount you enter (kept in your browser only).</li>
        </ul>

        <h2 className="text-base font-semibold pt-2">What we do not collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Passwords or login credentials.</li>
          <li>Wallet addresses or private keys.</li>
          <li>Payment card or bank details.</li>
          <li>Private messages or non-public data.</li>
        </ul>

        <h2 className="text-base font-semibold pt-2">Storage</h2>
        <p>Results stay in your browser session. We do not keep a permanent database of handles or rankings.</p>

        <h2 className="text-base font-semibold pt-2">Third parties</h2>
        <p>Public X data may be fetched via a third-party API. PayBox and any AI agent you use are separate services with their own privacy policies. We are not affiliated with them.</p>

        <h2 className="text-base font-semibold pt-2">Contact</h2>
        <p>@erthxn on X.</p>
      </div>
    </div>
  );
}
