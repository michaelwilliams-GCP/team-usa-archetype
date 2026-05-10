'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface Archetype {
  rank: number;
  archetypeName: string;
  sport: string;
  paralympic: boolean;
  matchScore: number;
  tagline: string;
  why: string;
  goldenEra: string;
  historicalNote: string;
  lateBloomer: string;
  traits: string[];
}

interface ArchetypeResult {
  overallArchetype: string;
  tagline: string;
  funFact: string;
  archetypes: Archetype[];
}

interface AthleteFormProps {
  data: any;
  loading: boolean;
  findClosestSports: (profile: { height: number; weight: number; age: number }) => Array<any>;
  variant?: 'A' | 'B';
}

export function AthleteForm({ data, loading, findClosestSports, variant = 'A' }: AthleteFormProps) {
  const [formData, setFormData] = useState({
    feet: '',
    inches: '',
    weightLbs: '',
    age: '',
    gender: '',
    endurance: 50,
    power: 50
  });
  const [result, setResult] = useState<ArchetypeResult | string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const titleText = 'Enter Your Athlete Profile';
  const statusText = loading ? 'Loading data...' : data ? `${Object.keys(data).length} sports loaded` : 'Data error';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      // Convert US measurements to metric for backend
      const totalInches = (parseInt(formData.feet) || 0) * 12 + (parseInt(formData.inches) || 0);
      const heightCm = Math.round(totalInches * 2.54);
      const weightKg = Math.round((parseFloat(formData.weightLbs) || 0) / 2.20462);
      
      const userProfile = {
        height: heightCm,
        weight: weightKg,
        age: parseInt(formData.age)
      };

      const closestSports = findClosestSports(userProfile);

      // US measurements for the API payload
      const heightInches = totalInches;
      const weightLbs = Math.round(parseFloat(formData.weightLbs) || 0);
      const age = parseInt(formData.age);
      const gender = formData.gender;
      const endurance = formData.endurance;
      const power = formData.power;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heightInches, weightLbs, age, gender, endurance, power, closestSports }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Analysis failed' }));
        setResult(error || 'Analysis failed');
        return;
      }
      const parsed: ArchetypeResult = await res.json();
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setResult('Sorry, there was an error analyzing your profile. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-8 animate-bounce-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black">
            {titleText}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${loading ? 'bg-blue-500 text-white animate-pulse' : data ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {statusText}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group">
              <label className="text-sm font-medium text-slate-100 mb-1 block">
                Height (Feet)
              </label>
              <input
                type="number"
                name="feet"
                value={formData.feet}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-800 text-white placeholder-slate-400 transition-all group-hover:border-amber-400"
                placeholder="5"
                min="3"
                max="8"
              />
            </div>
            <div className="group">
              <label className="text-sm font-medium text-slate-100 mb-1 block">
                Inches
              </label>
              <input
                type="number"
                name="inches"
                value={formData.inches}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-800 text-white placeholder-slate-400 transition-all group-hover:border-amber-400"
                placeholder="10"
                min="0"
                max="11"
              />
            </div>
            <div className="group">
              <label className="text-sm font-medium text-slate-100 mb-1 block">
                Weight (lbs)
              </label>
              <input
                type="number"
                name="weightLbs"
                value={formData.weightLbs}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-800 text-white placeholder-slate-400 transition-all group-hover:border-amber-400"
                placeholder="160"
              />
            </div>
            <div className="group">
              <label className="text-sm font-medium text-slate-100 mb-1 block">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-800 text-white placeholder-slate-400 transition-all group-hover:border-amber-400"
                placeholder="25"
              />
            </div>
            <div className="group">
              <label className="text-sm font-medium text-slate-100 mb-1 block">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-800 text-white placeholder-slate-400 transition-all group-hover:border-amber-400"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-amber-300">
                  Endurance vs Power
                </label>
                <span className="text-lg font-black text-amber-400">{formData.endurance}/100</span>
              </div>
              <input
                type="range"
                name="endurance"
                min="0"
                max="100"
                value={formData.endurance}
                onChange={handleChange}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                <span>💪 Power</span>
                <span>🏃 Endurance</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-amber-300">
                  Strength vs Speed
                </label>
                <span className="text-lg font-black text-amber-400">{formData.power}/100</span>
              </div>
              <input
                type="range"
                name="power"
                min="0"
                max="100"
                value={formData.power}
                onChange={handleChange}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                <span>⚡ Speed</span>
                <span>🔨 Strength</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={analyzing || loading || !data}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
          >
            {analyzing ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Consulting our team of experts…
              </span>
            ) : (
              '🎯 FIND MY SPORTS!'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="animate-scale-in mt-8">
          {typeof result === 'string' ? (
            <>
              <h3 className="text-2xl font-black text-white mb-6 text-center">
                Your Sport Matches
              </h3>
              <div className="space-y-4">
                {result.split('\n').map((line, index) => (
                  <p key={index} className="text-slate-200 leading-relaxed">{line}</p>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 p-1 rounded-2xl animate-glow">
                <div className="bg-slate-900 rounded-2xl p-8">
                  <h3 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-3 animate-pulse">
                    {result.overallArchetype}
                  </h3>
                  <p className="text-xl text-amber-300 font-bold mb-6">
                    "{result.tagline}"
                  </p>
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 border-2 border-amber-500 shadow-lg">
                    <p className="text-sm font-bold text-amber-300 mb-2">🏆 TEAM USA HISTORICAL INSIGHT</p>
                    <p className="text-lg text-amber-100 font-semibold">{result.funFact}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {result.archetypes?.map((archetype, idx) => (
                  <div 
                    key={archetype.rank} 
                    className="border-2 border-amber-500 rounded-xl p-8 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 hover:border-amber-400"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-5xl font-black bg-gradient-to-br from-amber-400 to-orange-500 rounded-full w-16 h-16 flex items-center justify-center text-slate-900">
                          #{archetype.rank}
                        </div>
                        <div>
                          <h4 className="text-3xl font-black text-amber-300">
                            {archetype.archetypeName}
                          </h4>
                          <p className="text-lg text-slate-300 font-bold">
                            {archetype.sport} {archetype.paralympic && '🏅 PARALYMPIC'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">{archetype.matchScore}%</div>
                        <div className="text-sm text-slate-400 font-bold mt-1">MATCH SCORE</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-4 mb-6 border border-amber-500/30 italic">
                      <p className="text-xl text-amber-200 font-semibold">"{archetype.tagline}"</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h5 className="font-black text-amber-400 mb-3 text-lg">💪 WHY THIS SPORT?</h5>
                        <p className="text-slate-200 text-base leading-relaxed">
                          {archetype.why}
                        </p>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-amber-500">
                        <h5 className="font-black text-amber-300 mb-2 text-lg">🌟 GOLDEN ERA MOMENT</h5>
                        <p className="text-slate-200 leading-relaxed">
                          {archetype.goldenEra}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-black text-amber-400 mb-3 text-lg">📊 HISTORICAL PATTERN</h5>
                        <p className="text-slate-200 leading-relaxed">
                          {archetype.historicalNote}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-black text-amber-400 mb-3 text-lg">📈 YOUR DEVELOPMENT ARC</h5>
                        <p className="text-slate-200 leading-relaxed">
                          {archetype.lateBloomer}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-black text-amber-400 mb-3 text-lg">⚡ KEY TRAITS</h5>
                        <div className="flex flex-wrap gap-3">
                          {archetype.traits?.map((trait, index) => (
                            <span 
                              key={index} 
                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-full text-sm font-bold shadow-lg hover:shadow-amber-500/50 transition-all transform hover:scale-110"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
