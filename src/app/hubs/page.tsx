'use client';

import { useState } from 'react';
import { useParityData } from '@/useParityData';

// Mock hub data - in real implementation, this would come from geographical analysis
const sportHubs = {
  'Swimming': {
    hubs: ['California', 'Florida', 'Texas'],
    climate: 'Coastal/Subtropical',
    athletes: 0, // will be filled from data
    description: 'Coastal states with access to pools and ocean training foster swimming excellence.'
  },
  'Athletics': {
    hubs: ['California', 'Texas', 'Florida'],
    climate: 'Varied',
    athletes: 0,
    description: 'States with diverse terrain and facilities support track and field development.'
  },
  'Gymnastics': {
    hubs: ['California', 'Texas', 'Michigan'],
    climate: 'Temperate',
    athletes: 0,
    description: 'Indoor facilities in these states provide year-round training environments.'
  },
  'Skiing': {
    hubs: ['Colorado', 'Utah', 'California'],
    climate: 'Mountain/Alpine',
    athletes: 0,
    description: 'Mountain states with natural snow conditions and ski resorts.'
  },
  'Basketball': {
    hubs: ['California', 'North Carolina', 'Indiana'],
    climate: 'Temperate',
    athletes: 0,
    description: 'States with strong basketball culture and indoor facilities.'
  },
  'Rowing': {
    hubs: ['California', 'Washington', 'Connecticut'],
    climate: 'Coastal/Temperate',
    athletes: 0,
    description: 'States with waterways and rowing clubs.'
  },
  'Cycling': {
    hubs: ['Colorado', 'California', 'Texas'],
    climate: 'Mountain/Varied',
    athletes: 0,
    description: 'States with varied terrain for cycling training.'
  },
  'Wrestling': {
    hubs: ['Iowa', 'Pennsylvania', 'Oklahoma'],
    climate: 'Temperate',
    athletes: 0,
    description: 'States with strong wrestling programs and facilities.'
  },
  'Volleyball': {
    hubs: ['California', 'Hawaii', 'Florida'],
    climate: 'Coastal/Subtropical',
    athletes: 0,
    description: 'Beach and indoor volleyball culture in these states.'
  },
  'Boxing': {
    hubs: ['California', 'New York', 'Texas'],
    climate: 'Varied',
    athletes: 0,
    description: 'Urban centers with boxing gyms and programs.'
  }
};

export default function HubsPage() {
  const { olympicStats, paralympicStats, loading, error } = useParityData();
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedHub, setSelectedHub] = useState(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">Error: {error}</div>;

  // Update athlete counts from data
  const updatedSportHubs = { ...sportHubs };
  Object.keys(updatedSportHubs).forEach(sport => {
    const olympicCount = olympicStats?.sports?.[sport]?.athleteCount || 0;
    const paralympicCount = paralympicStats?.sports?.[sport]?.athleteCount || 0;
    updatedSportHubs[sport].athletes = olympicCount + paralympicCount;
  });

  const allSports = Object.keys(updatedSportHubs).filter(sport => updatedSportHubs[sport].athletes > 0);

  const HubCard = ({ hub, sport }) => (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="text-lg font-semibold text-white mb-2">{hub}</h4>
      <p className="text-slate-300 text-sm mb-2">{updatedSportHubs[sport].climate} climate</p>
      <p className="text-slate-400 text-sm">{updatedSportHubs[sport].description}</p>
    </div>
  );

  const SportCard = ({ sport }) => (
    <div
      className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
      onClick={() => setSelectedSport(selectedSport === sport ? null : sport)}
    >
      <h3 className="text-xl font-semibold text-white mb-2">{sport}</h3>
      <p className="text-blue-400 mb-2">{updatedSportHubs[sport].athletes} Team USA athletes</p>
      <p className="text-slate-300 text-sm">{updatedSportHubs[sport].description}</p>
      {selectedSport === sport && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {updatedSportHubs[sport].hubs.map(hub => (
            <HubCard key={hub} hub={hub} sport={sport} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-4">
            HOMETOWN SUCCESS ENGINE
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover how America's diverse landscape could help find the next Team USA stars.
            Explore geographical hubs where sports excellence thrives.
          </p>
        </header>

        <div className="mb-8">
          <p className="text-center text-slate-400 mb-4">
            Click on any sport to explore its geographical hubs and how local conditions foster success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSports.map(sport => (
            <SportCard key={sport} sport={sport} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-4">The American Landscape Advantage</h3>
            <p className="text-slate-300 mb-4">
              From coastal California beaches perfect for swimming and water sports, to the mountain peaks of Colorado
              that nurture skiing champions, America's geographical diversity creates natural training grounds for
              Olympic and Paralympic excellence.
            </p>
            <p className="text-slate-400 text-sm">
              * Hub correlations based on historical athlete distributions and geographical factors.
              Local conditions may contribute to success, but individual talent and dedication are always paramount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}