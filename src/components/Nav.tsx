import Link from 'next/link';

export function Nav() {
  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Team USA
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              Archetype Finder
            </Link>
            <Link href="/parity" className="text-slate-300 hover:text-white transition-colors">
              Performance Parity
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}