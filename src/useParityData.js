import { useState, useEffect } from 'react';
import Papa from 'papaparse';

function fetchCSV(filename) {
  return new Promise((resolve, reject) => {
    Papa.parse(filename.startsWith('/') ? filename : `/data/${filename}`, {
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

function buildStats(rows, isOlympic = true) {
  const usa = isOlympic ? rows.filter((r) => r.NOC === 'USA') : rows; // Paralympic has no NOC, assume all USA?
  const bySport = {};
  const byYear = {};

  for (const row of usa) {
    const sport = (row.Sport || row.sport)?.trim();
    const year = (row.Year || row.year)?.trim();
    if (!sport || !year) continue;

    if (!bySport[sport]) {
      bySport[sport] = { heights: [], weights: [], ages: [], medals: 0, total: 0, byYear: {} };
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

    if (!s.byYear[year]) s.byYear[year] = { medals: 0, total: 0, heights: [], weights: [] };
    s.byYear[year].total += 1;
    s.byYear[year].heights.push(row.Height || row.height_cm);
    s.byYear[year].weights.push(row.Weight || row.weight_kg);
    if (isOlympic && row.Medal && row.Medal !== 'NA') s.byYear[year].medals += 1;

    // Aggregate by year
    if (!byYear[year]) byYear[year] = { total: 0, medals: 0 };
    byYear[year].total += 1;
    if (isOlympic && row.Medal && row.Medal !== 'NA') byYear[year].medals += 1;
  }

  const sports = {};
  for (const [sport, data] of Object.entries(bySport)) {
    const avgHeightCm = avg(data.heights);
    const avgWeightKg = avg(data.weights);
    sports[sport] = {
      avgHeight: avgHeightCm,
      avgWeight: avgWeightKg,
      avgHeightCm,
      avgWeightKg,
      avgAge: avg(data.ages),
      medalRate: isOlympic && data.total > 0 ? Math.round((data.medals / data.total) * 100) / 100 : 0,
      athleteCount: data.total,
      medals: data.medals,
    };
  }

  const totalAthletes = Object.values(sports).reduce((sum, s) => sum + s.athleteCount, 0);
  const totalMedals = isOlympic ? Object.values(sports).reduce((sum, s) => sum + s.medals, 0) : 0;
  const totalSports = Object.keys(sports).length;

  return { sports, totalAthletes, totalMedals, totalSports, byYear };
}

export function useParityData() {
  const [olympicStats, setOlympicStats] = useState(null);
  const [paralympicStats, setParalympicStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchCSV('/data/athlete_events.csv').then(rows => buildStats(rows, true)),
      fetchCSV('/data/paralympic_athletes.csv').then(rows => buildStats(rows, false))
    ])
      .then(([olympic, paralympic]) => {
        setOlympicStats(olympic);
        setParalympicStats(paralympic);
      })
      .catch((err) => {
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