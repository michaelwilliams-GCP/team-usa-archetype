import { useState, useEffect } from 'react';
import Papa from 'papaparse';

function fetchCSV(filename) {
  return new Promise((resolve, reject) => {
    Papa.parse(`/data/${filename}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
      error: (e) => reject(e),
    });
  });
}

function avg(arr) {
  const clean = arr.map(Number).filter((n) => !Number.isNaN(n) && n > 0);
  if (!clean.length) return null;
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length);
}

function toMetric(height, weight) {
  return {
    heightCm: Math.round(Number(height)),
    weightKg: Math.round(Number(weight)),
  };
}

function buildUSAStats(rows) {
  const usa = rows.filter((r) => r.NOC === 'USA');
  const bySport = {};

  for (const row of usa) {
    const sport = row.Sport?.trim();
    const year = row.Year?.trim();
    const city = row.City?.trim();
    if (!sport || !year) continue;

    if (!bySport[sport]) {
      bySport[sport] = { heights: [], weights: [], ages: [], medals: 0, total: 0, byYear: {} };
    }

    const s = bySport[sport];
    s.heights.push(row.Height);
    s.weights.push(row.Weight);
    s.ages.push(row.Age);
    s.total += 1;

    const hasMedal = row.Medal && row.Medal !== 'NA';
    if (hasMedal) s.medals += 1;

    if (!s.byYear[year]) s.byYear[year] = { city, medals: 0, total: 0, heights: [], weights: [] };
    s.byYear[year].total += 1;
    s.byYear[year].heights.push(row.Height);
    s.byYear[year].weights.push(row.Weight);
    if (hasMedal) s.byYear[year].medals += 1;
  }

  const sports = {};
  for (const [sport, data] of Object.entries(bySport)) {
    let goldenYear = null;
    let bestMedals = 0;
    for (const [year, yd] of Object.entries(data.byYear)) {
      if (yd.total >= 3 && yd.medals > bestMedals) {
        bestMedals = yd.medals;
        goldenYear = {
          year,
          city: yd.city,
          medals: yd.medals,
          athletes: yd.total,
          avgHeightCm: avg(yd.heights),
          avgWeightKg: avg(yd.weights),
        };
      }
    }
    const avgHeightCm = avg(data.heights);
    const avgWeightKg = avg(data.weights);
    sports[sport] = {
      avgHeight: avgHeightCm,
      avgWeight: avgWeightKg,
      avgHeightCm,
      avgWeightKg,
      avgAge: avg(data.ages),
      medalRate: data.total > 0 ? Math.round((data.medals / data.total) * 100) / 100 : 0,
      athleteCount: data.total,
      goldenYear,
    };
  }
  return sports;
}

function findClosestSports(sportStats, heightCm, weightKg, topN = 10) {
  return Object.entries(sportStats)
    .filter(([, s]) => s.avgHeight && s.avgWeight)
    .map(([sport, s]) => {
      const hDiff = Math.abs(s.avgHeight - heightCm) / heightCm;
      const wDiff = Math.abs(s.avgWeight - weightKg) / weightKg;
      return { sport, score: hDiff + wDiff, stats: s };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, topN);
}

export function buildDataContext(sportStats, profile) {
  if (!sportStats || Object.keys(sportStats).length === 0) {
    return 'Note: Live dataset unavailable — use training knowledge of Team USA historical patterns.';
  }
  const { heightCm, weightKg } = toMetric(profile.height, profile.weight);
  const closest = findClosestSports(sportStats, heightCm, weightKg);

  const lines = closest.map((s) => {
    const base = `  • ${s.sport}: avg height ${s.stats.avgHeight}cm, avg weight ${s.stats.avgWeight}kg, avg age ${s.stats.avgAge}, ${s.stats.athleteCount.toLocaleString()} USA athletes, ${Math.round(s.stats.medalRate * 100)}% medal rate`;
    if (s.stats.goldenYear) {
      const g = s.stats.goldenYear;
      return `${base}\n    ↳ GOLDEN ERA: ${g.year} ${g.city} Games — Team USA won ${g.medals} medals with ${g.athletes} athletes (avg ${g.avgHeightCm}cm / ${g.avgWeightKg}kg)`;
    }
    return base;
  });

  return `
REAL USA ATHLETE DATA (120 Years, 1896–2016):
Fan's profile in metric: ${heightCm}cm / ${weightKg}kg / age ${profile.age}

Top biometric-matched sports from historical USA data:
${lines.join('\n')}

CRITICAL INSTRUCTION — GOLDEN ERA USAGE:
For each sport you recommend, you MUST reference its specific GOLDEN ERA year and city.
Example: "At the [YEAR] [CITY] Games, Team USA athletes averaging [H]cm and [W]kg — a profile strikingly similar to yours — claimed [N] medals."
Use the exact numbers. Do NOT invent years or medal counts. This real data is what makes the experience feel personal.
`.trim();
}

export function getClosestSports(sportStats, profile) {
  if (!sportStats) return [];
  const { heightCm, weightKg } = toMetric(profile.height, profile.weight);
  return findClosestSports(sportStats, heightCm, weightKg, 3);
}

export function useOlympicData() {
  const [sportStats, setSportStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCSV('athlete_events.csv')
      .then((rows) => setSportStats(buildUSAStats(rows)))
      .catch((err) => {
        console.warn('CSV load failed:', err.message);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    sportStats,
    loading,
    error,
    findClosestSports: (profile) => {
      if (!sportStats) return [];
      const { heightCm, weightKg } = toMetric(profile.height, profile.weight);
      return findClosestSports(sportStats, heightCm, weightKg);
    }
  };
}
