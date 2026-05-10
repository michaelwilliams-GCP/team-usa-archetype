'use client';

import { useEffect, useMemo, useState } from 'react';
import { AthleteForm } from '@/components/AthleteForm';
import { DataVisualization } from '@/components/DataVisualization';
import { useOlympicData } from '@/useOlympicData';

type Theme = 'dark' | 'light';

export function ArchetypeExperience() {
  const { sportStats, loading, error, findClosestSports } = useOlympicData();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const storedTheme = window.localStorage.getItem('team-usa-archetype-theme');
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('team-usa-archetype-theme', theme);
  }, [theme]);

  const dataSummary = useMemo(() => {
    if (!sportStats) {
      return {
        sportsCount: 0,
        athleteCount: 0,
        highestSignal: 'Loading',
      };
    }

    const entries = Object.entries(sportStats);
    const highestSignal =
      [...entries]
        .filter(([, stats]) => stats.athleteCount > 20)
        .sort((a, b) => b[1].medalRate - a[1].medalRate)[0]?.[0] ?? 'Team USA';

    return {
      sportsCount: entries.length,
      athleteCount: entries.reduce((sum, [, stats]) => sum + stats.athleteCount, 0),
      highestSignal,
    };
  }, [sportStats]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="stadium-grid fixed inset-0 -z-20" />
      <div className="field-stripe fixed inset-x-0 top-0 z-10 h-1" />

      <section className="mx-auto grid min-h-[92vh] min-w-0 max-w-7xl gap-8 px-4 pb-10 pt-10 md:px-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(440px,1.12fr)] lg:items-center">
        <div className="min-w-0 space-y-7">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-fit rounded-md border border-[color:var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-semibold text-[var(--accent-text)]">
              Google Cloud x Team USA Hackathon
            </div>
            <button
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] bg-[var(--panel)] px-2 text-sm font-black text-[var(--foreground)] transition hover:border-[color:var(--border-strong)]"
            >
              <span className="px-2">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              <span className="relative h-6 w-11 rounded-full bg-[var(--panel-soft)]">
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-[var(--accent-solid)] transition ${
                    theme === 'dark' ? 'left-1' : 'left-6'
                  }`}
                />
              </span>
            </button>
          </div>

          <div>
            <p className="text-lg font-semibold text-[var(--info-text)]">Olympic and Paralympic profile engine</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[0.94] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              <span className="block">Team USA</span>
              <span className="block">Archetype Lab</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              A scouting-room interface for matching a fan profile against historical Team USA body metrics, medal patterns,
              and specialist AI analysis.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [dataSummary.sportsCount || '...', 'Sports indexed'],
              [dataSummary.athleteCount ? dataSummary.athleteCount.toLocaleString() : '...', 'USA entries'],
              [dataSummary.highestSignal, 'Top signal'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-[color:var(--border)] bg-[var(--panel)] p-4">
                <div className="text-2xl font-black text-[var(--foreground)]">{value}</div>
                <div className="mt-1 text-sm font-semibold text-[var(--faint)]">{label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Coach fit', 'Biomechanics', 'Historical lineage'].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent-solid)] font-black text-[var(--accent-contrast)]">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-[color:var(--usa-red)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger-text)]">
              Dataset load warning: {error}
            </div>
          )}
        </div>

        <AthleteForm data={sportStats} loading={loading} findClosestSports={findClosestSports} />
      </section>

      <DataVisualization data={sportStats} theme={theme} />

      <section className="border-t border-[color:var(--border)] bg-[var(--panel)] px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase text-[var(--accent-text)]">Submission readiness</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-none text-[var(--foreground)] sm:text-5xl">
              Built as a complete Challenge 4 product.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              The app pairs a judge-ready local demo path with a production Cloud Run target, server-side Gemini analysis,
              aggregate-only data handling, and automated checks for the main product flow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Gemini server route', 'Persona panel runs behind /api/analyze with the API key kept off the client.'],
              ['Cloud Run deployable', 'Standalone Next.js container, Cloud Build config, and /api/health readiness endpoint.'],
              ['Paralympic parity', 'Each response includes a dedicated Paralympic archetype with equal result depth.'],
              ['Judge-safe fallback', 'Demo mode keeps the full flow usable when live credentials are not present.'],
            ].map(([title, description]) => (
              <article key={title} className="rounded-lg border border-[color:var(--border)] bg-[var(--panel-strong)] p-5">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[var(--info-text)]" />
                  <h3 className="text-xl font-black text-[var(--foreground)]">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
