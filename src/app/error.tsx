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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07101f] p-8 text-white">
      <div className="max-w-md rounded-lg border border-white/12 bg-[#0a1424] p-6 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold text-[#f6c756]">Runtime exception</p>
        <h2 className="mt-2 text-4xl font-black text-white">Something went wrong</h2>
        <p className="mt-4 text-slate-300">An unexpected error interrupted the analysis surface.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-[#f6c756] px-6 py-3 font-black text-[#08111f] transition hover:bg-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
