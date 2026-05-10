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

export function DataVisualization({ data }: { data: SportStatMap | null }) {
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

  const scatterData: ChartData<'scatter', ScatterPoint[]> = {
    datasets: [
      {
        label: 'Team USA sport profile',
        data: prepared.scatterPoints,
        backgroundColor: 'rgba(246, 199, 86, 0.74)',
        borderColor: 'rgba(255, 255, 255, 0.9)',
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
        backgroundColor: 'rgba(5, 10, 20, 0.94)',
        borderColor: 'rgba(246, 199, 86, 0.45)',
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
          color: '#dbeafe',
        },
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
      y: {
        title: {
          display: true,
          text: 'Average weight (kg)',
          color: '#dbeafe',
        },
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
    },
  };

  const barData: ChartData<'bar', number[], string> = {
    labels: prepared.topSports.map(([sport]) => sport),
    datasets: [
      {
        label: 'Medal rate',
        data: prepared.topSports.map(([, stats]) => Math.round(stats.medalRate * 100)),
        backgroundColor: 'rgba(191, 13, 62, 0.72)',
        borderColor: 'rgba(255, 255, 255, 0.82)',
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
        backgroundColor: 'rgba(5, 10, 20, 0.94)',
        borderColor: 'rgba(246, 199, 86, 0.45)',
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `${context.parsed.y}% medal rate`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
        title: {
          display: true,
          text: 'Medal rate (%)',
          color: '#dbeafe',
        },
      },
      x: {
        ticks: {
          color: '#cbd5e1',
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { display: false },
      },
    },
  };

  return (
    <section className="content-visibility-auto mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 border-y border-white/10 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f6c756]">Historical data board</p>
          <h2 className="mt-1 text-3xl font-black text-white sm:text-5xl">Team USA athlete profiles</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xl font-black text-white">{Object.keys(data).length}</div>
            <div className="text-xs font-semibold text-slate-400">Sports</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xl font-black text-white">{prepared.totalAthletes.toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-400">Entries</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xl font-black text-white">{prepared.averageMedalRate}%</div>
            <div className="text-xs font-semibold text-slate-400">Avg rate</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-white/12 bg-[#0a1424]/90 p-4 shadow-xl shadow-black/25">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">Height and weight map</h3>
              <p className="text-sm text-slate-400">Each point represents a sport average across Team USA history.</p>
            </div>
            <span className="rounded-md bg-[#f6c756]/12 px-3 py-2 text-sm font-black text-[#f6c756]">
              {prepared.scatterPoints.length} plotted
            </span>
          </div>
          <div className="h-[420px] rounded-md bg-[#07101f] p-3">
            <Scatter data={scatterData} options={scatterOptions} />
          </div>
        </div>

        <div className="rounded-lg border border-white/12 bg-[#0a1424]/90 p-4 shadow-xl shadow-black/25">
          <h3 className="text-2xl font-black text-white">Medal rate leaders</h3>
          <p className="mt-1 text-sm text-slate-400">Top sports with enough historical entries for comparison.</p>
          <div className="mt-4 h-[420px] rounded-md bg-[#07101f] p-3">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/12 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#8ad7ff]">Looker Studio companion board</p>
            <h3 className="mt-1 text-2xl font-black text-white">Peak performance dashboard</h3>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            The embedded report keeps the broader athlete trend story available without slowing down the profile workflow.
          </p>
        </div>
        <div className="mt-4 overflow-hidden rounded-md border border-white/10 bg-[#07101f]">
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
