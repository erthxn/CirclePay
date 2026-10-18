export default function StudioLoading() {
  return (
    <div className="px-4 sm:px-5 max-w-[1400px] mx-auto">
      <div className="h-7 w-32 bg-[var(--bg-dark)] rounded animate-pulse mb-2" />
      <div className="h-3 w-64 bg-[var(--bg-dark)] rounded animate-pulse mb-4" />
      <div className="h-12 bg-[var(--bg-dark)] rounded-full animate-pulse mb-4" />
      <div className="hidden sm:grid sm:grid-cols-12 gap-4">
        <div className="sm:col-span-3 grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[var(--bg-dark)] rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
        <div className="sm:col-span-6">
          <div className="aspect-square bg-[var(--bg-dark)] rounded-2xl animate-pulse" />
        </div>
        <div className="sm:col-span-3 grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[var(--bg-dark)] rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
