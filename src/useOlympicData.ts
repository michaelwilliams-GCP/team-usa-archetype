import { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Raw CSV row — all fields come in as strings from PapaParse
interface RawRow {
  NOC?: string;
  Sport?: string;
  Year?: string;
  City?: string;
  Height?: string;
  Weight?: string;
  Age?: string;
  Medal?: string;
  [key: string]: string | undefined;
}

interface YearData {
  city: string;
  medals: number;
  total: number;
  heights: string[];
  weights: string[];
}

export interface GoldenYear {
  year: string;
  city: string;
  medals: number;
  athletes: number;
  avgHeightCm: number | null;
  avgWeightKg: number | null;
}

export interface SportStats {
  avgHeight: number | null;
  avgWeight: number | null;
  avgHeightCm: number | null;
  avgWeightKg: number | null;
  avgAge: number | null;
  medalRate: number;
  athleteCount: number;
  goldenYear: GoldenYear | null;
}

export interface SportStatMap {
  [sport: string]: SportStats;
}

export interface ClosestSport {
  sport: string;
  score: number;
  stats: SportStats;
}

export interface AthleteProfile {
  height: number;
  weight: number;
  age?: number;
}

export interface OlympicDataHookResult {
  sportStats: SportStatMap | null;
  loading: boolean;
  error: string | null;
  findClosestSports: (profile: AthleteProfile) => ClosestSport[];
}

function fetchCSV(filename: string): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(`/data/${filename}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r: Papa.ParseResult<RawRow>) => resolve(r.data),
      error: (e: Error) => reject(e),
    });
  });
}

async function fetchSportStats(): Promise<SportStatMap> {
  const res = await fetch('/data/team-usa-sport-stats.json');
  if (!res.ok) throw new Error(`Sport summary failed to load (${res.status})`);
  return (await res.json()) as SportStatMap;
}

function avg(arr: (string | undefined)[]): number | null {
  const clean = arr.map(Number).filter((n) => !Number.isNaN(n) && n > 0);
  if (!clean.length) return null;
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length);
}

function toMetric(height: number, weight: number): { heightCm: number; weightKg: number } {
  return {
    heightCm: Math.round(Number(height)),
    weightKg: Math.round(Number(weight)),
  };
}

function buildUSAStats(rows: RawRow[]): SportStatMap {
  const usa = rows.filter((r) => r.NOC === 'USA');
  const bySport: Record<string, {
    heights: (string | undefined)[];
    weights: (string | undefined)[];
    ages: (string | undefined)[];
    medals: number;
    total: number;
    byYear: Record<string, YearData>;
  }> = {};

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

    if (!s.byYear[year]) s.byYear[year] = { city: city ?? '', medals: 0, total: 0, heights: [], weights: [] };
    s.byYear[year].total += 1;
    s.byYear[year].heights.push(row.Height ?? '');
    s.byYear[year].weights.push(row.Weight ?? '');
    if (hasMedal) s.byYear[year].medals += 1;
  }

  const sports: SportStatMap = {};
  for (const [sport, data] of Object.entries(bySport)) {
    let goldenYear: GoldenYear | null = null;
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

function findClosestSports(sportStats: SportStatMap, heightCm: number, weightKg: number, topN = 10): ClosestSport[] {
  return Object.entries(sportStats)
    .filter(([, s]) => s.avgHeight && s.avgWeight)
    .map(([sport, s]) => {
      const hDiff = Math.abs((s.avgHeight as number) - heightCm) / heightCm;
      const wDiff = Math.abs((s.avgWeight as number) - weightKg) / weightKg;
      return { sport, score: hDiff + wDiff, stats: s };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, topN);
}

export function buildDataContext(sportStats: SportStatMap | null, profile: AthleteProfile): string {
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

export function getClosestSports(sportStats: SportStatMap | null, profile: AthleteProfile): ClosestSport[] {
  if (!sportStats) return [];
  const { heightCm, weightKg } = toMetric(profile.height, profile.weight);
  return findClosestSports(sportStats, heightCm, weightKg, 3);
}

export function useOlympicData(): OlympicDataHookResult {
  const [sportStats, setSportStats] = useState<SportStatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSportStats()
      .catch(() => fetchCSV('athlete_events.csv').then((rows) => buildUSAStats(rows)))
      .then((stats) => setSportStats(stats))
      .catch((err: Error) => {
        console.warn('CSV load failed:', err.message);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    sportStats,
    loading,
    error,
    findClosestSports: (profile: AthleteProfile) => {
      if (!sportStats) return [];
      const { heightCm, weightKg } = toMetric(profile.height, profile.weight);
      return findClosestSports(sportStats, heightCm, weightKg);
    },
  };
}
