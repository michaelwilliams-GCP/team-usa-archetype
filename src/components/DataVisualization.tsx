'use client';

import { useMemo } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip,
} from 'chart.js';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';
import type { SportStatMap, SportStats } from '@/useOlympicData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ScatterController,
  PointElement,
  LineElement,
);

type CompleteMetricStats = SportStats & {
  avgHeight: number;
  avgWeight: number;
};

type ScatterPoint = {
  x: number;
  y: number;
  sport: string;
  medalRate: number;
  athleteCount: number;
};

function hasBodyMetrics(entry: [string, SportStats]): entry is [string, CompleteMetricStats] {
  const [, stats] = entry;
  return stats.avgHeight != null && stats.avgWeight != null && stats.athleteCount > 10;
}

export function DataVisualization({ data, theme = 'dark' }: { data: SportStatMap | null; theme?: 'dark' | 'light' }) {
  const prepared = useMemo(() => {
    if (!data) return null;

    const entries = Object.entries(data);
    const scatterPoints: ScatterPoint[] = entries.filter(hasBodyMetrics).map(([sport, stats]) => ({
      x: stats.avgHeight,
      y: stats.avgWeight,
      sport,
      medalRate: stats.medalRate,
      athleteCount: stats.athleteCount,
    }));

    const topSports = entries
      .filter(([, stats]) => stats.athleteCount > 5)
      .sort((a, b) => b[1].medalRate - a[1].medalRate)
      .slice(0, 12);

    const totalAthletes = entries.reduce((sum, [, stats]) => sum + stats.athleteCount, 0);
    const medalRates = entries.filter(([, stats]) => stats.athleteCount > 20).map(([, stats]) => stats.medalRate);
    const averageMedalRate =
      medalRates.length > 0
        ? Math.round((medalRates.reduce((sum, rate) => sum + rate, 0) / medalRates.length) * 100)
        : 0;

    return {
      scatterPoints,
      topSports,
      totalAthletes,
      averageMedalRate,
    };
  }, [data]);

  if (!data || !prepared) return null;

  const chartColors =
    theme === 'light'
      ? {
          point: '#bf0d3e',
          pointBorder: '#161616',
          bar: '#bf0d3e',
          tick: '#4d4d4d',
          title: '#242424',
          grid: '#d6cdbb',
          tooltipBg: '#ffffff',
          tooltipText: '#161616',
          tooltipBorder: '#805500',
        }
      : {
          point: '#f6c756',
          pointBorder: '#f8fafc',
          bar: '#bf0d3e',
          tick: '#c9c9c9',
          title: '#f2f2f2',
          grid: '#303030',
          tooltipBg: '#101010',
          tooltipText: '#f8fafc',
          tooltipBorder: '#f6c756',
        };

  const scatterData: ChartData<'scatter', ScatterPoint[]> = {
    datasets: [
      {
        label: 'Team USA sport profile',
        data: prepared.scatterPoints,
        backgroundColor: chartColors.point,
        borderColor: chartColors.pointBorder,
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const scatterOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        bodyColor: chartColors.tooltipText,
        titleColor: chartColors.tooltipText,
        borderColor: chartColors.tooltipBorder,
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<'scatter'>) => {
            const point = context.raw as ScatterPoint;
            return [
              `${point.sport}`,
              `Height: ${point.x.toFixed(1)} cm`,
              `Weight: ${point.y.toFixed(1)} kg`,
              `Medal rate: ${(point.medalRate * 100).toFixed(1)}%`,
              `Athletes: ${point.athleteCount.toLocaleString()}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Average height (cm)',
          color: chartColors.title,
        },
        ticks: { color: chartColors.tick },
        grid: { color: chartColors.grid },
      },
      y: {
        title: {
          display: true,
          text: 'Average weight (kg)',
          color: chartColors.title,
        },
        ticks: { color: chartColors.tick },
        grid: { color: chartColors.grid },
      },
    },
  };

  const barData: ChartData<'bar', number[], string> = {
    labels: prepared.topSports.map(([sport]) => sport),
    datasets: [
      {
        label: 'Medal rate',
        data: prepared.topSports.map(([, stats]) => Math.round(stats.medalRate * 100)),
        backgroundColor: chartColors.bar,
        borderColor: chartColors.pointBorder,
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        bodyColor: chartColors.tooltipText,
        titleColor: chartColors.tooltipText,
        borderColor: chartColors.tooltipBorder,
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `${context.parsed.y}% medal rate`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: chartColors.tick },
        grid: { color: chartColors.grid },
        title: {
          display: true,
          text: 'Medal rate (%)',
          color: chartColors.title,
        },
      },
      x: {
        ticks: {
          color: chartColors.tick,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { display: false },
      },
    },
  };

  return (
    <section className="content-visibility-auto mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 border-y border-[color:var(--border)] py-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent-text)]">Historical data board</p>
          <h2 className="mt-1 text-3xl font-black text-[var(--foreground)] sm:text-5xl">Team USA athlete profiles</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
          <div className="rounded-md border border-[color:var(--border)] bg-[var(--panel)] p-3">
            <div className="text-xl font-black text-[var(--foreground)]">{Object.keys(data).length}</div>
            <div className="text-xs font-semibold text-[var(--faint)]">Sports</div>
          </div>
          <div className="rounded-md border border-[color:var(--border)] bg-[var(--panel)] p-3">
            <div className="text-xl font-black text-[var(--foreground)]">{prepared.totalAthletes.toLocaleString()}</div>
            <div className="text-xs font-semibold text-[var(--faint)]">Entries</div>
          </div>
          <div className="rounded-md border border-[color:var(--border)] bg-[var(--panel)] p-3">
            <div className="text-xl font-black text-[var(--foreground)]">{prepared.averageMedalRate}%</div>
            <div className="text-xs font-semibold text-[var(--faint)]">Avg rate</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[var(--foreground)]">Height and weight map</h3>
              <p className="text-sm text-[var(--faint)]">Each point represents a sport average across Team USA history.</p>
            </div>
            <span className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm font-black text-[var(--accent-text)]">
              {prepared.scatterPoints.length} plotted
            </span>
          </div>
          <div className="h-[420px] rounded-md bg-[var(--chart-bg)] p-3">
            <Scatter data={scatterData} options={scatterOptions} />
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]">
          <h3 className="text-2xl font-black text-[var(--foreground)]">Medal rate leaders</h3>
          <p className="mt-1 text-sm text-[var(--faint)]">Top sports with enough historical entries for comparison.</p>
          <div className="mt-4 h-[420px] rounded-md bg-[var(--chart-bg)] p-3">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-[color:var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--info-text)]">Looker Studio companion board</p>
            <h3 className="mt-1 text-2xl font-black text-[var(--foreground)]">Peak performance dashboard</h3>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
            The embedded report keeps the broader athlete trend story available without slowing down the profile workflow.
          </p>
        </div>
        <div className="mt-4 overflow-hidden rounded-md border border-[color:var(--border)] bg-[var(--chart-bg)]">
          <iframe
            title="Team USA Looker Studio dashboard"
            src="https://datastudio.google.com/embed/reporting/9358d7e9-222a-4cec-b861-11cd2b8d02de/page/0QjxF"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </section>
  );
}
