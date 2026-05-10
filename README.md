# Find Your Sport - Athlete Archetype Agent

User fills out a short form (height, weight, strength vs. endurance, age, etc.) → Gemini analyzes their profile against 120 years of Team USA athlete archetypes → Returns their top sport matches with a story about why, including Paralympic options. Clean, fun, shareable.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your Gemini API key to `.env.local`:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Interactive form for athlete profiling
- Real-time analysis using Gemini AI
- Historical Team USA athlete data integration
- **Data Visualizations**: Interactive charts showing height/weight distributions and medal rates
- **Google Cloud Integration**: Ready for BigQuery + Looker Studio dashboards
- Olympic and Paralympic sport recommendations
- Clean, responsive UI with Tailwind CSS

## Google Cloud Integration

This app demonstrates Google Cloud Platform capabilities:

### BigQuery + Looker Studio
- Load athlete data into BigQuery for advanced analytics
- Create Looker Studio dashboards for interactive visualizations
- Build predictive models for sport recommendations
- Real-time data processing and insights

### Gemini AI
- Natural language processing for athlete profiling
- Contextual analysis using historical data
- Personalized sport recommendations

### Data Flow
1. CSV data → BigQuery tables
2. Looker Studio dashboards for visualization
3. App queries BigQuery/Looker for real-time insights
4. Gemini analyzes user profiles against historical data

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
