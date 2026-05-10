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
      },
      title: {
        display: true,
        text: 'Average Height vs Weight by Sport (Team USA Athletes)',
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
          text: 'Average Height (cm)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Average Weight (kg)'
        }
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
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 1,
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top 15 Sports by Medal Rate (Team USA)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Medal Rate (%)'
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Team USA Athlete Data Insights
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Variant A: Height vs Weight Analysis
          </h3>
          <div className="h-96">
            <Scatter data={scatterData} options={scatterOptions} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Variant B: Medal Rate Performance
          </h3>
          <div className="h-96">
            <Bar data={barData} options={barOptions} />
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