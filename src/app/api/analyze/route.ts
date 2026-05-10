import { NextResponse } from 'next/server';
import type { AnalyzeRequest, ArchetypeResult, PersonaOutput } from '@/lib/agents/types';
import { runCoach } from '@/lib/agents/coach';
import { runScientist } from '@/lib/agents/scientist';
import { runHistorian } from '@/lib/agents/historian';
import { runOrchestrator } from '@/lib/agents/orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isValidRequest(body: unknown): body is AnalyzeRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.heightInches !== 'number' || !Number.isFinite(b.heightInches) || b.heightInches < 36 || b.heightInches > 100) return false;
  if (typeof b.weightLbs !== 'number' || !Number.isFinite(b.weightLbs) || b.weightLbs < 50 || b.weightLbs > 500) return false;
  if (typeof b.age !== 'number' || !Number.isFinite(b.age) || b.age < 8 || b.age > 90) return false;
  if (typeof b.gender !== 'string' || b.gender.trim() === '') return false;
  if (typeof b.endurance !== 'number' || !Number.isFinite(b.endurance) || b.endurance < 0 || b.endurance > 100) return false;
  if (typeof b.power !== 'number' || !Number.isFinite(b.power) || b.power < 0 || b.power > 100) return false;
  if (!Array.isArray(b.closestSports) || b.closestSports.length === 0) return false;
  return true;
}

async function runPersonaSafely(
  persona: PersonaOutput['persona'],
  req: AnalyzeRequest,
  runner: (req: AnalyzeRequest, apiKey: string) => Promise<PersonaOutput>,
  apiKey: string,
): Promise<PersonaOutput> {
  try {
    return await runner(req, apiKey);
  } catch (err) {
    console.error(`[/api/analyze] ${persona} persona failed:`, err);
    return {
      persona,
      candidates: req.closestSports.slice(0, 3).map((sport) => sport.sport),
      analysis: `${persona} analysis was unavailable, so synthesize from the verified closest-sport data and the other specialist outputs. Keep the result conditional and do not invent unsupported certainty.`,
    };
  }
}

export async function POST(req: Request): Promise<NextResponse<ArchetypeResult | { error: string }>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isValidRequest(body)) {
    return NextResponse.json(
      {
        error:
          'Missing or invalid fields. Required: heightInches (number), weightLbs (number), age (number), gender (string), endurance (number), power (number), closestSports (non-empty array).',
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    const [coachOut, scientistOut, historianOut] = await Promise.all([
      runPersonaSafely('coach', body, runCoach, apiKey),
      runPersonaSafely('scientist', body, runScientist, apiKey),
      runPersonaSafely('historian', body, runHistorian, apiKey),
    ]);

    const result = await runOrchestrator(body, [coachOut, scientistOut, historianOut], apiKey);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[/api/analyze] upstream error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
