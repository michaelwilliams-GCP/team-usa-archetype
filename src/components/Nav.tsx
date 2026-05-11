import Link from 'next/link';

export function Nav() {
  return (
    <nav className="bg-gradient-to-r from-red-600 via-white to-blue-600 backdrop-blur-xl border-b border-slate-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
            🇺🇸 Team USA
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-white hover:text-yellow-300 transition-colors font-semibold hover:scale-105 transition-transform">
              Archetype Finder
            </Link>
            <Link href="/parity" className="text-white hover:text-yellow-300 transition-colors font-semibold hover:scale-105 transition-transform">
              Performance Parity
            </Link>
            <Link href="/hubs" className="text-white hover:text-yellow-300 transition-colors font-semibold hover:scale-105 transition-transform">
              Hometown Success
            </Link>
            <Link href="/momentum" className="text-white hover:text-yellow-300 transition-colors font-semibold hover:scale-105 transition-transform">
              LA28 Momentum
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}