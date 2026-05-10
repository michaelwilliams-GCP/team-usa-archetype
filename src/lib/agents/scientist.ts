import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalyzeRequest, PersonaOutput } from './types';
import { MODEL_NAME, withTimeout } from './utils';

export async function runScientist(
  req: AnalyzeRequest,
  apiKey: string,
): Promise<PersonaOutput> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: `You are Dr. Chen, a biomechanics researcher and sports scientist who has spent 20 years profiling Team USA athletes across all disciplines.
Your lens is data-driven: biometric similarity, lever ratios, power-to-weight profiles, and statistical alignment with historical archetypes.
You cross-reference athlete biometrics against historical Team USA averages and surface which sports this body statistically matches best.
Return free text — no JSON required. Be precise, cite numbers, use percentages, and reference actual data from the provided context.`,
  });

  const bmi = (req.weightLbs / Math.pow(req.heightInches / 39.37, 2)).toFixed(1);
  const heightCm = (req.heightInches * 2.54).toFixed(1);
  const weightKg = (req.weightLbs / 2.20462).toFixed(1);

  const prompt = `Athlete biometric profile:
Height: ${req.heightInches} inches (${heightCm}cm)
Weight: ${req.weightLbs} lbs (${weightKg}kg)
BMI: ${bmi}
Age: ${req.age}
Gender: ${req.gender}
Endurance: ${req.endurance}/100 | Power: ${req.power}/100

Closest Team USA sport matches (pre-computed biometric similarity):
${req.closestSports
  .map((s) => {
    const heightDiff =
      s.stats.avgHeight != null
        ? (parseFloat(heightCm) - s.stats.avgHeight).toFixed(1)
        : null;
    const weightDiff =
      s.stats.avgWeight != null
        ? (parseFloat(weightKg) - s.stats.avgWeight).toFixed(1)
        : null;
    const ageDiff =
      s.stats.avgAge != null ? (req.age - s.stats.avgAge).toFixed(1) : null;
    const golden = s.stats.goldenYear;
    return `${s.sport}:
  - Avg height: ${s.stats.avgHeight?.toFixed(1) ?? 'N/A'}cm (athlete delta: ${heightDiff != null ? (parseFloat(heightDiff) >= 0 ? '+' : '') + heightDiff + 'cm' : 'N/A'})
  - Avg weight: ${s.stats.avgWeight?.toFixed(1) ?? 'N/A'}kg (athlete delta: ${weightDiff != null ? (parseFloat(weightDiff) >= 0 ? '+' : '') + weightDiff + 'kg' : 'N/A'})
  - Avg age: ${s.stats.avgAge?.toFixed(1) ?? 'N/A'} (athlete delta: ${ageDiff != null ? (parseFloat(ageDiff) >= 0 ? '+' : '') + ageDiff + ' yrs' : 'N/A'})
  - Medal rate: ${(s.stats.medalRate * 100).toFixed(1)}%
  - Historical athlete count: ${s.stats.athleteCount}${
    golden
      ? `
  - Golden year: ${golden.year} ${golden.city} — ${golden.medals} medals from ${golden.athletes} athletes${golden.avgHeightCm != null ? `, avg height ${golden.avgHeightCm.toFixed(1)}cm` : ''}${golden.avgWeightKg != null ? `, avg weight ${golden.avgWeightKg.toFixed(1)}kg` : ''}`
      : ''
  }`;
  })
  .join('\n')}

As Dr. Chen, perform a biomechanical analysis. For 2-3 sports:
1. Calculate and explain the athlete's biometric deviation from the historical Team USA average for that sport (use the deltas above)
2. Analyze lever ratios and power-to-weight implications for the sport's demands
3. Cite specific percentages — e.g., "this height places the athlete in the top X% of historical Team USA competitors in this sport"
4. Reference any golden year data when available to show what peak performers looked like
5. Give a statistical match confidence rating with justification

Use precise numbers. Reference both US and metric measurements where relevant.`;

  const result = await withTimeout(model.generateContent(prompt), 'Scientist persona');
  const text = result.response.text();
  return {
    persona: 'scientist',
    candidates: req.closestSports.slice(0, 3).map((s) => s.sport),
    analysis: text,
  };
}
