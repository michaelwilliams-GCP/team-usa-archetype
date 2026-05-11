'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/useTheme';

export function Nav() {
  const [theme, setTheme] = useTheme();
  const pathname = usePathname();

  const links = [
    ['/', 'Archetype Finder'],
    ['/parity', 'Performance Parity'],
    ['/hubs', 'Regional Hubs'],
    ['/momentum', 'LA28 Momentum'],
  ] as const;

  return (
    <nav className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[var(--panel)]/95 text-[var(--foreground)] shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="field-stripe h-1" />
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3 transition hover:text-[var(--accent-text)]">
            <span className="grid h-10 w-10 shrink-0 grid-cols-2 overflow-hidden rounded-md border border-[color:var(--border-strong)] bg-[var(--usa-blue)]">
              <span className="bg-[var(--usa-blue)]" />
              <span className="bg-[var(--usa-red)]" />
              <span className="bg-[var(--stripe-white)]" />
              <span className="bg-[var(--usa-blue)]" />
            </span>
            <span className="leading-none">
              <span className="block text-xs font-black uppercase text-[var(--accent-text)]">Team USA</span>
              <span className="block text-2xl font-black text-[var(--foreground)] group-hover:text-[var(--accent-text)]">
                Archetype Lab
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-pressed={theme === 'light'}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="grid h-10 grid-cols-2 overflow-hidden rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] text-sm font-black text-[var(--foreground)] transition hover:border-[color:var(--accent-solid)]"
          >
            <span
              className={`flex items-center px-3 transition ${
                theme === 'dark' ? 'bg-[var(--usa-blue)] text-white' : 'text-[var(--faint)]'
              }`}
            >
              Dark
            </span>
            <span
              className={`flex items-center px-3 transition ${
                theme === 'light' ? 'bg-[var(--usa-red)] text-white' : 'text-[var(--faint)]'
              }`}
            >
              Light
            </span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                pathname === href
                  ? 'border-[color:var(--accent-solid)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'border-[color:var(--border)] bg-[var(--panel-strong)] text-[var(--foreground)] hover:border-[color:var(--accent-solid)] hover:text-[var(--accent-text)]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
