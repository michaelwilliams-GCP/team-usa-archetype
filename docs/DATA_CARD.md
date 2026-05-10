# Data Card

## Dataset

The app uses `public/data/athlete_events.csv`, a historical athlete event dataset, and filters it to Team USA rows where `NOC === "USA"`.

## Derived Product Data

`npm run build:data` produces `public/data/team-usa-sport-stats.json`, a compact aggregate summary used by the application. The generated fields are sport-level averages and counts:

- Average height, weight, and age.
- Athlete entry count.
- Medal rate from medal-bearing rows.
- Golden-year context from medal density by year.

The product does not expose individual athlete names, images, likenesses, event placements, finish times, scores, or rank-level claims.

## How Matching Works

The client computes closest sport profiles from the aggregate JSON using normalized distance across height, weight, age, medal-rate signal, and golden-year context. The server receives the top aggregate sport candidates, then either:

- Calls Gemini with coach, sports-scientist, historian, and orchestrator prompts when `GEMINI_API_KEY` is configured.
- Returns deterministic demo-mode archetypes when the key is absent.

Every successful response is constrained to exactly three archetypes: two Olympic archetypes and one Paralympic archetype.

## Limitations

The app is a fan-facing historical mirror, not a talent-identification system. It does not predict performance, eligibility, selection, medical readiness, or training outcomes. The matching result should be read as conditional storytelling based on aggregate Team USA history.

## Safety and Brand Posture

The interface avoids Olympic rings, torch marks, athlete NIL, individual athlete recommendations, finish times, and scoring results. Copy uses conditional language such as "could align" and "historically similar" to avoid overclaiming.
