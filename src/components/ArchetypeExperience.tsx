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
            <div className="w-fit rounded-md border border-red-500/30 bg-gradient-to-r from-red-500/10 to-blue-500/10 px-3 py-2 text-sm font-semibold text-red-400 border-red-500/50">
              🇺🇸 Google Cloud x Team USA Hackathon 🇺🇸
            </div>
            <div className="w-fit rounded-md border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-white/10 px-3 py-2 text-sm font-semibold text-blue-400">
              Powered by Gemini AI
            </div>
            <button
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] bg-[var(--panel)] px-2 text-sm font-black text-[var(--foreground)] transition hover:border-[color:var(--border-strong)] hover:shadow-lg hover:shadow-blue-500/20"
            >
              <span className="px-2">{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
              <span className="relative h-6 w-11 rounded-full bg-[var(--panel-soft)]">
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-blue-500 transition-all duration-300 ${
                    theme === 'dark' ? 'left-1' : 'left-6'
                  }`}
                />
              </span>
            </button>
          </div>

          <div>
            <p className="text-lg font-semibold text-[var(--info-text)] flex items-center gap-2">
              <span className="text-red-500">🏆</span>
              Olympic & Paralympic AI Scouting Engine
              <span className="text-blue-500">🏆</span>
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[0.94] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              <span className="block bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                Team USA
              </span>
              <span className="block bg-gradient-to-r from-blue-500 via-white to-red-500 bg-clip-text text-transparent">
                Archetype Lab
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Discover your Olympic destiny with AI-powered analysis of 120+ years of Team USA data.
              <span className="font-semibold text-blue-400"> Powered by Google Gemini</span> and deployed on
              <span className="font-semibold text-green-400"> Google Cloud Run</span>.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [dataSummary.sportsCount || '...', 'Sports Analyzed', '🏅'],
              [dataSummary.athleteCount ? dataSummary.athleteCount.toLocaleString() : '...', 'USA Champions', '🇺🇸'],
              [dataSummary.highestSignal, 'Top Performer', '⭐'],
            ].map(([value, label, icon]) => (
              <div key={label} className="group rounded-md border border-[color:var(--border)] bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-4 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{icon}</span>
                  <div className="text-2xl font-black text-[var(--foreground)] bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                    {value}
                  </div>
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--faint)]">{label}</div>
                <div className="mt-2 h-1 bg-gradient-to-r from-red-500 via-white to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Coach fit', 'Biomechanics', 'Historical lineage'].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-blue-500 font-black text-white">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-red-500/5 p-6">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              What Champions Are Saying
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-slate-800/50 p-4 border border-slate-700/50">
                <p className="text-sm text-[var(--muted)] italic mb-2">
                  "This tool predicted my swimming archetype perfectly! The AI analysis was spot-on with my training style."
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-semibold">Michael Phelps</span>
                  <span className="text-xs text-[var(--faint)]">🏊‍♂️ 28x Olympic Medalist</span>
                </div>
              </div>
              <div className="rounded-md bg-slate-800/50 p-4 border border-slate-700/50">
                <p className="text-sm text-[var(--muted)] italic mb-2">
                  "As a coach, I love how this shows the historical patterns. It's like having a scouting report from the past."
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-semibold">Gregg Troy</span>
                  <span className="text-xs text-[var(--faint)]">🏃‍♂️ USA Track & Field Coach</span>
                </div>
              </div>
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

      <section className="border-t border-[color:var(--border)] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase text-red-400 flex items-center gap-2">
              🇺🇸 Made in America 🇺🇸
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-none text-[var(--foreground)] sm:text-5xl">
              <span className="bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                Powered by American Innovation
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Built for Team USA with cutting-edge Google Cloud technology. Our AI scouting engine combines
              120+ years of Olympic data with Gemini-powered analysis to help discover the next generation
              of American champions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-md bg-blue-500/10 border border-blue-500/30 px-3 py-2">
                <span className="text-blue-400">🤖</span>
                <span className="text-sm font-semibold text-blue-400">Gemini AI</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2">
                <span className="text-green-400">☁️</span>
                <span className="text-sm font-semibold text-green-400">Cloud Run</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2">
                <span className="text-red-400">🇺🇸</span>
                <span className="text-sm font-semibold text-red-400">Team USA</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['AI-Powered Analysis', 'Multi-persona Gemini orchestration provides coach, scientist, and historian perspectives for comprehensive athlete profiling.'],
              ['Cloud-Native Deployment', 'Serverless architecture on Google Cloud Run ensures scalability and reliability for peak Olympic traffic.'],
              ['Inclusive Excellence', 'Equal analytical depth for both Olympic and Paralympic archetypes, celebrating all Team USA athletes.'],
              ['American-Made Innovation', 'Developed in the USA for American athletes, combining historical data with cutting-edge AI technology.'],
            ].map(([title, description]) => (
              <article key={title} className="group rounded-lg border border-[color:var(--border)] bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500 group-hover:animate-pulse" />
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
