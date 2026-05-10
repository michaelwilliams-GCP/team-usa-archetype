import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <div className="w-full max-w-lg rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-[var(--accent-text)]">404</p>
        <h1 className="mt-2 text-5xl font-black">Route off the board</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          This page is not part of the Team USA Archetype Lab product surface.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-[var(--accent-solid)] px-5 py-3 font-black text-[var(--accent-contrast)] transition hover:brightness-105"
        >
          Return to lab
        </Link>
      </div>
    </main>
  );
}
