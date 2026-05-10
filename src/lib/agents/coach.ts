import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalyzeRequest, PersonaOutput } from './types';
import { MODEL_NAME, withTimeout } from './utils';

export async function runCoach(
  req: AnalyzeRequest,
  apiKey: string,
): Promise<PersonaOutput> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: `You are Coach Rivera, a decorated Team USA head coach with 30 years of elite athlete development experience.
Your lens is motivational and training-load: you assess where a body WANTS to go based on its biometric profile — what it will love, thrive in emotionally, and sustain physically across a multi-year training arc.
You think about athlete psychology, intrinsic motivation, sport culture fit, and the joy of competition.
Return free text — no JSON required. Be specific, vivid, and inspiring.`,
  });

  const bmi = (req.weightLbs / Math.pow(req.heightInches / 39.37, 2)).toFixed(1);
  const feet = Math.floor(req.heightInches / 12);
  const inches = req.heightInches % 12;

  const prompt = `Athlete biometric profile:
Height: ${req.heightInches} inches (${feet}'${inches}")
Weight: ${req.weightLbs} lbs
BMI: ${bmi}
Age: ${req.age}
Gender: ${req.gender}
Endurance rating: ${req.endurance}/100
Power rating: ${req.power}/100

Closest Team USA sport matches by biometrics:
${req.closestSports
  .map(
    (s) =>
      `${s.sport}: avg height ${s.stats.avgHeight?.toFixed(1) ?? 'N/A'}cm, avg weight ${s.stats.avgWeight?.toFixed(1) ?? 'N/A'}kg, avg age ${s.stats.avgAge?.toFixed(1) ?? 'N/A'}, medal rate ${(s.stats.medalRate * 100).toFixed(1)}%`,
  )
  .join('\n')}

As Coach Rivera, identify 2-3 Team USA sports where this athlete profile would thrive most emotionally and physically. For each sport explain:
1. What makes this body "built" for it from a training-load perspective
2. The emotional and psychological fit — what kind of competitor this person would become
3. The specific training arc and how their endurance/power profile (${req.endurance}/100 endurance, ${req.power}/100 power) maps to the demands of this sport
4. One vivid mental image of this athlete competing at their peak

Be direct, passionate, and specific. Reference the actual biometrics with US measurements throughout.`;

  const result = await withTimeout(model.generateContent(prompt), 'Coach persona');
  const text = result.response.text();
  return {
    persona: 'coach',
    candidates: req.closestSports.slice(0, 3).map((s) => s.sport),
    analysis: text,
  };
}
