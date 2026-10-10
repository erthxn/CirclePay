export default function About() {
  return (
    <div className="max-w-md mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <p className="text-sm text-zinc-300 leading-relaxed mb-6">
        CirclePay helps creators and community builders reward the people who actually engage with them on X. Instead of collecting wallet addresses, it turns recent interaction data into a weighted prompt that PayBox-powered AI agents can execute using X handles.
      </p>
      <p className="text-sm text-zinc-400 mb-8">
        Built by <a href="https://x.com/erthxn" className="text-[#0D5CFF]" target="_blank" rel="noopener noreferrer">@erthxn</a>.
      </p>
      <div className="text-xs text-zinc-600">
        circlepay.fun
      </div>
    </div>
  );
}
