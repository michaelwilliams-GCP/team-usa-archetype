'use client';

import { AthleteForm } from '@/components/AthleteForm'
import { DataVisualization } from '@/components/DataVisualization'
import { useOlympicData } from '@/useOlympicData'

const brandVariants = [
  {
    id: 'A',
    label: 'Variant A',
    title: 'Find Your Sport',
    subtitle: 'Discover which Olympic and Paralympic sports match your athlete archetype.',
    cardClass: 'bg-white/90 border-slate-200 text-slate-900 dark:bg-gray-900 dark:border-gray-700 dark:text-white',
    badgeClass: 'bg-blue-100 text-blue-900'
  },
  {
    id: 'B',
    label: 'Variant B',
    title: 'Peak Performance Lab',
    subtitle: 'A high-performance brand experience for ambitious Team USA athletes.',
    cardClass: 'bg-slate-950/95 border-slate-800 text-white',
    badgeClass: 'bg-amber-100 text-amber-900'
  }
] as const

export default function Home() {
  const { sportStats: data, loading, findClosestSports } = useOlympicData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-950 dark:to-red-950">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            A/B Brand Preview
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Compare two brand directions for the same Team USA athlete recommendation experience.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Same data and recommendation logic, different visual tone and brand styling.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {brandVariants.map((variant) => (
            <section key={variant.id} className={`rounded-3xl border p-6 shadow-xl ${variant.cardClass}`}>
              <div className="mb-6">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${variant.badgeClass}`}>
                  {variant.label}
                </span>
                <h2 className="mt-4 text-3xl font-bold">
                  {variant.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {variant.subtitle}
                </p>
              </div>

              <AthleteForm
                data={data}
                loading={loading}
                findClosestSports={findClosestSports}
                variant={variant.id}
              />
            </section>
          ))}
        </div>

        <div className="mb-8">
          <DataVisualization data={data} />
        </div>
      </div>
    </div>
  )
}
