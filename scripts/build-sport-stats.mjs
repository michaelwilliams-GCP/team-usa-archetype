import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

const inputPath = path.join(process.cwd(), 'public/data/athlete_events.csv');
const outputPath = path.join(process.cwd(), 'public/data/team-usa-sport-stats.json');

function avg(values) {
  const clean = values.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  if (clean.length === 0) return null;
  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
}

function buildUSAStats(rows) {
  const bySport = {};

  for (const row of rows) {
    if (row.NOC !== 'USA') continue;
    const sport = row.Sport?.trim();
    const year = row.Year?.trim();
    const city = row.City?.trim() ?? '';
    if (!sport || !year) continue;

    bySport[sport] ??= { heights: [], weights: [], ages: [], medals: 0, total: 0, byYear: {} };

    const sportBucket = bySport[sport];
    sportBucket.heights.push(row.Height);
    sportBucket.weights.push(row.Weight);
    sportBucket.ages.push(row.Age);
    sportBucket.total += 1;

    const hasMedal = row.Medal && row.Medal !== 'NA';
    if (hasMedal) sportBucket.medals += 1;

    sportBucket.byYear[year] ??= { city, medals: 0, total: 0, heights: [], weights: [] };
    const yearBucket = sportBucket.byYear[year];
    yearBucket.total += 1;
    yearBucket.heights.push(row.Height ?? '');
    yearBucket.weights.push(row.Weight ?? '');
    if (hasMedal) yearBucket.medals += 1;
  }

  return Object.fromEntries(
    Object.entries(bySport)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sport, data]) => {
        let goldenYear = null;
        let bestMedals = 0;

        for (const [year, yearData] of Object.entries(data.byYear)) {
          if (yearData.total >= 3 && yearData.medals > bestMedals) {
            bestMedals = yearData.medals;
            goldenYear = {
              year,
              city: yearData.city,
              medals: yearData.medals,
              athletes: yearData.total,
              avgHeightCm: avg(yearData.heights),
              avgWeightKg: avg(yearData.weights),
            };
          }
        }

        const avgHeightCm = avg(data.heights);
        const avgWeightKg = avg(data.weights);
        return [
          sport,
          {
            avgHeight: avgHeightCm,
            avgWeight: avgWeightKg,
            avgHeightCm,
            avgWeightKg,
            avgAge: avg(data.ages),
            medalRate: data.total > 0 ? Math.round((data.medals / data.total) * 100) / 100 : 0,
            athleteCount: data.total,
            goldenYear,
          },
        ];
      }),
  );
}

const csv = fs.readFileSync(inputPath, 'utf8');
const parsed = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true,
});

if (parsed.errors.length > 0) {
  console.error(parsed.errors.slice(0, 3));
  throw new Error('Failed to parse athlete_events.csv');
}

const stats = buildUSAStats(parsed.data);
fs.writeFileSync(outputPath, `${JSON.stringify(stats, null, 2)}\n`);
console.log(`Wrote ${Object.keys(stats).length} sport summaries to ${outputPath}`);
