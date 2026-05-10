export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-[var(--accent-text)]">Team USA Archetype Lab</p>
        <h1 className="mt-2 text-4xl font-black">Loading the board</h1>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--panel-soft)]">
          <div className="h-full w-1/2 animate-scan bg-[var(--accent-solid)]" />
        </div>
      </div>
    </main>
  );
}
