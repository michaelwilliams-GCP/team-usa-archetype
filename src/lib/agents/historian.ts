import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalyzeRequest, PersonaOutput } from './types';
import { MODEL_NAME, withTimeout } from './utils';

export async function runHistorian(
  req: AnalyzeRequest,
  apiKey: string,
): Promise<PersonaOutput> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: `You are Marcus Webb, Team USA's official Olympic historian and archivist with access to 120 years of athlete records spanning 1904 to 2024.
Your lens is lineage and legacy: you trace how specific biometric profiles have appeared across Olympic and Paralympic history, surfacing golden eras, legendary precedents, and the athletes who define each archetype.
You must always include at least one Paralympic sport option — give it the same historical depth and reverence as the Olympic options.
Return free text — no JSON required. Be cinematic, precise about years and cities, and evoke the sweep of history.`,
  });

  const bmi = (req.weightLbs / Math.pow(req.heightInches / 39.37, 2)).toFixed(1);
  const feet = Math.floor(req.heightInches / 12);
  const inches = req.heightInches % 12;

  const goldenYearContext = req.closestSports
    .filter((s) => s.stats.goldenYear != null)
    .map((s) => {
      const gy = s.stats.goldenYear!;
      return `${s.sport} — Golden Year: ${gy.year} ${gy.city} (${gy.medals} medals, ${gy.athletes} athletes${gy.avgHeightCm != null ? `, avg height ${gy.avgHeightCm.toFixed(1)}cm` : ''}${gy.avgWeightKg != null ? `, avg weight ${gy.avgWeightKg.toFixed(1)}kg` : ''})`;
    })
    .join('\n');

  const prompt = `Athlete biometric profile:
Height: ${req.heightInches} inches (${feet}'${inches}")
Weight: ${req.weightLbs} lbs
BMI: ${bmi}
Age: ${req.age}
Gender: ${req.gender}
Endurance: ${req.endurance}/100 | Power: ${req.power}/100

Closest Team USA sports by biometrics:
${req.closestSports
  .map(
    (s) =>
      `${s.sport}: medal rate ${(s.stats.medalRate * 100).toFixed(1)}%, ${s.stats.athleteCount} historical athletes`,
  )
  .join('\n')}

Golden year data available:
${goldenYearContext || 'No golden year data available for these sports.'}

As Marcus Webb, trace the historical lineage for 2-3 sports including AT LEAST ONE Paralympic sport. For each:
1. Name the specific Olympic/Paralympic Games city and year where athletes with this EXACT biometric profile (within ~2 inches/${req.weightLbs >= 10 ? '10' : '5'} lbs) peaked for Team USA
2. Describe what defined that golden era and what made those athletes legendary
3. Identify the pattern across multiple Games — how this body type has recurred in Team USA history
4. For the Paralympic option: cite real IPC/USOC records and name specific Games and achievements with the same depth as Olympic options
5. Paint a cinematic picture of what this athlete's competitive legacy could look like in the sweep of Team USA history

Reference actual years, cities, and data from the golden year context above when available. Make history feel alive.`;

  const result = await withTimeout(model.generateContent(prompt), 'Historian persona');
  const text = result.response.text();
  return {
    persona: 'historian',
    candidates: req.closestSports.slice(0, 3).map((s) => s.sport),
    analysis: text,
  };
}
