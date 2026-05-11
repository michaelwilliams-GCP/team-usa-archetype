'use client';

import { useState, useEffect } from 'react';
import { useParityData } from '@/useParityData';

type MomentumResult = {
  sport: string;
  momentumScore: number;
  growthTrajectory: string;
  keyMilestones: string[];
  preparationStatus: string;
  analysis: string;
};

export default function MomentumPage() {
  const { olympicStats, paralympicStats, loading, error } = useParityData();
  const [momentumData, setMomentumData] = useState<MomentumResult[]>([]);
  const [loadingMomentum, setLoadingMomentum] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  useEffect(() => {
    if (olympicStats && paralympicStats) {
      const sports = [
        ...new Set([
          ...Object.keys(olympicStats.sports || {}),
          ...Object.keys(paralympicStats.sports || {})
        ])
      ].filter(sport => (olympicStats.sports?.[sport]?.athleteCount || 0) + (paralympicStats.sports?.[sport]?.athleteCount || 0) > 0);

      if (sports.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoadingMomentum(true);
        const fetchData = async () => {
          try {
            const response = await fetch('/api/momentum', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sports)
            });
            const data = await response.json();
            if (data.results) {
              const sorted = data.results.sort((a: MomentumResult, b: MomentumResult) => b.momentumScore - a.momentumScore);
              setMomentumData(sorted);
            }
          } catch (err) {
            console.error('Failed to fetch momentum data:', err);
          } finally {
            setLoadingMomentum(false);
          }
        };
        fetchData();
      }
    }
  }, [olympicStats, paralympicStats]);

  if (loading || loadingMomentum) return <div className="min-h-screen flex items-center justify-center text-white">Loading momentum analysis...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">Error: {error}</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const MomentumCard = ({ result, rank }: { result: MomentumResult; rank: number }) => (
    <div
      className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 ${getScoreBg(result.momentumScore)}`}
      onClick={() => setSelectedSport(selectedSport === result.sport ? null : result.sport)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-slate-400 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            #{rank}
          </div>
          <h3 className="text-xl font-semibold text-white">{result.sport}</h3>
        </div>
        <div className={`text-3xl font-bold ${getScoreColor(result.momentumScore)}`}>
          {result.momentumScore}
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${result.momentumScore >= 80 ? 'bg-green-500' : result.momentumScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${result.momentumScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-400 mt-1">Momentum Score</p>
      </div>

      <p className="text-slate-300 text-sm mb-2">{result.growthTrajectory}</p>
      <p className="text-slate-400 text-xs">{result.preparationStatus}</p>

      {selectedSport === result.sport && (
        <div className="mt-6 pt-4 border-t border-slate-600">
          <h4 className="text-lg font-semibold text-white mb-3">Key Milestones</h4>
          <ul className="space-y-2 mb-4">
            {result.keyMilestones.map((milestone, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span className="text-slate-300 text-sm">{milestone}</span>
              </li>
            ))}
          </ul>
          <div className="bg-slate-900/50 rounded p-3">
            <p className="text-slate-300 text-sm">{result.analysis}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
              ROAD TO LA28 MOMENTUM
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            AI-powered prediction engine ranking Team USA sports by growth trajectory and preparation milestones
            leading to the <span className="text-yellow-400 font-semibold">2028 Los Angeles Games</span>.
          </p>
        </header>

        <div className="mb-8 text-center">
          <p className="text-slate-400 mb-4">
            Click on any sport to see detailed momentum analysis, key milestones, and preparation status.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>High Momentum (80+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Building (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Developing (0-59)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {momentumData.map((result, index) => (
            <MomentumCard key={result.sport} result={result} rank={index + 1} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-4">LA28 Prediction Engine</h3>
            <p className="text-slate-300 mb-4">
              This momentum analysis uses AI to evaluate Team USA&apos;s growth patterns, World Championship performances,
              and preparation milestones across all Olympic and Paralympic sports. Rankings are based on upward trajectory,
              athlete pipeline strength, and strategic positioning for 2028 success.
            </p>
            <p className="text-slate-400 text-sm">
              * Analysis powered by Gemini AI using recent performance data and development trends.
              Scores represent relative momentum, not guaranteed outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}