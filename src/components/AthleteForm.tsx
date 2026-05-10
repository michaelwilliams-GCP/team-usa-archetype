'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
console.log('Gemini API Key loaded:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);

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

      const context = closestSports.map((item: any) => 
        `${item.sport}: Height ${item.stats.avgHeight?.toFixed(1)}cm, Weight ${item.stats.avgWeight?.toFixed(1)}kg, Age ${item.stats.avgAge?.toFixed(1)}, Medal Rate ${(item.stats.medalRate * 100).toFixed(1)}%`
      ).join('\n');

      // US measurements for the prompt
      const heightInches = totalInches;
      const weightLbs = Math.round(parseFloat(formData.weightLbs) || 0);
      const bmi = (weightLbs / ((heightInches / 39.37) ** 2)).toFixed(1);

      const prompt = `You are the most sophisticated Team USA athlete analytics engine ever built — a fusion of 120 years of Olympic and Paralympic biomechanics data, sports science research, and the storytelling instincts of a world-class ESPN documentary director.

Your job: make this fan feel genuinely seen. Not generic. Not vague. IMPOSSIBLY SPECIFIC. When they read their result they should think "how did it know that?" That specificity is the wow.

═══════════════════════════════════════
FAN BIOMETRIC PROFILE (PRE-COMPUTED FOR PRECISION)
═══════════════════════════════════════
Height: ${heightInches} inches exactly (${Math.floor(heightInches/12)}'${heightInches%12}")
Weight: ${weightLbs} lbs exactly
BMI: ${bmi} (calculated precisely)
Age: ${formData.age} years old
Gender: ${formData.gender}
Endurance: ${formData.endurance}/100
Power: ${formData.power}/100

Historical Team USA athlete data context (closest matches):
${context}

═══════════════════════════════════════
YOUR MISSION: CREATE THE "HOW DID IT KNOW THAT?" MOMENT
═══════════════════════════════════════
Identify 3 Team USA Athlete Archetypes. Make each one feel like it was written specifically for THIS person's exact numbers — not a generic body type category.

For EACH archetype you must deliver:

1. BIOMETRIC PRECISION — Reference the fan's ACTUAL numbers with surgical specificity using US measurements:
   "At ${heightInches} inches, your frame sits exactly 2 inches above the historical average for Team USA swimmers"
   "Your ${weightLbs} lb build falls within the top 12% of USA track athletes historically"
   "With a BMI of ${bmi}, you align with the optimal range for 87% of successful Team USA competitors"
   Include specific weight ranges and age ranges for each sport. Use real data averages from the context above. Make it feel like their exact measurements were destiny.

2. AGE & WEIGHT RANGE ANALYSIS — For each sport, specify the typical US ranges:
   "Team USA \${sport} athletes typically range from 18-35 years old, with your ${formData.age} age placing you in the [early/peak/late] development phase"
   "Weight range for elite \${sport} athletes: 140-200 lbs, with your ${weightLbs} lbs fitting perfectly in the [upper/middle/lower] third"
   "Age range for \${sport} success: 20-32 years, making your ${formData.age} age [ideal/developing/mature] for this sport"

4. FUN FACT BANNER — One impossible-to-ignore stat about their body profile in Team USA history:
   "Only 3% of Team USA athletes in history have matched your exact ${heightInches}-inch / ${weightLbs}-lb build ratio"
   "Athletes with your BMI have won 67% of all Team USA gold medals since 1980"
   "Your biometric profile appears in just 1.2% of the 120-year Team USA athlete database"

5. CONDITIONAL LANGUAGE — Always use: "could align with," "profiles like yours have historically," "your biometrics suggest affinity for," "this build has often found success in." NEVER guarantee results.

6. PARALYMPIC PARITY — The 3rd archetype MUST be a Paralympic sport. Give it the same analytical depth, the same golden era moment, the same excitement. Do not treat it as a footnote.

7. ARCHETYPE NAMES — Invent bold, original names that feel like superhero classifications:
   "The Structural Powerhouse," "The Aerodynamic Ghost," "The Coiled Spring," "The Iron Meridian," "The Kinetic Architect," "The Silent Accelerator," "The Quantum Frame," "The Velocity Matrix," "The Precision Forge"

═══════════════════════════════════════
CRITICAL OUTPUT RULES
═══════════════════════════════════════
- Return ONLY valid JSON. Zero markdown. Zero preamble. No backticks.
- Every string field must be complete — no "..." or placeholders
- why field: 4 sentences minimum, reference actual inches/lbs/BMI numbers with precision, include age and weight ranges
- goldenEra field: must name a real Games city and year with specific achievement
- historicalNote: must include a specific pattern or trend with real percentages/numbers
- funFact: must be a surprising, specific stat about this exact body profile
- lateBloomer: must reference their exact age ${formData.age} and position it in the development arc

{
  "overallArchetype": "bold single archetype name for this fan",
  "tagline": "one punchy sentence — their athletic DNA in plain english",
  "funFact": "one surprising, specific stat about this exact body profile in Team USA history",
  "archetypes": [
    {
      "rank": 1,
      "archetypeName": "bold creative name",
      "sport": "sport name",
      "paralympic": false,
      "matchScore": 94,
      "tagline": "punchy one-liner — make it feel impossibly personal",
      "why": "4+ sentences referencing actual ${heightInches} inch/${weightLbs} lb/BMI ${bmi} numbers and how they compare to historical USA averages. Include typical age range (18-35) and weight range (140-200 lbs) for this sport. Use conditional language. Make it feel like their exact measurements were destiny.",
      "goldenEra": "One cinematic sentence about a specific Games year+city and what athletes with this EXACT profile achieved for Team USA",
      "historicalNote": "2-3 sentences on a specific pattern or trend in Team USA history for this sport with similar biometrics, including real percentages or numbers",
      "lateBloomer": "One sentence about where age ${formData.age} sits in the development arc for this sport, with specific context",
      "traits": ["specific trait 1", "specific trait 2", "specific trait 3", "specific trait 4"]
    },
    {
      "rank": 2,
      "archetypeName": "bold creative name",
      "sport": "sport name",
      "paralympic": false,
      "matchScore": 89,
      "tagline": "punchy one-liner with biometric specificity",
      "why": "4+ sentences with real numbers and conditional language — same depth as rank 1",
      "goldenEra": "specific Games year+city cinematic moment with exact profile reference",
      "historicalNote": "specific pattern or trend with real data points",
      "lateBloomer": "age arc sentence with ${formData.age} specificity",
      "traits": ["trait 1", "trait 2", "trait 3", "trait 4"]
    },
    {
      "rank": 3,
      "archetypeName": "bold creative name",
      "sport": "Paralympic sport name",
      "paralympic": true,
      "matchScore": 83,
      "tagline": "punchy one-liner with same depth as others",
      "why": "4+ sentences with real numbers and conditional language — same analytical depth as ranks 1 and 2",
      "goldenEra": "specific Paralympic Games year+city cinematic moment with exact profile reference",
      "historicalNote": "specific Paralympic Team USA pattern or trend with real data points",
      "lateBloomer": "age arc sentence with ${formData.age} specificity",
      "traits": ["trait 1", "trait 2", "trait 3", "trait 4"]
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('Making Gemini API call...');
      const result = await model.generateContent(prompt);
      console.log('Gemini API call completed');
      const response = await result.response;
      const text = response.text();
      console.log('Gemini response:', text);

      try {
        const parsedResult = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
        setResult(parsedResult);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw response:', text);
        setResult(text);
      }
    } catch (error) {
      console.error('Error:', error);
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
                Analyzing Your Profile...
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
