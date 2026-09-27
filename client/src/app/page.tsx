export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Studio<span className="text-indigo-400">North</span>
        </h1>
        <p className="text-lg sm:text-xl text-foreground/60 max-w-md mx-auto">
          Photo editing in the browser. Coming soon.
        </p>
        <div className="pt-4">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20">
            Phase 0 — Skeleton Running ✓
          </span>
        </div>
      </div>
    </main>
  );
}
