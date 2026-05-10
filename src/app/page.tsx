'use client';

import { AthleteForm } from '@/components/AthleteForm'
import { DataVisualization } from '@/components/DataVisualization'
import { useOlympicData } from '@/useOlympicData'

export default function Home() {
  const { sportStats: data, loading, findClosestSports } = useOlympicData();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -z-10" />
      <div className="fixed inset-0 opacity-30 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-16 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-7xl font-black tracking-tighter text-white mb-4 animate-slide-down">
              FIND YOUR
              <span className="block bg-gradient-to-r from-blue-400 via-red-400 to-amber-400 bg-clip-text text-transparent animate-pulse">
                OLYMPIC ARCHETYPE
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-delay">
              Discover the sports where athletes with your exact measurements dominate. Backed by 130 years of Team USA Olympic data.
            </p>
          </div>
        </header>

        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto mb-12 animate-scale-in">
          <div className="relative group">
            {/* Animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-red-500 to-amber-500 rounded-3xl p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">
              <AthleteForm
                data={data}
                loading={loading}
                findClosestSports={findClosestSports}
                variant="B"
              />
            </div>
          </div>
        </div>

        {/* Data Visualization */}
        <div className="max-w-6xl mx-auto animate-fade-in-delay-2">
          <DataVisualization data={data} />
        </div>
      </div>
    </div>
  )
}
