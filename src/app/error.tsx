'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-8 text-[var(--foreground)]">
      <div className="max-w-md rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-6 text-center shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-[var(--accent-text)]">Runtime exception</p>
        <h2 className="mt-2 text-4xl font-black text-[var(--foreground)]">Something went wrong</h2>
        <p className="mt-4 text-[var(--muted)]">An unexpected error interrupted the analysis surface.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-[var(--accent-solid)] px-6 py-3 font-black text-[var(--accent-contrast)] transition hover:brightness-105"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
