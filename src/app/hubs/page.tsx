'use client';

import { useMemo, useState } from 'react';
import { useParityData } from '@/useParityData';

type HubDefinition = {
  hubs: string[];
  climate: string;
  description: string;
};

type SportHub = HubDefinition & {
  athletes: number;
};

const sportHubs: Record<string, HubDefinition> = {
  Swimming: {
    hubs: ['California', 'Florida', 'Texas'],
    climate: 'Coastal and subtropical',
    description: 'Pool access, open-water culture, and warm-weather training windows support broad participation.',
  },
  Athletics: {
    hubs: ['California', 'Texas', 'Florida'],
    climate: 'Varied',
    description: 'Large talent pools, year-round meets, and mixed terrain make these useful track and field anchors.',
  },
  Gymnastics: {
    hubs: ['California', 'Texas', 'Michigan'],
    climate: 'Indoor training',
    description: 'Dense club networks and all-season indoor facilities support early technical development.',
  },
  Skiing: {
    hubs: ['Colorado', 'Utah', 'California'],
    climate: 'Mountain and alpine',
    description: 'Altitude, snow access, and winter-sport infrastructure create natural training advantages.',
  },
  Basketball: {
    hubs: ['California', 'North Carolina', 'Indiana'],
    climate: 'Indoor training',
    description: 'Deep scholastic and club ecosystems produce frequent competitive reps across levels.',
  },
  Rowing: {
    hubs: ['California', 'Washington', 'Connecticut'],
    climate: 'Coastal and temperate',
    description: 'Waterway access and established clubs make these regions practical rowing development centers.',
  },
  Cycling: {
    hubs: ['Colorado', 'California', 'Texas'],
    climate: 'Mountain and varied',
    description: 'Road, track, and elevation variety give cyclists different preparation environments.',
  },
  Wrestling: {
    hubs: ['Iowa', 'Pennsylvania', 'Oklahoma'],
    climate: 'Indoor training',
    description: 'Strong scholastic traditions and regional competition density support wrestler development.',
  },
  Volleyball: {
    hubs: ['California', 'Hawaii', 'Florida'],
    climate: 'Coastal and indoor',
    description: 'Beach and indoor pathways both contribute to a wide volleyball participation base.',
  },
  Boxing: {
    hubs: ['California', 'New York', 'Texas'],
    climate: 'Urban and varied',
    description: 'Gym density and city competition circuits create consistent sparring and coaching access.',
  },
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

export default function HubsPage() {
  const { olympicStats, paralympicStats, loading, error } = useParityData();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const enrichedHubs = useMemo<Record<string, SportHub>>(() => {
    return Object.fromEntries(
      Object.entries(sportHubs).map(([sport, hub]) => {
        const olympicCount = olympicStats?.sports?.[sport]?.athleteCount ?? 0;
        const paralympicCount = paralympicStats?.sports?.[sport]?.athleteCount ?? 0;
        return [sport, { ...hub, athletes: olympicCount + paralympicCount }];
      }),
    );
  }, [olympicStats, paralympicStats]);

  const allSports = useMemo(
    () =>
      Object.keys(enrichedHubs)
        .filter((sport) => enrichedHubs[sport].athletes > 0)
        .sort((a, b) => enrichedHubs[b].athletes - enrichedHubs[a].athletes),
    [enrichedHubs],
  );

  if (loading) return <LoadingState label="Loading hub data" />;
  if (error) return <LoadingState label={`Hub data error: ${error}`} />;

  const selectedHub = selectedSport ? enrichedHubs[selectedSport] : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-12 text-[var(--foreground)] md:px-8">
      <div className="stadium-grid fixed inset-0 -z-10" />
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.52fr)] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[var(--accent-text)]">American regional pipeline</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-none text-[var(--foreground)] sm:text-6xl">
              Hometown Success Engine
            </h1>
            <div className="usa-rule mt-5 h-2 max-w-xl rounded-full" />
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              A judge-friendly regional lens for exploring where climate, facilities, and local sport culture can support
              Team USA development pathways. These are aggregate hub hypotheses, not individual athlete claims.
            </p>
          </div>
          <aside className="usa-card rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 pt-7 shadow-[var(--shadow)]">
            <p className="text-sm font-black uppercase text-[var(--info-text)]">Coverage</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-3xl font-black text-[var(--foreground)]">{allSports.length}</div>
                <div className="text-sm font-semibold text-[var(--faint)]">Hub sports</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[var(--foreground)]">
                  {allSports.reduce((sum, sport) => sum + enrichedHubs[sport].athletes, 0).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-[var(--faint)]">Indexed entries</div>
              </div>
            </div>
          </aside>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="grid gap-4 md:grid-cols-2">
            {allSports.map((sport) => {
              const hub = enrichedHubs[sport];
              const active = selectedSport === sport;

              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSelectedSport(active ? null : sport)}
                  className={`usa-card min-h-52 rounded-lg border bg-[var(--panel)] p-5 pt-7 text-left shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-solid)] ${
                    active ? 'border-[color:var(--accent-solid)]' : 'border-[color:var(--border)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[var(--foreground)]">{sport}</h2>
                      <p className="mt-1 text-sm font-black uppercase text-[var(--accent-text)]">
                        {hub.athletes.toLocaleString()} Team USA entries
                      </p>
                    </div>
                    <span className="rounded-md bg-[var(--usa-blue)] px-3 py-2 text-sm font-black text-white">
                      {hub.hubs.length} hubs
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{hub.description}</p>
                  <p className="mt-4 text-sm font-semibold text-[var(--info-text)]">{hub.climate}</p>
                </button>
              );
            })}
          </section>

          <aside className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)] lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-black uppercase text-[var(--accent-text)]">
              {selectedSport ? `${selectedSport} hub map` : 'Select a sport'}
            </p>
            <h2 className="mt-2 text-3xl font-black text-[var(--foreground)]">
              {selectedSport ?? 'Regional details'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {selectedHub
                ? selectedHub.description
                : 'Choose a sport card to see the hub states and contextual training conditions.'}
            </p>

            <div className="mt-5 space-y-3">
              {(selectedHub?.hubs ?? ['California', 'Colorado', 'Florida']).map((hub, index) => (
                <div key={hub} className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${index === 1 ? 'bg-[var(--stripe-white)]' : index === 2 ? 'bg-[var(--usa-blue)]' : 'bg-[var(--usa-red)]'}`} />
                    <h3 className="text-lg font-black text-[var(--foreground)]">{hub}</h3>
                  </div>
                  <p className="mt-2 text-sm text-[var(--faint)]">{selectedHub?.climate ?? 'Representative Team USA hub'}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-[color:var(--usa-blue)] bg-[var(--info-soft)] p-4">
              <p className="text-sm font-semibold leading-6 text-[var(--info-text)]">
                Hub correlations combine available aggregate sport counts with geographic context. They should guide
                demo exploration, not imply causation or selection certainty.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
