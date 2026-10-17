export default function About() {
  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">About</h1>
      <div className="neu-raised p-5 mb-6">
        <p className="text-sm leading-relaxed text-[var(--text)]">
          CirclePay helps creators and community builders reward the people who actually engage with them on X. Instead of collecting wallet addresses, it turns recent interaction data into a weighted prompt that PayBox-powered AI agents can execute using X handles.
        </p>
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        Built by{' '}
        <a href="https://x.com/erthxn" className="text-[var(--accent)] font-medium" target="_blank" rel="noopener noreferrer">
          @erthxn
        </a>
        .
      </p>
    </div>
  );
}
