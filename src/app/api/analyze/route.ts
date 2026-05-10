import { NextResponse } from 'next/server';
import type { AnalyzeRequest, ArchetypeResult } from '@/lib/agents/types';
import { runCoach } from '@/lib/agents/coach';
import { runScientist } from '@/lib/agents/scientist';
import { runHistorian } from '@/lib/agents/historian';
import { runOrchestrator } from '@/lib/agents/orchestrator';

function isValidRequest(body: unknown): body is AnalyzeRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.heightInches !== 'number' || isNaN(b.heightInches)) return false;
  if (typeof b.weightLbs !== 'number' || isNaN(b.weightLbs)) return false;
  if (typeof b.age !== 'number' || isNaN(b.age)) return false;
  if (typeof b.gender !== 'string' || b.gender.trim() === '') return false;
  if (typeof b.endurance !== 'number' || isNaN(b.endurance)) return false;
  if (typeof b.power !== 'number' || isNaN(b.power)) return false;
  if (!Array.isArray(b.closestSports) || b.closestSports.length === 0) return false;
  return true;
}

export async function POST(req: Request): Promise<NextResponse<ArchetypeResult | { error: string }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

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

  try {
    const [coachOut, scientistOut, historianOut] = await Promise.all([
      runCoach(body, apiKey),
      runScientist(body, apiKey),
      runHistorian(body, apiKey),
    ]);

    const result = await runOrchestrator(body, [coachOut, scientistOut, historianOut], apiKey);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[/api/analyze] upstream error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
