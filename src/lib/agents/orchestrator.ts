import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Schema } from '@google/generative-ai';
import type { AnalyzeRequest, ArchetypeResult, PersonaOutput } from './types';
import { MODEL_NAME, withTimeout } from './utils';

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    overallArchetype: { type: SchemaType.STRING },
    tagline: { type: SchemaType.STRING },
    funFact: { type: SchemaType.STRING },
    archetypes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          rank: { type: SchemaType.INTEGER },
          archetypeName: { type: SchemaType.STRING },
          sport: { type: SchemaType.STRING },
          paralympic: { type: SchemaType.BOOLEAN },
          matchScore: { type: SchemaType.NUMBER },
          tagline: { type: SchemaType.STRING },
          why: { type: SchemaType.STRING },
          goldenEra: { type: SchemaType.STRING },
          historicalNote: { type: SchemaType.STRING },
          lateBloomer: { type: SchemaType.STRING },
          traits: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: [
          'rank',
          'archetypeName',
          'sport',
          'paralympic',
          'matchScore',
          'tagline',
          'why',
          'goldenEra',
          'historicalNote',
          'lateBloomer',
          'traits',
        ],
      },
    },
  },
  required: ['overallArchetype', 'tagline', 'funFact', 'archetypes'],
};

export async function runOrchestrator(
  req: AnalyzeRequest,
  personas: PersonaOutput[],
  apiKey: string,
): Promise<ArchetypeResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: `You are the master synthesizer for Team USA's athlete archetype engine — a fusion of coaching intuition, biomechanical science, and 120 years of Olympic and Paralympic history.
You receive analysis from three expert personas and distill it into the definitive structured verdict.
The output MUST contain exactly 3 archetypes. The 3rd archetype MUST be a Paralympic sport with paralympic: true.
Every field must be complete, specific, and reference the athlete's actual measurements.
Use conditional language: "could align with," "profiles like yours have historically," "your biometrics suggest affinity for."
Match scores: rank 1 highest (85-98), rank 2 (75-90), rank 3 Paralympic (70-88).`,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const bmi = (req.weightLbs / Math.pow(req.heightInches / 39.37, 2)).toFixed(1);
  const feet = Math.floor(req.heightInches / 12);
  const inches = req.heightInches % 12;

  const coachAnalysis = personas.find((p) => p.persona === 'coach')?.analysis ?? '';
  const scientistAnalysis = personas.find((p) => p.persona === 'scientist')?.analysis ?? '';
  const historianAnalysis = personas.find((p) => p.persona === 'historian')?.analysis ?? '';

  const prompt = `Athlete biometric profile (use these exact numbers in every field):
Height: ${req.heightInches} inches (${feet}'${inches}")
Weight: ${req.weightLbs} lbs
BMI: ${bmi}
Age: ${req.age}
Gender: ${req.gender}
Endurance: ${req.endurance}/100 | Power: ${req.power}/100

Closest Team USA sports:
${req.closestSports
  .map(
    (s) =>
      `${s.sport}: medal rate ${(s.stats.medalRate * 100).toFixed(1)}%, avg height ${s.stats.avgHeight?.toFixed(1) ?? 'N/A'}cm, avg weight ${s.stats.avgWeight?.toFixed(1) ?? 'N/A'}kg${s.stats.goldenYear ? ` | Golden Year: ${s.stats.goldenYear.year} ${s.stats.goldenYear.city} (${s.stats.goldenYear.medals} medals)` : ''}`,
  )
  .join('\n')}

═══ COACH RIVERA'S ASSESSMENT ═══
${coachAnalysis}

═══ DR. CHEN'S BIOMECHANICAL ANALYSIS ═══
${scientistAnalysis}

═══ MARCUS WEBB'S HISTORICAL LINEAGE ═══
${historianAnalysis}

Synthesize all three expert perspectives into exactly 3 archetypes. Requirements:
- Archetypes ranked 1 and 2: Olympic sports (paralympic: false)
- Archetype ranked 3: MUST be a Paralympic sport (paralympic: true), with full analytical depth equal to ranks 1-2
- Every "why" field: 4+ sentences, must reference "${req.heightInches} inches," "${req.weightLbs} lbs," and "BMI ${bmi}" explicitly. Include typical age range and weight range for the sport.
- Every "goldenEra" field: name a specific real Olympic/Paralympic Games city and year with a cinematic achievement
- Every "historicalNote" field: include a specific percentage or quantitative trend from Team USA history
- Every "lateBloomer" field: reference age ${req.age} explicitly and place it in the development arc for that sport
- Every "traits" array: exactly 4 specific trait strings
- "overallArchetype": a bold superhero-classification name (e.g., "The Kinetic Architect")
- "funFact": one surprising, specific stat about this exact body profile (${req.heightInches} in / ${req.weightLbs} lbs / BMI ${bmi}) in Team USA history
- Use conditional language throughout: "could align with," "profiles like yours have historically," "your biometrics suggest"
- Archetype names: bold, original, superhero-style (e.g., "The Aerodynamic Ghost," "The Structural Powerhouse," "The Velocity Matrix")`;

  const result = await withTimeout(model.generateContent(prompt), 'Orchestrator synthesis');
  const text = result.response.text();
  const parsed = JSON.parse(text) as ArchetypeResult;

  if (!Array.isArray(parsed.archetypes) || parsed.archetypes.length !== 3) {
    throw new Error('Gemini returned an invalid archetype count');
  }

  if (!parsed.archetypes[2]?.paralympic) {
    throw new Error('Gemini response is missing the required Paralympic archetype');
  }

  return parsed;
}
