import { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Type definitions
interface RawRow {
  NOC?: string;
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
  Medal?: string;
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

interface ProcessedSport {
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

function avg(arr: (string | undefined)[]): number | null {
  const clean = arr
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0);
  if (!clean.length) return null;
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length);
}

function buildStats(rows: RawRow[], isOlympic = true): ParityStats {
  const usa = isOlympic ? rows.filter((r) => r.NOC === 'USA') : rows;
  const bySport: Record<string, SportData> = {};
  const byYear: Record<string, YearAggregation> = {};

  for (const row of usa) {
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

    if (isOlympic) {
      const hasMedal = row.Medal && row.Medal !== 'NA';
      if (hasMedal) s.medals += 1;
    }

    if (!s.byYear[year]) {
      s.byYear[year] = { medals: 0, total: 0, heights: [], weights: [] };
    }
    s.byYear[year].total += 1;
    s.byYear[year].heights.push(row.Height || row.height_cm);
    s.byYear[year].weights.push(row.Weight || row.weight_kg);
    if (isOlympic && row.Medal && row.Medal !== 'NA') {
      s.byYear[year].medals += 1;
    }

    // Aggregate by year
    if (!byYear[year]) byYear[year] = { total: 0, medals: 0 };
    byYear[year].total += 1;
    if (isOlympic && row.Medal && row.Medal !== 'NA') byYear[year].medals += 1;
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
      medalRate:
        isOlympic && data.total > 0
          ? Math.round((data.medals / data.total) * 100) / 100
          : 0,
      athleteCount: data.total,
      medals: data.medals,
    };
  }

  const totalAthletes = Object.values(sports).reduce(
    (sum, s) => sum + s.athleteCount,
    0
  );
  const totalMedals = isOlympic
    ? Object.values(sports).reduce((sum, s) => sum + s.medals, 0)
    : 0;
  const totalSports = Object.keys(sports).length;

  return { sports, totalAthletes, totalMedals, totalSports, byYear };
}

export function useParityData(): ParityDataHookResult {
  const [olympicStats, setOlympicStats] = useState<ParityStats | null>(null);
  const [paralympicStats, setParalympicStats] = useState<ParityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchCSV('/data/athlete_events.csv').then((rows) =>
        buildStats(rows, true)
      ),
      fetchCSV('/data/paralympic_athletes.csv').then((rows) =>
        buildStats(rows, false)
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