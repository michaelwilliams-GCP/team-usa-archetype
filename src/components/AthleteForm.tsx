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
    height: '',
    weight: '',
    age: '',
    gender: '',
    endurance: 50,
    power: 50
  });
  const [result, setResult] = useState<ArchetypeResult | string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const brand = variant === 'B'
    ? {
        card: 'bg-slate-900 text-white',
        heading: 'text-2xl font-semibold text-white',
        label: 'text-sm font-medium text-slate-100 mb-1',
        input: 'w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-800 text-white',
        button: 'w-full bg-amber-500 text-slate-900 hover:bg-amber-600 focus:ring-2 focus:ring-amber-400',
        badge: 'px-3 py-1 rounded-full text-sm',
        status: loading ? 'bg-amber-100 text-amber-900' : data ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800',
      }
    : {
        card: 'bg-white dark:bg-gray-800',
        heading: 'text-2xl font-semibold text-gray-900 dark:text-white',
        label: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
        button: 'w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500',
        badge: 'px-3 py-1 rounded-full text-sm',
        status: loading ? 'bg-yellow-100 text-yellow-800' : data ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      };

  const titleText = variant === 'B' ? 'Peak Performance Profile' : 'Your Athlete Profile';
  const statusText = loading ? 'Loading data...' : data ? `${Object.keys(data).length} sports loaded` : 'Data error';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      const userProfile = {
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age)
      };

      const closestSports = findClosestSports(userProfile);

      const context = closestSports.map((item: any) => 
        `${item.sport}: Height ${item.stats.avgHeight?.toFixed(1)}cm, Weight ${item.stats.avgWeight?.toFixed(1)}kg, Age ${item.stats.avgAge?.toFixed(1)}, Medal Rate ${(item.stats.medalRate * 100).toFixed(1)}%`
      ).join('\n');

      // Convert to US measurements
      const heightInches = Math.round(parseFloat(formData.height) / 2.54);
      const weightLbs = Math.round(parseFloat(formData.weight) * 2.20462);
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
   "Only 3% of Team USA athletes in history have matched your exact ${formData.height}cm/${formData.weight}kg build ratio"
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
        setResult(text); // Fallback to raw text if JSON parsing fails
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
    <div className="max-w-full mx-auto">
      <div className={`${brand.card} rounded-lg shadow-lg p-6 mb-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`${brand.heading}`}>
            {titleText}
          </h2>
          <span className={`${brand.badge} ${brand.status}`}>
            {statusText}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block ${brand.label}`}>
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                className={brand.input}
                placeholder="170"
              />
            </div>
            <div>
              <label className={`block ${brand.label}`}>
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                className={brand.input}
                placeholder="70"
              />
            </div>
            <div>
              <label className={`block ${brand.label}`}>
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className={brand.input}
                placeholder="25"
              />
            </div>
            <div>
              <label className={`block ${brand.label}`}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={brand.input}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endurance vs Power: {formData.endurance}/100
              </label>
              <input
                type="range"
                name="endurance"
                min="0"
                max="100"
                value={formData.endurance}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Power-focused</span>
                <span>Endurance-focused</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Strength vs Speed: {formData.power}/100
              </label>
              <input
                type="range"
                name="power"
                min="0"
                max="100"
                value={formData.power}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Speed-focused</span>
                <span>Strength-focused</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={analyzing || loading || !data}
            className={`${brand.button} py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none`}
          >
            {analyzing ? 'Analyzing...' : 'Find My Sports!'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {typeof result === 'string' ? (
            <>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Sport Matches
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                {result.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {result.overallArchetype}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {result.tagline}
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">🏆 Fun Fact</p>
                  <p className="text-blue-700 dark:text-blue-300">{result.funFact}</p>
                </div>
              </div>

              <div className="space-y-6">
                {result.archetypes?.map((archetype) => (
                  <div key={archetype.rank} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-gray-400">#{archetype.rank}</span>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            {archetype.archetypeName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {archetype.sport} {archetype.paralympic && '🏅'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{archetype.matchScore}%</div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                      "{archetype.tagline}"
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Why This Sport?</h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {archetype.why}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Golden Era Moment</h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {archetype.goldenEra}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Historical Pattern</h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {archetype.historicalNote}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Age Development Arc</h5>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {archetype.lateBloomer}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Key Traits</h5>
                        <div className="flex flex-wrap gap-2">
                          {archetype.traits?.map((trait, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
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