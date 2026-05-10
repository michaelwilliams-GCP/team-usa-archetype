'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  PointElement,
  LineElement
);

interface SportStats {
  avgHeight?: number;
  avgWeight?: number;
  athleteCount: number;
  medalRate: number;
  avgAge?: number;
}

interface SportsData {
  [sport: string]: SportStats;
}

export function DataVisualization({ data }: { data: SportsData | null }) {
  if (!data) return null;

  // Prepare data for height vs weight scatter plot
  const scatterData = {
    datasets: [{
      label: 'Team USA Athletes by Sport',
      data: Object.entries(data)
        .filter(([, stats]) => stats.avgHeight && stats.avgWeight && stats.athleteCount > 10)
        .map(([sport, stats]) => ({
          x: stats.avgHeight,
          y: stats.avgWeight,
          sport,
          medalRate: stats.medalRate,
          athleteCount: stats.athleteCount
        })),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: { size: 12, weight: '600' }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw;
            return [
              `Sport: ${point.sport}`,
              `Height: ${point.x.toFixed(1)} cm`,
              `Weight: ${point.y.toFixed(1)} kg`,
              `Medal Rate: ${(point.medalRate * 100).toFixed(1)}%`,
              `Athletes: ${point.athleteCount}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Average Height (cm)',
          color: '#e2e8f0'
        },
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(203, 213, 225, 0.1)' }
      },
      y: {
        title: {
          display: true,
          text: 'Average Weight (kg)',
          color: '#e2e8f0'
        },
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(203, 213, 225, 0.1)' }
      }
    }
  };

  // Prepare data for medal rate bar chart
  const topSports = Object.entries(data)
    .filter(([, stats]) => stats.athleteCount > 5)
    .sort((a, b) => b[1].medalRate - a[1].medalRate)
    .slice(0, 15);

  const barData = {
    labels: topSports.map(([sport]) => sport),
    datasets: [{
      label: 'Medal Rate (%)',
      data: topSports.map(([, stats]) => stats.medalRate * 100),
      backgroundColor: 'rgba(34, 197, 94, 0.7)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: { size: 12, weight: '600' }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(203, 213, 225, 0.1)' },
        title: {
          display: true,
          text: 'Medal Rate (%)',
          color: '#e2e8f0'
        }
      },
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(203, 213, 225, 0.1)' }
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border-2 border-slate-700 animate-fade-in-delay-2">
      <h2 className="text-4xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        📈 EXPLORE TEAM USA ATHLETE PROFILES
      </h2>

      <div className="mt-4 rounded-3xl border border-blue-200/80 bg-blue-50/90 p-5 shadow-lg dark:border-blue-700/60 dark:bg-slate-950 dark:text-slate-100 mb-6">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300 font-semibold">
            Google Looker Studio • live dashboard
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Find your sport and Peak Performance
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            See your Team USA athlete trends in a clean Looker Studio dashboard that keeps the story focused, the metrics clear, and the next move obvious.
          </p>
        </div>

        <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <iframe
            src="https://datastudio.google.com/embed/reporting/9358d7e9-222a-4cec-b861-11cd2b8d02de/page/0QjxF"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300">
          This embedded Looker Studio report is the fastest path from data to insight: clear metrics, quick comparison, and a polished Google brand experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="animate-fade-in-delay">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-blue-500 shadow-2xl hover:shadow-blue-500/50 transition-all">
            <h3 className="text-xl font-black text-blue-300 mb-4 text-center uppercase tracking-wide">
              📊 HEIGHT VS WEIGHT
            </h3>
            <div className="h-96 bg-slate-700/50 rounded-lg p-3">
              <Scatter data={scatterData} options={scatterOptions} />
            </div>
          </div>
        </div>

        <div className="animate-fade-in-delay-2">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-emerald-500 shadow-2xl hover:shadow-emerald-500/50 transition-all">
            <h3 className="text-xl font-black text-emerald-300 mb-4 text-center uppercase tracking-wide">
              🏆 MEDAL RATE PERFORMANCE
            </h3>
            <div className="h-96 bg-slate-700/50 rounded-lg p-3">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Data Source:</strong> 120+ years of Olympic athlete data, filtered to Team USA athletes.
          Showing sports with 10+ athletes for height/weight analysis, 5+ athletes for medal rates.
        </p>
        <p className="mt-2">
          <strong>Insights:</strong> Hover over data points to see detailed statistics for each sport.
          This visualization helps understand the physical characteristics that define different Olympic sports.
        </p>
      </div>
    </div>
  );
}