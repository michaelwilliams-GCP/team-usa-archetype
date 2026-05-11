'use client';

import { useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useParityData, type ParityStats } from '@/useParityData';
import { useTheme } from '@/useTheme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

type TabId = 'overview' | 'timeline' | 'sports' | 'method';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'sports', label: 'Sport Comparison' },
  { id: 'method', label: 'Method' },
];

function averageMetric(stats: ParityStats | null, field: 'avgHeight' | 'avgWeight' | 'avgAge') {
  const values = Object.values(stats?.sports ?? {})
    .map((sport) => sport[field])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function chartTheme(theme: 'dark' | 'light') {
  return theme === 'light'
    ? {
        olympic: '#bf0d3e',
        paralympic: '#002868',
        tick: '#333333',
        grid: '#c6cfdd',
        tooltipBg: '#ffffff',
        tooltipText: '#111111',
      }
    : {
        olympic: '#ffffff',
        paralympic: '#8ad7ff',
        tick: '#c9c9c9',
        grid: '#343a4d',
        tooltipBg: '#0d0f17',
        tooltipText: '#f8fafc',
      };
}

function LoadingState({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
      <div className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-[var(--accent-text)]">{label}</p>
      </div>
    </main>
  );
}

function StatCard({ title, olympic, paralympic }: { title: string; olympic: number | string; paralympic: number | string }) {
  return (
    <article className="usa-card rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 pt-7 shadow-[var(--shadow)]">
      <h3 className="text-lg font-black text-[var(--foreground)]">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-4">
          <div className="text-2xl font-black text-[var(--accent-text)]">{olympic}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--faint)]">Olympic</div>
        </div>
        <div className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-4">
          <div className="text-2xl font-black text-[var(--info-text)]">{paralympic}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--faint)]">Paralympic sample</div>
        </div>
      </div>
    </article>
  );
}

export default function ParityPage() {
  const { olympicStats, paralympicStats, loading, error } = useParityData();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [theme] = useTheme();

  const colors = chartTheme(theme);

  const timelineData = useMemo<ChartData<'line', number[], string>>(() => {
    const olympicYears = Object.keys(olympicStats?.byYear ?? {});
    const paralympicYears = Object.keys(paralympicStats?.byYear ?? {});
    const labels = [...new Set([...olympicYears, ...paralympicYears])].sort();

    return {
      labels,
      datasets: [
        {
          label: 'Olympic entries',
          data: labels.map((year) => olympicStats?.byYear?.[year]?.total ?? 0),
          borderColor: colors.olympic,
          backgroundColor: colors.olympic,
          tension: 0.25,
        },
        {
          label: 'Paralympic sample entries',
          data: labels.map((year) => paralympicStats?.byYear?.[year]?.total ?? 0),
          borderColor: colors.paralympic,
          backgroundColor: colors.paralympic,
          tension: 0.25,
        },
      ],
    };
  }, [colors.olympic, colors.paralympic, olympicStats, paralympicStats]);

  const sportData = useMemo<ChartData<'bar', number[], string>>(() => {
    const sports = [
      ...new Set([...Object.keys(olympicStats?.sports ?? {}), ...Object.keys(paralympicStats?.sports ?? {})]),
    ]
      .filter((sport) => (olympicStats?.sports?.[sport]?.athleteCount ?? 0) + (paralympicStats?.sports?.[sport]?.athleteCount ?? 0) > 0)
      .slice(0, 12);

    return {
      labels: sports,
      datasets: [
        {
          label: 'Olympic entries',
          data: sports.map((sport) => olympicStats?.sports?.[sport]?.athleteCount ?? 0),
          backgroundColor: colors.olympic,
        },
        {
          label: 'Paralympic sample entries',
          data: sports.map((sport) => paralympicStats?.sports?.[sport]?.athleteCount ?? 0),
          backgroundColor: colors.paralympic,
        },
      ],
    };
  }, [colors.olympic, colors.paralympic, olympicStats, paralympicStats]);

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: colors.tick } },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        bodyColor: colors.tooltipText,
        titleColor: colors.tooltipText,
        borderColor: colors.olympic,
        borderWidth: 1,
      },
    },
    scales: {
      x: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
      y: { ticks: { color: colors.tick }, grid: { color: colors.grid }, beginAtZero: true },
    },
  };

  if (loading) return <LoadingState label="Loading parity data" />;
  if (error) return <LoadingState label={`Parity data error: ${error}`} />;

  const overview = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Total Entries" olympic={olympicStats?.totalAthletes ?? 0} paralympic={paralympicStats?.totalAthletes ?? 0} />
      <StatCard title="Sports Indexed" olympic={olympicStats?.totalSports ?? 0} paralympic={paralympicStats?.totalSports ?? 0} />
      <StatCard title="Avg Height (cm)" olympic={averageMetric(olympicStats, 'avgHeight')} paralympic={averageMetric(paralympicStats, 'avgHeight')} />
      <StatCard title="Avg Weight (kg)" olympic={averageMetric(olympicStats, 'avgWeight')} paralympic={averageMetric(paralympicStats, 'avgWeight')} />
      <StatCard title="Avg Age" olympic={averageMetric(olympicStats, 'avgAge')} paralympic={averageMetric(paralympicStats, 'avgAge')} />
      <StatCard title="Olympic Medal Estimate" olympic={olympicStats?.totalMedals ?? 0} paralympic="Not modeled" />
    </div>
  );

  const timeline = (
    <section className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
      <h2 className="text-2xl font-black text-[var(--foreground)]">Participation Timeline</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Olympic values come from the generated aggregate summary; Paralympic values use the repository sample file.
      </p>
      <div className="mt-5 h-[420px] rounded-md bg-[var(--chart-bg)] p-3">
        <Line data={timelineData} options={chartOptions as ChartOptions<'line'>} />
      </div>
    </section>
  );

  const sports = (
    <section className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
      <h2 className="text-2xl font-black text-[var(--foreground)]">Sport-Level Comparison</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        This chart compares shared sport labels where both datasets expose usable aggregate rows.
      </p>
      <div className="mt-5 h-[420px] rounded-md bg-[var(--chart-bg)] p-3">
        <Bar data={sportData} options={chartOptions as ChartOptions<'bar'>} />
      </div>
    </section>
  );

  const method = (
    <section className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
      <h2 className="text-2xl font-black text-[var(--foreground)]">Parity Method</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ['Aggregate only', 'The page avoids athlete names and uses sport-level counts, averages, and sample rows.'],
          ['Equal prominence', 'Olympic and Paralympic panels use the same card structure and visual hierarchy.'],
          ['No prediction claim', 'The comparison explains dataset coverage and does not claim future selection or performance.'],
        ].map(([title, body]) => (
          <article key={title} className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-4">
            <h3 className="font-black text-[var(--accent-text)]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-12 text-[var(--foreground)] md:px-8">
      <div className="stadium-grid fixed inset-0 -z-10" />
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm font-black uppercase text-[var(--accent-text)]">Olympic and Paralympic parity</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black leading-none text-[var(--foreground)]">Performance Parity Board</h1>
          <div className="usa-rule mt-5 h-2 max-w-xl rounded-full" />
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            A side-by-side aggregate view that keeps Olympic and Paralympic profile data equally visible while avoiding
            individual athlete identity claims.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md border px-4 py-2 font-semibold transition ${
                activeTab === tab.id
                  ? 'border-[color:var(--accent-solid)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'border-[color:var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:border-[color:var(--border-strong)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && overview}
        {activeTab === 'timeline' && timeline}
        {activeTab === 'sports' && sports}
        {activeTab === 'method' && method}
      </div>
    </main>
  );
}
