import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MODEL_NAME, withTimeout } from '@/lib/agents/utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_SPORTS = 12;
const MAX_SPORT_NAME_LENGTH = 80;

type MomentumResult = {
  sport: string;
  momentumScore: number;
  growthTrajectory: string;
  keyMilestones: string[];
  preparationStatus: string;
  analysis: string;
};

type MomentumResponse = {
  results: MomentumResult[];
};

function clampScore(value: unknown, fallback: number) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function deterministicScore(sport: string) {
  const seed = [...sport].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
  return 62 + (seed % 34);
}

function defaultMomentumResult(sport: string, notice?: string): MomentumResult {
  const score = deterministicScore(sport);
  const phase = score >= 80 ? 'strong' : score >= 70 ? 'steady' : 'developing';

  return {
    sport,
    momentumScore: score,
    growthTrajectory: `Team USA shows ${phase} development signals in ${sport}, with enough historical coverage for a practical LA28 planning view.`,
    keyMilestones: [
      'Review aggregate athlete coverage and sport-level body metric patterns',
      'Identify regional hub strengths and training access constraints',
      'Track qualification-cycle milestones through the LA28 preparation window',
      'Keep Olympic and Paralympic pathways visible in the same product surface',
    ],
    preparationStatus: 'Planning signal is active; scores are relative indicators for demo exploration.',
    analysis:
      notice ??
      `${sport} is scored with deterministic local logic because live Gemini enrichment is optional for the hackathon demo.`,
  };
}

function sanitizeSports(body: unknown): string[] | null {
  if (!Array.isArray(body) || body.length === 0 || body.length > MAX_SPORTS) return null;

  const sports = new Set<string>();
  for (const item of body) {
    if (typeof item !== 'string') return null;
    const sport = item.trim();
    if (!sport || sport.length > MAX_SPORT_NAME_LENGTH) return null;
    sports.add(sport);
  }

  return sports.size > 0 ? [...sports] : null;
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text;
  const match = fenced.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function cleanString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 600) : fallback;
}

function cleanMilestones(value: unknown, sport: string) {
  const fallback = defaultMomentumResult(sport).keyMilestones;
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim().slice(0, 180))
    .slice(0, 5);

  return cleaned.length >= 3 ? cleaned : fallback;
}

function normalizeMomentumResult(sport: string, parsed: Record<string, unknown> | null): MomentumResult {
  const fallback = defaultMomentumResult(sport, `Gemini enrichment returned a partial result, so ${sport} uses deterministic guardrails.`);
  if (!parsed) return fallback;

  return {
    sport,
    momentumScore: clampScore(parsed.momentumScore, fallback.momentumScore),
    growthTrajectory: cleanString(parsed.growthTrajectory, fallback.growthTrajectory),
    keyMilestones: cleanMilestones(parsed.keyMilestones, sport),
    preparationStatus: cleanString(parsed.preparationStatus, fallback.preparationStatus),
    analysis: cleanString(parsed.analysis, fallback.analysis),
  };
}

async function analyzeSportMomentum(sport: string, apiKey: string): Promise<MomentumResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `Analyze Team USA's relative preparation momentum for ${sport} leading to the 2028 Los Angeles Games.

Use careful language: this is a planning signal, not an outcome prediction or athlete selection claim. Consider broad public factors such as historical Team USA participation, training ecosystem maturity, youth pipeline visibility, facility access, international competitiveness, and LA28 preparation milestones.

Return only JSON with this exact shape:
{
  "momentumScore": number,
  "growthTrajectory": "1-2 sentences",
  "keyMilestones": ["3-5 concise milestones"],
  "preparationStatus": "1 sentence",
  "analysis": "2-3 sentences"
}`;

  try {
    const result = await withTimeout(model.generateContent(prompt), `Momentum analysis for ${sport}`);
    const text = result.response.text();
    return normalizeMomentumResult(sport, parseJsonObject(text));
  } catch (error) {
    console.error(`[/api/momentum] ${sport} analysis failed:`, error);
    return defaultMomentumResult(
      sport,
      `Live Gemini enrichment was unavailable for ${sport}, so the product returned deterministic demo-mode momentum analysis.`,
    );
  }
}

export async function POST(req: Request): Promise<NextResponse<MomentumResponse | { error: string }>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sports = sanitizeSports(body);
  if (!sports) {
    return NextResponse.json(
      { error: `Body must be a non-empty array of up to ${MAX_SPORTS} sport names.` },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const results = apiKey
    ? await Promise.all(sports.map((sport) => analyzeSportMomentum(sport, apiKey)))
    : sports.map((sport) => defaultMomentumResult(sport));

  return NextResponse.json({ results }, { status: 200 });
}
