export default function StudioLoading() {
  return (
    <div className="px-4 sm:px-5 max-w-7xl mx-auto">
      <div className="h-7 w-40 bg-[var(--bg-dark)] rounded animate-pulse mb-3" />
      <div className="h-3 w-64 bg-[var(--bg-dark)] rounded animate-pulse mb-5" />
      <div className="h-12 bg-[var(--bg-dark)] rounded-2xl animate-pulse mb-5" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-[var(--bg-dark)] rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="aspect-square bg-[var(--bg-dark)] rounded-2xl animate-pulse" />
          <div className="h-48 bg-[var(--bg-dark)] rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
