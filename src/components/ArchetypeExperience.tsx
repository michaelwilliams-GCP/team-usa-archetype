'use client';

import { useMemo } from 'react';
import { AthleteForm } from '@/components/AthleteForm';
import { DataVisualization } from '@/components/DataVisualization';
import { useOlympicData } from '@/useOlympicData';

export function ArchetypeExperience() {
  const { sportStats, loading, error, findClosestSports } = useOlympicData();

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
    <main className="relative min-h-screen overflow-hidden bg-[#07101f] text-white">
      <div className="stadium-grid fixed inset-0 -z-20" />
      <div className="field-stripe fixed inset-x-0 top-0 z-10 h-1" />

      <section className="mx-auto grid min-h-[92vh] min-w-0 max-w-7xl gap-8 px-4 pb-10 pt-10 md:px-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(440px,1.12fr)] lg:items-center">
        <div className="min-w-0 space-y-7">
          <div className="w-fit rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-[#f6c756]">
            Google Cloud x Team USA Hackathon
          </div>

          <div>
            <p className="text-lg font-semibold text-[#8ad7ff]">Olympic and Paralympic profile engine</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[0.94] text-white sm:text-6xl lg:text-7xl">
              <span className="block">Team USA</span>
              <span className="block">Archetype Lab</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
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
              <div key={label} className="rounded-md border border-white/10 bg-white/[0.05] p-4">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-sm font-semibold text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/12 bg-[#0a1424]/80 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Coach fit', 'Biomechanics', 'Historical lineage'].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f6c756] font-black text-[#08111f]">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-slate-100">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-[#bf0d3e]/35 bg-[#bf0d3e]/12 p-4 text-sm text-red-100">
              Dataset load warning: {error}
            </div>
          )}
        </div>

        <AthleteForm data={sportStats} loading={loading} findClosestSports={findClosestSports} />
      </section>

      <DataVisualization data={sportStats} />
    </main>
  );
}
