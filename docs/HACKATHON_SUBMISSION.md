# Hackathon Submission Pack

Submission target: **Team USA x Google Cloud Hackathon - Challenge 4: The Athlete Archetype Agent**

Primary project: **Team USA Archetype Lab**

Rules reference: https://vibecodeforgoldwithgoogle.devpost.com/rules

## Copy-Ready Devpost Summary

Team USA Archetype Lab is a fan-facing analytics agent that lets people enter basic physical traits, then see how their body profile could align with historical Team USA sport archetypes. The product clusters 120 years of US-only athlete records into sport-level patterns, compares a fan profile against those patterns, and uses a Gemini-powered specialist panel to produce two Olympic archetype matches plus one Paralympic archetype match with equal analytical depth.

The experience is built to feel like a scouting-room command center: users can run a sample profile, submit their own profile, inspect match rationale, see golden-era historical context, and explore aggregate Team USA sport profiles through charts. The app uses conditional language throughout and avoids any promise of performance outcomes.

## Challenge Fit

- **Selected challenge:** Challenge 4, The Athlete Archetype Agent.
- **Fan-centric question:** "Which Team USA sport archetypes could my physical profile historically align with?"
- **Digital Mirror angle:** The result helps fans see themselves in Team USA history through data-driven storytelling.
- **Olympic and Paralympic parity:** Every generated result includes two Olympic sport archetypes and a third Paralympic archetype with the same result sections: sport fit, golden era, historical pattern, development arc, and traits.
- **Safety posture:** No individual athlete name, image, likeness, finish times, or scoring results are shown in the product UI.

## Required Submission Assets

- Hosted project URL from Google Cloud deployment.
- Public GitHub repository URL with Apache License 2.0 visible.
- Unlisted YouTube demo video, maximum 3 minutes, in English or with English subtitles.
- Devpost text description covering features, functionality, technologies, data sources, findings, and testing instructions.

Repo-ready support for these assets is included:

- `Dockerfile` and `cloudbuild.yaml` for Cloud Run.
- `docs/DEPLOYMENT.md` with Google Cloud commands and verification steps.
- `/api/health` for deployed service checks.
- `docs/DATA_CARD.md` for source data, aggregation, limitations, and safety posture.

## Technologies Used

- Next.js App Router and React.
- Google Gemini via `@google/generative-ai` on the server route.
- Google Cloud deployment target: Cloud Run is the strongest fit for this Next.js app.
- Cloud Build and Artifact Registry via the included `cloudbuild.yaml`.
- Chart.js and `react-chartjs-2` for aggregate athlete profile visualization.
- PapaParse for regenerating local sport summaries from CSV source data.
- Tailwind CSS for the product interface.

## Data Sources and Compliance Notes

- Uses historical athlete records filtered to Team USA / `NOC === "USA"`.
- Uses aggregate sport-level statistics: average height, average weight, average age, medal rate, entry count, and golden-year medal context.
- Uses medals and placement-style aggregate outcomes only; no finish times or scoring results.
- Does not show athlete-level recommendations or identify private individuals.
- Does not use Team USA athlete images, Olympic rings, torch marks, or athlete NIL.

## How Gemini Is Used

The live analysis route runs a multi-persona Gemini panel:

- Coach persona: motivation, training-load fit, and sport culture fit.
- Sports scientist persona: biometric similarity and power-to-weight interpretation.
- Historian persona: Team USA lineage, golden-era context, and Paralympic inclusion.
- Orchestrator persona: structured synthesis into exactly three archetypes.

If `GEMINI_API_KEY` is not configured, the app returns deterministic demo-mode recommendations from the local Team USA aggregate dataset so judges can still run and inspect the full interface.

## How to Run Locally

```bash
./run.sh
```

Optional live Gemini mode:

```bash
cp .env.example .env.local
# add GEMINI_API_KEY=...
./run.sh
```

Verification:

```bash
./run.sh --check
```

Production-style local run:

```bash
./run.sh --prod --port 3000
```

Cloud Run deployment:

```bash
gcloud builds submit --config cloudbuild.yaml
```

Full deployment notes are in `docs/DEPLOYMENT.md`.

## Demo Video Outline

Target length: 2:30 to 2:50.

1. **0:00-0:20 - Fan question and challenge fit**
   Show the app title and say the product answers: "What Team USA archetypes could my profile historically align with?"

2. **0:20-0:55 - Data and parity**
   Show aggregate dataset stats, charts, and explain US-only historical sport summaries. Emphasize the required Paralympic archetype.

3. **0:55-1:35 - Live product flow**
   Use the sample profile, run analysis, and show the three returned archetypes.

4. **1:35-2:10 - Gemini and Google Cloud**
   Show the API route / code path where Gemini personas run server-side. Show the Google Cloud deployment target or console for Cloud Run.

5. **2:10-2:45 - Why it matters**
   Tie back to impact, technical depth, and presentation: fans get a shareable digital mirror without performance guarantees or NIL issues.

## Devpost Field Draft

**Inspiration**
Team USA fandom is easier to feel when fans can see themselves in the story. This project turns historical Team USA data into a personal, conditional, and inclusive "digital mirror."

**What it does**
Users enter a height, weight, age, division, endurance index, and strength index. The app compares that profile with sport-level Team USA historical clusters and produces archetype recommendations. A Gemini specialist panel synthesizes coach, scientist, and historian perspectives into structured results with Olympic and Paralympic parity.

**How we built it**
The frontend is a Next.js product interface with Chart.js visualizations. The backend is a Next.js route handler that keeps the Gemini key server-side. It calls Gemini personas in parallel, then synthesizes a constrained JSON response. The app precomputes a compact sport-stat JSON summary so startup is fast, while retaining a regeneration script for the source CSV.

**Challenges we ran into**
The largest product challenge was making the app reliable for judging even when live Gemini credentials are not present. We added deterministic demo mode, strict payload validation, response checks, and browser smoke tests so the app remains demonstrable and verifiable.

**Accomplishments**
The project now runs end-to-end with one command, has server-only Gemini integration, includes a mandatory Paralympic archetype, avoids athlete NIL, and ships with automated lint/build/browser smoke coverage.

**What we learned**
A strong fan AI product needs more than generation. It needs safe language, data constraints, fallback behavior, and a clear story that judges can verify quickly.

**What is next**
Deploy to Cloud Run, add Vertex AI migration for enterprise Cloud alignment, add a share-card export that uses abstract animation only, and extend the aggregate data model with hometown-region signals while preserving US-only scope.

## Final Submission Checklist

Repo-ready items:

- [x] Demo mode remains available locally for reviewers.
- [x] `./run.sh --check` verifies lint, build, API behavior, and browser smoke flow.
- [x] Cloud Run deployment files are included.
- [x] `/api/health` is available for deployed service checks.
- [x] Devpost selected challenge is Challenge 4.
- [x] Description mentions Gemini, Google Cloud, data sources, and findings.
- [x] Data card and compliance posture are documented.
- [x] No athlete NIL, Olympic rings, torch marks, unauthorized Team USA/USOPC marks, finish times, or scoring results appear in the submission materials.

Owner action before Devpost submit:

- [ ] Hosted URL works without login.
- [ ] `GEMINI_API_KEY` is configured in the hosted environment.
- [ ] Repository is public.
- [ ] Apache 2.0 license is visible in GitHub About/license UI.
- [ ] Demo video is unlisted, English or subtitled, and no longer than 3 minutes.
- [ ] Demo video shows the live product plus Google Cloud console, AI Studio, or code.
