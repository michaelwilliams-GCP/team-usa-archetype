import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'team-usa-archetype-lab',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'local',
    analysisMode: process.env.GEMINI_API_KEY ? 'gemini-ready' : 'demo-ready',
    googleCloudTarget: 'cloud-run',
  });
}
