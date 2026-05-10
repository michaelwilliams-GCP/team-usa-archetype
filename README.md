# Team USA Archetype Lab

Interactive Next.js app that matches a fan profile against historical Team USA Olympic data, then asks a Gemini-powered specialist panel to synthesize three sport archetypes. The Gemini API key stays on the server behind `app/api/analyze`.

## What It Does

- Loads Team USA athlete data from `public/data/athlete_events.csv`.
- Computes closest sport profiles by height, weight, age, medal rate, and golden-year context.
- Runs three server-side Gemini personas: coach, sports scientist, and historian.
- Synthesizes one structured result with two Olympic archetypes and one Paralympic archetype.
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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run lint
npm run build
```

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Chart.js / react-chartjs-2
- PapaParse
- Gemini via `@google/generative-ai`
