import type { AnalyzeRequest, Archetype, ArchetypeResult, ClosestSport } from './types';

function profileMetrics(req: AnalyzeRequest) {
  const heightCm = Math.round(req.heightInches * 2.54);
  const weightKg = Math.round(req.weightLbs / 2.20462);
  const bmi = (req.weightLbs / Math.pow(req.heightInches / 39.37, 2)).toFixed(1);
  const feet = Math.floor(req.heightInches / 12);
  const inches = req.heightInches % 12;

  return {
    bmi,
    feet,
    heightCm,
    inches,
    weightKg,
  };
}

function sportOrFallback(sports: ClosestSport[], index: number, fallbackSport: string): ClosestSport {
  return (
    sports[index] ?? {
      sport: fallbackSport,
      stats: {
        avgHeight: null,
        avgWeight: null,
        avgAge: null,
        medalRate: 0.24,
        athleteCount: 128,
        goldenYear: null,
      },
    }
  );
}

function eraLine(sport: ClosestSport, fallback: string) {
  const goldenYear = sport.stats.goldenYear;
  if (!goldenYear) return fallback;

  const avgHeight = goldenYear.avgHeightCm != null ? `${goldenYear.avgHeightCm}cm` : 'a comparable frame';
  const avgWeight = goldenYear.avgWeightKg != null ? `${goldenYear.avgWeightKg}kg` : 'a comparable build';
  return `At the ${goldenYear.year} ${goldenYear.city} Games, Team USA ${sport.sport} athletes delivered ${goldenYear.medals} medals across ${goldenYear.athletes} entries, with a cohort average around ${avgHeight} and ${avgWeight}.`;
}

function matchScore(sport: ClosestSport, rank: number) {
  if (typeof sport.score === 'number') {
    const score = Math.round(96 - sport.score * 120);
    return Math.max(72, Math.min(96, score - (rank - 1) * 3));
  }
  return rank === 1 ? 91 : rank === 2 ? 86 : 81;
}

function archetypeFor(
  req: AnalyzeRequest,
  sport: ClosestSport,
  rank: 1 | 2 | 3,
  archetypeName: string,
  paralympic: boolean,
): Archetype {
  const metrics = profileMetrics(req);
  const avgHeight = sport.stats.avgHeight != null ? `${sport.stats.avgHeight}cm` : 'the available Team USA range';
  const avgWeight = sport.stats.avgWeight != null ? `${sport.stats.avgWeight}kg` : 'the available Team USA range';
  const avgAge = sport.stats.avgAge != null ? `${sport.stats.avgAge}` : 'the prime competitive band';
  const medalRate = Math.round(sport.stats.medalRate * 100);
  const athleteCount = sport.stats.athleteCount.toLocaleString();

  const why = `At ${req.heightInches} inches (${metrics.feet}'${metrics.inches}") and ${req.weightLbs} lbs (${metrics.weightKg}kg), your profile could align with ${sport.sport} because its Team USA average sits near ${avgHeight} and ${avgWeight}. With BMI ${metrics.bmi}, your biometrics suggest a practical blend of mass, leverage, and repeatable force rather than a single raw trait. Profiles like yours have historically mapped well when the training plan balances a ${req.power}/100 strength index with a ${req.endurance}/100 endurance index. Your age ${req.age} gives the system enough runway to frame the result as a development path, not a guaranteed outcome.`;

  return {
    rank,
    archetypeName,
    sport: paralympic ? `Para ${sport.sport}` : sport.sport,
    paralympic,
    matchScore: matchScore(sport, rank),
    tagline: paralympic
      ? `A precision-adapted version of your ${req.heightInches}-inch frame built around control, repeatability, and competitive range.`
      : `Your ${req.heightInches}-inch, ${req.weightLbs}-lb build points toward a Team USA profile with measurable precedent.`,
    why,
    goldenEra: eraLine(
      sport,
      paralympic
        ? 'In Paralympic Team USA history, comparable power-to-control profiles have often shown up in sports where chair skill, balance, or adaptive mechanics amplify repeatable force.'
        : 'Across Team USA history, this sport has rewarded athletes whose body profile could translate repeatable mechanics into event-specific advantages.',
    ),
    historicalNote: `${sport.sport} has ${athleteCount} Team USA entries in the local dataset with an estimated ${medalRate}% medal rate. The strongest signal is not destiny; it is that your profile sits close enough to the historical cluster to justify a deeper scouting look.`,
    lateBloomer: `At age ${req.age}, you sit relative to a ${sport.sport} Team USA average age of ${avgAge}, so this recommendation should be read as a training-fit signal rather than a claim of elite readiness.`,
    traits: paralympic
      ? ['Adaptive control', 'Repeatable mechanics', 'Composure under load', 'Tactical patience']
      : ['Frame efficiency', 'Trainable power', 'Event versatility', 'Competitive durability'],
  };
}

export function generateDemoRecommendation(req: AnalyzeRequest, notice?: string): ArchetypeResult {
  const sortedSports = [...req.closestSports].sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
  const first = sportOrFallback(sortedSports, 0, 'Swimming');
  const second = sportOrFallback(sortedSports, 1, 'Athletics');
  const paraBase = sportOrFallback(sortedSports, 2, 'Track and Field');
  const metrics = profileMetrics(req);

  return {
    analysisMode: 'demo',
    notice:
      notice ??
      'Demo mode uses the local Team USA dataset and deterministic rules because live Gemini synthesis is not configured.',
    overallArchetype: 'The Data-Built Competitor',
    tagline: `Your ${metrics.heightCm}cm / ${metrics.weightKg}kg profile is mapped through verified Team USA sport clusters.`,
    funFact: `The local dataset compared your ${req.heightInches}-inch, ${req.weightLbs}-lb, BMI ${metrics.bmi} profile against ${req.closestSports.length} closest sport clusters before producing this demo result.`,
    archetypes: [
      archetypeFor(req, first, 1, 'The Metric Striker', false),
      archetypeFor(req, second, 2, 'The Pressure Engine', false),
      archetypeFor(req, paraBase, 3, 'The Adaptive Tactician', true),
    ],
  };
}
