export type GoldenYear = {
  year: string;
  city: string;
  medals: number;
  athletes: number;
  avgHeightCm: number | null;
  avgWeightKg: number | null;
};

export type SportStats = {
  avgHeight: number | null;
  avgWeight: number | null;
  avgAge: number | null;
  medalRate: number;
  athleteCount: number;
  goldenYear?: GoldenYear | null;
};

export type ClosestSport = {
  sport: string;
  stats: SportStats;
};

export type AnalyzeRequest = {
  heightInches: number;
  weightLbs: number;
  age: number;
  gender: string;
  endurance: number;
  power: number;
  closestSports: ClosestSport[];
};

export type Archetype = {
  rank: number;
  archetypeName: string;
  sport: string;
  paralympic: boolean;
  matchScore: number;
  tagline: string;
  why: string;
  goldenEra: string;
  historicalNote: string;
  lateBloomer: string;
  traits: string[];
};

export type ArchetypeResult = {
  overallArchetype: string;
  tagline: string;
  funFact: string;
  archetypes: Archetype[];
};

export type PersonaOutput = {
  persona: 'coach' | 'scientist' | 'historian';
  candidates: string[];
  analysis: string;
};
