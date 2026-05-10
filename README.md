# Team USA Archetype Lab

Interactive Next.js app that matches a fan profile against historical Team USA Olympic data, then asks a Gemini-powered specialist panel to synthesize three sport archetypes. The Gemini API key stays on the server behind `app/api/analyze`.

## What It Does

- Loads Team USA athlete data from `public/data/athlete_events.csv`.
- Serves a precomputed sport-stat summary from `public/data/team-usa-sport-stats.json` for fast first use.
- Computes closest sport profiles by height, weight, age, medal rate, and golden-year context.
- Runs three server-side Gemini personas: coach, sports scientist, and historian.
- Synthesizes one structured result with two Olympic archetypes and one Paralympic archetype.
- Falls back to deterministic demo-mode recommendations when `GEMINI_API_KEY` is not configured.
- Renders a responsive scouting-room UI with charts and an embedded Looker Studio dashboard.

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your Gemini key to `.env.local`:

```bash
GEMINI_API_KEY=your_actual_api_key
```

Run the app:

```bash
./run.sh
```

Open [http://localhost:3000](http://localhost:3000).

Use live Gemini mode by adding `GEMINI_API_KEY` to `.env.local`. Without a key, the product runs deterministic demo mode so the interface and judging flow still work.

## Scripts

```bash
./run.sh --check
npm run lint
npm run build
npm run smoke
npm test
```

Regenerate the sport-stat summary after replacing `public/data/athlete_events.csv`:

```bash
npm run build:data
```

## Hackathon Submission

See [docs/HACKATHON_SUBMISSION.md](docs/HACKATHON_SUBMISSION.md) for the Devpost copy, demo video outline, compliance notes, and final checklist.

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Chart.js / react-chartjs-2
- PapaParse
- Gemini via `@google/generative-ai`
