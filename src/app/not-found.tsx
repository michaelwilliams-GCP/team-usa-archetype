import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07101f] px-6 text-white">
      <div className="w-full max-w-lg rounded-lg border border-white/12 bg-[#0a1424] p-6 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold text-[#f6c756]">404</p>
        <h1 className="mt-2 text-5xl font-black">Route off the board</h1>
        <p className="mt-4 leading-7 text-slate-300">
          This page is not part of the Team USA Archetype Lab product surface.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-[#f6c756] px-5 py-3 font-black text-[#08111f] transition hover:bg-white"
        >
          Return to lab
        </Link>
      </div>
    </main>
  );
}
