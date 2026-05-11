'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParityData } from '@/useParityData';

type MomentumResult = {
  sport: string;
  momentumScore: number;
  growthTrajectory: string;
  keyMilestones: string[];
  preparationStatus: string;
  analysis: string;
};

function LoadingState({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
      <div className="usa-card rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-6 pt-7 shadow-[var(--shadow)]">
        <p className="text-sm font-black uppercase text-[var(--accent-text)]">{label}</p>
      </div>
    </main>
  );
}

function scoreTone(score: number) {
  if (score >= 80) {
    return {
      label: 'High momentum',
      color: 'var(--success-text)',
      soft: 'var(--success-soft)',
      border: 'var(--success-text)',
    };
  }

  if (score >= 60) {
    return {
      label: 'Building',
      color: 'var(--accent-text)',
      soft: 'var(--accent-soft)',
      border: 'var(--accent-solid)',
    };
  }

  return {
    label: 'Developing',
    color: 'var(--danger-text)',
    soft: 'var(--danger-soft)',
    border: 'var(--usa-red)',
  };
}

export default function MomentumPage() {
  const { olympicStats, paralympicStats, loading, error } = useParityData();
  const [momentumData, setMomentumData] = useState<MomentumResult[]>([]);
  const [loadingMomentum, setLoadingMomentum] = useState(false);
  const [momentumError, setMomentumError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const sports = useMemo(() => {
    const counts = new Map<string, number>();

    for (const [sport, stats] of Object.entries(olympicStats?.sports ?? {})) {
      counts.set(sport, (counts.get(sport) ?? 0) + stats.athleteCount);
    }

    for (const [sport, stats] of Object.entries(paralympicStats?.sports ?? {})) {
      counts.set(sport, (counts.get(sport) ?? 0) + stats.athleteCount);
    }

    return [...counts.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([sport]) => sport);
  }, [olympicStats, paralympicStats]);

  useEffect(() => {
    if (!sports.length) return;

    let cancelled = false;
    const controller = new AbortController();

    async function fetchMomentum() {
      setLoadingMomentum(true);
      setMomentumError(null);

      try {
        const response = await fetch('/api/momentum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sports),
          signal: controller.signal,
        });

        const data = (await response.json()) as { results?: MomentumResult[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? `Momentum route returned ${response.status}`);
        if (!Array.isArray(data.results)) throw new Error('Momentum route returned an invalid payload');

        const sorted = [...data.results].sort((a, b) => b.momentumScore - a.momentumScore);
        if (!cancelled) setMomentumData(sorted);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (!cancelled) setMomentumError(err instanceof Error ? err.message : 'Momentum analysis failed');
      } finally {
        if (!cancelled) setLoadingMomentum(false);
      }
    }

    fetchMomentum();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sports]);

  if (loading) return <LoadingState label="Loading Team USA momentum data" />;
  if (error) return <LoadingState label={`Momentum data error: ${error}`} />;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-12 text-[var(--foreground)] md:px-8">
      <div className="stadium-grid fixed inset-0 -z-10" />
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.52fr)] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[var(--accent-text)]">Road to LA28</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-none text-[var(--foreground)] sm:text-6xl">
              Team USA Momentum Board
            </h1>
            <div className="usa-rule mt-5 h-2 max-w-xl rounded-full" />
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              A deterministic demo-safe momentum view for the highest-coverage Olympic and Paralympic sport labels,
              with Gemini enrichment available when credentials are configured.
            </p>
          </div>
          <aside className="usa-card rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 pt-7 shadow-[var(--shadow)]">
            <p className="text-sm font-black uppercase text-[var(--info-text)]">Signal status</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-3xl font-black text-[var(--foreground)]">{sports.length}</div>
                <div className="text-sm font-semibold text-[var(--faint)]">Sports scored</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[var(--foreground)]">
                  {loadingMomentum ? '...' : momentumData[0]?.momentumScore ?? 0}
                </div>
                <div className="text-sm font-semibold text-[var(--faint)]">Top score</div>
              </div>
            </div>
          </aside>
        </header>

        {momentumError && (
          <div className="mb-6 rounded-md border border-[color:var(--usa-red)] bg-[var(--danger-soft)] p-4 text-sm font-semibold text-[var(--danger-text)]">
            {momentumError}
          </div>
        )}

        <section className="mb-8 flex flex-wrap gap-3">
          {[
            ['High momentum', '80+'],
            ['Building', '60-79'],
            ['Developing', 'Below 60'],
          ].map(([label, range], index) => (
            <div key={label} className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-[var(--panel)] px-3 py-2">
              <span className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-[var(--success-text)]' : index === 1 ? 'bg-[var(--usa-red)]' : 'bg-[var(--usa-blue)]'}`} />
              <span className="text-sm font-black text-[var(--foreground)]">{label}</span>
              <span className="text-sm font-semibold text-[var(--faint)]">{range}</span>
            </div>
          ))}
        </section>

        {loadingMomentum ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="usa-card min-h-64 rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 pt-7 shadow-[var(--shadow)]">
                <div className="h-6 w-36 rounded-md bg-[var(--panel-soft)]" />
                <div className="mt-6 h-3 rounded-full bg-[var(--panel-soft)]" />
                <div className="mt-5 h-20 rounded-md bg-[var(--panel-strong)]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {momentumData.map((result, index) => {
              const tone = scoreTone(result.momentumScore);
              const active = selectedSport === result.sport;

              return (
                <button
                  key={result.sport}
                  type="button"
                  onClick={() => setSelectedSport(active ? null : result.sport)}
                  className="usa-card rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 pt-7 text-left shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-solid)]"
                  style={active ? { borderColor: tone.border } : undefined}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase text-[var(--faint)]">Rank {index + 1}</p>
                      <h2 className="mt-1 text-2xl font-black text-[var(--foreground)]">{result.sport}</h2>
                    </div>
                    <div className="shrink-0 rounded-md border px-3 py-2 text-center" style={{ borderColor: tone.border, backgroundColor: tone.soft }}>
                      <div className="text-3xl font-black" style={{ color: tone.color }}>
                        {result.momentumScore}
                      </div>
                      <div className="text-xs font-black uppercase" style={{ color: tone.color }}>
                        {tone.label}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-3 rounded-full bg-[var(--panel-soft)]">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${result.momentumScore}%`, backgroundColor: tone.border }}
                    />
                  </div>

                  <p className="mt-5 text-sm leading-6 text-[var(--muted)]">{result.growthTrajectory}</p>
                  <p className="mt-3 text-sm font-semibold text-[var(--info-text)]">{result.preparationStatus}</p>

                  {active && (
                    <div className="mt-5 border-t border-[color:var(--border)] pt-5">
                      <h3 className="text-lg font-black text-[var(--foreground)]">Preparation milestones</h3>
                      <ul className="mt-3 space-y-2">
                        {result.keyMilestones.slice(0, 5).map((milestone) => (
                          <li key={milestone} className="flex gap-2 text-sm leading-6 text-[var(--muted)]">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--usa-red)]" />
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-3 text-sm leading-6 text-[var(--muted)]">
                        {result.analysis}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <section className="mt-12 rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
          <p className="text-sm font-black uppercase text-[var(--accent-text)]">Model note</p>
          <h2 className="mt-2 text-3xl font-black text-[var(--foreground)]">Momentum is a planning signal, not a promise.</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--muted)]">
            Scores use deterministic local fallback data when Gemini is unavailable and AI-generated enrichment when a
            server-side API key is present. The board ranks relative preparation signals for demo exploration only.
          </p>
        </section>
      </div>
    </main>
  );
}
