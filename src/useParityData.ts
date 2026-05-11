import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import type { SportStatMap } from '@/useOlympicData';

// Type definitions
interface RawRow {
  Sport?: string;
  sport?: string;
  Year?: string;
  year?: string;
  Height?: string;
  height_cm?: string;
  Weight?: string;
  weight_kg?: string;
  Age?: string;
  age?: string;
  [key: string]: string | undefined;
}

interface YearAggregation {
  total: number;
  medals: number;
}

interface SportData {
  heights: (string | undefined)[];
  weights: (string | undefined)[];
  ages: (string | undefined)[];
  medals: number;
  total: number;
  byYear: Record<string, {
    medals: number;
    total: number;
    heights: (string | undefined)[];
    weights: (string | undefined)[];
  }>;
}

export interface ProcessedSport {
  avgHeight: number | null;
  avgWeight: number | null;
  avgHeightCm: number | null;
  avgWeightKg: number | null;
  avgAge: number | null;
  medalRate: number;
  athleteCount: number;
  medals: number;
}

export interface ParityStats {
  sports: Record<string, ProcessedSport>;
  totalAthletes: number;
  totalMedals: number;
  totalSports: number;
  byYear: Record<string, YearAggregation>;
}

export interface ParityDataHookResult {
  olympicStats: ParityStats | null;
  paralympicStats: ParityStats | null;
  loading: boolean;
  error: string | null;
}

function fetchCSV(filename: string): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(filename.startsWith('/') ? filename : `/data/${filename}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r: Papa.ParseResult<RawRow>) => resolve(r.data),
      error: (e: Error) => reject(e),
    });
  });
}

async function fetchOlympicSummary(): Promise<SportStatMap> {
  const res = await fetch('/data/team-usa-sport-stats.json');
  if (!res.ok) throw new Error(`Olympic sport summary failed to load (${res.status})`);
  return (await res.json()) as SportStatMap;
}

function avg(arr: (string | undefined)[]): number | null {
  const clean = arr
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0);
  if (!clean.length) return null;
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length);
}

function buildOlympicStats(summary: SportStatMap): ParityStats {
  const sports: Record<string, ProcessedSport> = {};
  const byYear: Record<string, YearAggregation> = {};

  for (const [sport, stats] of Object.entries(summary)) {
    const medals = Math.round(stats.medalRate * stats.athleteCount);
    sports[sport] = {
      avgHeight: stats.avgHeight,
      avgWeight: stats.avgWeight,
      avgHeightCm: stats.avgHeightCm,
      avgWeightKg: stats.avgWeightKg,
      avgAge: stats.avgAge,
      medalRate: stats.medalRate,
      athleteCount: stats.athleteCount,
      medals,
    };

    if (stats.goldenYear) {
      const year = stats.goldenYear.year;
      if (!byYear[year]) byYear[year] = { total: 0, medals: 0 };
      byYear[year].total += stats.goldenYear.athletes;
      byYear[year].medals += stats.goldenYear.medals;
    }
  }

  return {
    sports,
    totalAthletes: Object.values(sports).reduce((sum, s) => sum + s.athleteCount, 0),
    totalMedals: Object.values(sports).reduce((sum, s) => sum + s.medals, 0),
    totalSports: Object.keys(sports).length,
    byYear,
  };
}

function buildParalympicStats(rows: RawRow[]): ParityStats {
  const bySport: Record<string, SportData> = {};
  const byYear: Record<string, YearAggregation> = {};

  for (const row of rows) {
    const sport = (row.Sport || row.sport)?.trim();
    const year = (row.Year || row.year)?.trim();
    if (!sport || !year) continue;

    if (!bySport[sport]) {
      bySport[sport] = {
        heights: [],
        weights: [],
        ages: [],
        medals: 0,
        total: 0,
        byYear: {},
      };
    }

    const s = bySport[sport];
    s.heights.push(row.Height || row.height_cm);
    s.weights.push(row.Weight || row.weight_kg);
    s.ages.push(row.Age || row.age);
    s.total += 1;

    if (!s.byYear[year]) {
      s.byYear[year] = { medals: 0, total: 0, heights: [], weights: [] };
    }
    s.byYear[year].total += 1;
    s.byYear[year].heights.push(row.Height || row.height_cm);
    s.byYear[year].weights.push(row.Weight || row.weight_kg);

    if (!byYear[year]) byYear[year] = { total: 0, medals: 0 };
    byYear[year].total += 1;
  }

  const sports: Record<string, ProcessedSport> = {};
  for (const [sport, data] of Object.entries(bySport)) {
    const avgHeightCm = avg(data.heights);
    const avgWeightKg = avg(data.weights);
    sports[sport] = {
      avgHeight: avgHeightCm,
      avgWeight: avgWeightKg,
      avgHeightCm,
      avgWeightKg,
      avgAge: avg(data.ages),
      medalRate: 0,
      athleteCount: data.total,
      medals: data.medals,
    };
  }

  const totalAthletes = Object.values(sports).reduce(
    (sum, s) => sum + s.athleteCount,
    0
  );
  const totalSports = Object.keys(sports).length;

  return { sports, totalAthletes, totalMedals: 0, totalSports, byYear };
}

export function useParityData(): ParityDataHookResult {
  const [olympicStats, setOlympicStats] = useState<ParityStats | null>(null);
  const [paralympicStats, setParalympicStats] = useState<ParityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchOlympicSummary().then((summary) => buildOlympicStats(summary)),
      fetchCSV('/data/paralympic_athletes.csv').then((rows) =>
        buildParalympicStats(rows)
      ),
    ])
      .then(([olympic, paralympic]) => {
        setOlympicStats(olympic);
        setParalympicStats(paralympic);
      })
      .catch((err: Error) => {
        console.warn('CSV load failed:', err.message);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    olympicStats,
    paralympicStats,
    loading,
    error,
  };
}
