# Agent-Team-Driven Product Completion: Olympic Archetype

**Date:** 2026-05-11
**Status:** Completed

## Goal

Ship `team-usa-archetype` as a complete, deployable product by dispatching a Claude Code agent team in parallel, then funneling all findings through a devil's-advocate reviewer whose punch list is fixed before merge.

The user-facing product also gains a multi-persona Gemini orchestration ("Coach + Sports Scientist + Historian") so the "agent team" framing exists on both the build side and inside the product itself.

## Original state (audit addressed)

- `src/app/page.tsx` is the live entry; `src/app/App.jsx` (583 lines) is unreferenced dead code with a competing implementation.
- `src/components/AthleteForm.tsx` calls Gemini directly from the browser using `process.env.NEXT_PUBLIC_GEMINI_API_KEY` — the API key is exposed to every visitor.
- `console.log('Gemini API Key loaded:', !!...)` in production code.
- `src/useOlympicData.js` is plain JS in an otherwise TS project.
- No `.env.example`; new contributors can't tell what env vars exist.
- No API route, no error boundary, no tests.

## Build approach

**Approach B — parallel build + devil's-advocate review pass.** Three independent slices that don't share files; one critic runs after; main thread fixes the punch list.

```
   ┌─────────────────────┐
   │ Security/Backend    │──┐
   └─────────────────────┘  │
   ┌─────────────────────┐  │   ┌──────────────────┐   ┌────────────────┐
   │ AI / Multi-Agent    │──┼──▶│ Devil's Advocate │──▶│ Fix everything │
   └─────────────────────┘  │   └──────────────────┘   └────────────────┘
   ┌─────────────────────┐  │
   │ Frontend / Cleanup  │──┘
   └─────────────────────┘
```

## Team

### 1. Security/Backend agent
- Add `app/api/analyze/route.ts` Route Handler (Node runtime, Fluid Compute default).
- Switch to server-only `GEMINI_API_KEY` (no `NEXT_PUBLIC_` prefix).
- Add `.env.example` with `GEMINI_API_KEY=`.
- Remove the `console.log` of key presence.
- Endpoint accepts the form payload, returns the structured recommendation JSON.

### 2. AI / Multi-Agent agent
- Implement orchestration in `src/lib/agents/`:
  - `coach.ts` — motivational fit and training-load take.
  - `scientist.ts` — body-metric similarity to historical archetypes.
  - `historian.ts` — Team USA precedent and lineage.
  - `orchestrator.ts` — calls the three personas (parallel), then a synthesis step that produces a single typed `Recommendation`.
- Single Gemini model (`gemini-2.5-flash`) with three differentiated system prompts; structured JSON output via `responseSchema`.
- Lives behind the `/api/analyze` Route Handler — the frontend never sees Gemini.

### 3. Frontend / Cleanup agent
- Delete `src/app/App.jsx` (unreferenced).
- Convert `src/useOlympicData.js` → `src/useOlympicData.ts` with proper types.
- Replace the in-component Gemini call in `AthleteForm.tsx` with a `fetch('/api/analyze', …)` call.
- Add `app/error.tsx` error boundary and a real loading state for the orchestration (it's slower than a single call).
- Verify the existing animated UI still renders and feels intentional.

### 4. Devil's Advocate reviewer (runs after 1–3)
Independent critique with a checklist:
- Is the API key truly server-only? Grep for `NEXT_PUBLIC_GEMINI`.
- Does the structured output schema actually constrain Gemini, or can it hallucinate fields?
- What happens on API timeout / 429 / partial persona failure? Is the user stuck on a spinner?
- Are types real or `any`-laden?
- Did anyone leave dead code, console.logs, or TODOs?
- Does `npm run build` succeed cleanly?
- Is the multi-agent prompt actually different per persona, or is it three calls to the same prompt?

Returns a numbered punch list.

### 5. Fix-everything pass (main thread)
Address every item on the punch list, then re-verify with `npm run build` and a manual flow check.

## Data flow (post-build)

```
Browser form
   │  POST /api/analyze (JSON)
   ▼
Route Handler (server, holds GEMINI_API_KEY)
   │
   ▼
orchestrator.ts
   ├─ coach.ts       ─┐
   ├─ scientist.ts   ─┼─ parallel Gemini calls
   └─ historian.ts   ─┘
                      │
                      ▼
                synthesis call → typed Recommendation JSON
                      │
                      ▼
                Browser renders result card
```

## Out of scope

- Auth / user accounts.
- Persisting recommendations to a DB.
- BigQuery / Looker dashboard wiring (README mentions it; not on this milestone).
- E2E tests beyond a manual flow check.

## Success criteria

1. `npm run build` passes with no errors.
2. `grep -r 'NEXT_PUBLIC_GEMINI' src/` returns nothing.
3. Submitting the form routes through server-side coach, scientist, historian, and synthesis calls.
4. Persona failures and timeouts have tracked fallbacks before synthesis.
5. `App.jsx` is gone; `useOlympicData` is `.ts`.
