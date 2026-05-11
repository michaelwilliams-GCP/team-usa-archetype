'use client';

import { useState } from 'react';
import { useParityData } from '@/useParityData';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ParityPage() {
  const { olympicStats, paralympicStats, loading, error } = useParityData();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">Error: {error}</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'milestones', label: 'Shared Milestones' },
    { id: 'sports', label: 'Sports Comparison' },
    { id: 'hometowns', label: 'Hometowns' },
  ];

  const StatCard = ({ title, olympic, paralympic }) => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
        <span className="text-red-500">🇺🇸</span>
        {title}
        <span className="text-blue-500">🇺🇸</span>
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 rounded-md bg-red-500/10 border border-red-500/30">
          <div className="text-2xl font-bold text-red-400">{olympic}</div>
          <div className="text-sm text-slate-400">Olympic</div>
        </div>
        <div className="text-center p-4 rounded-md bg-blue-500/10 border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{paralympic}</div>
          <div className="text-sm text-slate-400">Paralympic</div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Athletes"
        olympic={olympicStats?.totalAthletes || 0}
        paralympic={paralympicStats?.totalAthletes || 0}
      />
      <StatCard
        title="Total Medals"
        olympic={olympicStats?.totalMedals || 0}
        paralympic="N/A"
      />
      <StatCard
        title="Sports Disciplines"
        olympic={olympicStats?.totalSports || 0}
        paralympic={paralympicStats?.totalSports || 0}
      />
      <StatCard
        title="Avg Height (cm)"
        olympic={Math.round(Object.values(olympicStats?.sports || {}).reduce((sum, s) => sum + (s.avgHeight || 0), 0) / Object.keys(olympicStats?.sports || {}).length) || 0}
        paralympic={Math.round(Object.values(paralympicStats?.sports || {}).reduce((sum, s) => sum + (s.avgHeight || 0), 0) / Object.keys(paralympicStats?.sports || {}).length) || 0}
      />
      <StatCard
        title="Avg Weight (kg)"
        olympic={Math.round(Object.values(olympicStats?.sports || {}).reduce((sum, s) => sum + (s.avgWeight || 0), 0) / Object.keys(olympicStats?.sports || {}).length) || 0}
        paralympic={Math.round(Object.values(paralympicStats?.sports || {}).reduce((sum, s) => sum + (s.avgWeight || 0), 0) / Object.keys(paralympicStats?.sports || {}).length) || 0}
      />
      <StatCard
        title="Avg Age"
        olympic={Math.round(Object.values(olympicStats?.sports || {}).reduce((sum, s) => sum + (s.avgAge || 0), 0) / Object.keys(olympicStats?.sports || {}).length) || 0}
        paralympic={Math.round(Object.values(paralympicStats?.sports || {}).reduce((sum, s) => sum + (s.avgAge || 0), 0) / Object.keys(paralympicStats?.sports || {}).length) || 0}
      />
    </div>
  );

  const renderTimeline = () => {
    const olympicYears = Object.keys(olympicStats?.byYear || {}).sort();
    const paralympicYears = Object.keys(paralympicStats?.byYear || {}).sort();
    const labels = [...new Set([...olympicYears, ...paralympicYears])].sort();

    const data = {
      labels,
      datasets: [
        {
          label: 'Olympic Athletes',
          data: labels.map(year => olympicStats?.byYear?.[year]?.total || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
        {
          label: 'Paralympic Athletes',
          data: labels.map(year => paralympicStats?.byYear?.[year]?.total || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
        },
      ],
    };

    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Athletes Over Time (120 Years)</h3>
        <Line data={data} />
      </div>
    );
  };

  const renderMilestones = () => {
    const olympicYears = new Set(Object.keys(olympicStats?.sports || {}).flatMap(sport => Object.keys(olympicStats.sports[sport].byYear || {})));
    const paralympicYears = new Set(Object.keys(paralympicStats?.sports || {}).flatMap(sport => Object.keys(paralympicStats.sports[sport].byYear || {})));
    const sharedYears = [...olympicYears].filter(year => paralympicYears.has(year)).sort();

    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Shared Games Years</h3>
        <ul className="text-slate-300">
          {sharedYears.map(year => (
            <li key={year} className="mb-2">• {year}: Both Olympic and Paralympic programs represented</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSports = () => {
    const sports = [...new Set([...Object.keys(olympicStats?.sports || {}), ...Object.keys(paralympicStats?.sports || {})])];

    const data = {
      labels: sports,
      datasets: [
        {
          label: 'Olympic Athletes',
          data: sports.map(sport => olympicStats?.sports?.[sport]?.athleteCount || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
        {
          label: 'Paralympic Athletes',
          data: sports.map(sport => paralympicStats?.sports?.[sport]?.athleteCount || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
        },
      ],
    };

    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Athletes by Sport</h3>
        <Bar data={data} />
      </div>
    );
  };

  const renderHometowns = () => (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-4">Hometowns Support</h3>
      <p className="text-slate-300">Hometown data not available in current dataset. Ready for integration when Paralympic CSV includes state information.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'timeline': return renderTimeline();
      case 'milestones': return renderMilestones();
      case 'sports': return renderSports();
      case 'hometowns': return renderHometowns();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
              TEAM USA
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-white to-red-500 bg-clip-text text-transparent">
              PERFORMANCE PARITY
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Celebrating the collective power of Team USA across Olympic and Paralympic disciplines.
            <span className="text-yellow-400 font-semibold"> Equal excellence, equal prominence.</span>
          </p>
        </header>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}