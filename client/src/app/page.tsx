import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Studio<span className="text-indigo-400">North</span>
        </h1>
        <p className="text-lg sm:text-xl text-foreground/60 max-w-md mx-auto">
          Photo editing in the browser. Fast, private, no upload required.
        </p>
        <div className="pt-2">
          <Link
            href="/editor"
            className="
              inline-flex items-center gap-2 px-6 py-3 rounded-xl
              bg-indigo-500 hover:bg-indigo-400 text-white font-medium
              transition-colors duration-150
              shadow-lg shadow-indigo-500/25
            "
          >
            Start Editing
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
