'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import type { ArchetypeResult } from '@/lib/agents/types';
import type { AthleteProfile, ClosestSport, SportStatMap } from '@/useOlympicData';

type FormState = {
  feet: string;
  inches: string;
  weightLbs: string;
  age: string;
  gender: string;
  endurance: number;
  power: number;
};

interface AthleteFormProps {
  data: SportStatMap | null;
  loading: boolean;
  findClosestSports: (profile: AthleteProfile) => ClosestSport[];
}

const initialFormState: FormState = {
  feet: '',
  inches: '',
  weightLbs: '',
  age: '',
  gender: '',
  endurance: 50,
  power: 50,
};

const sampleFormState: FormState = {
  feet: '5',
  inches: '10',
  weightLbs: '160',
  age: '25',
  gender: 'Other',
  endurance: 62,
  power: 58,
};

const inputClass =
  'h-12 w-full rounded-md border border-[color:var(--border)] bg-[var(--field-bg)] px-3 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--faint)] focus:border-[color:var(--accent-solid)] focus:bg-[var(--field-focus)] focus:ring-2 focus:ring-[var(--accent-ring)]';

const labelClass = 'mb-2 block text-sm font-semibold text-[var(--label)]';

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function AthleteForm({ data, loading, findClosestSports }: AthleteFormProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [result, setResult] = useState<ArchetypeResult | string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const sportsLoaded = data ? Object.keys(data).length : 0;
  const statusText = loading
    ? 'Syncing dataset'
    : data
      ? `${sportsLoaded} sports ready`
      : 'Dataset unavailable';

  const profilePreview = useMemo(() => {
    const feet = Number.parseInt(formData.feet, 10);
    const inches = Number.parseInt(formData.inches, 10);
    const totalInches = (Number.isFinite(feet) ? feet : 0) * 12 + (Number.isFinite(inches) ? inches : 0);
    const weight = Number.parseFloat(formData.weightLbs);
    const age = Number.parseInt(formData.age, 10);

    return {
      height: totalInches > 0 ? `${totalInches} in` : 'Pending',
      weight: Number.isFinite(weight) && weight > 0 ? `${Math.round(weight)} lb` : 'Pending',
      age: Number.isFinite(age) && age > 0 ? `${age}` : 'Pending',
    };
  }, [formData.age, formData.feet, formData.inches, formData.weightLbs]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(null);

    try {
      const feet = Number.parseInt(formData.feet, 10) || 0;
      const inches = Number.parseInt(formData.inches, 10) || 0;
      const totalInches = feet * 12 + inches;
      const weightLbs = Math.round(Number.parseFloat(formData.weightLbs) || 0);
      const heightCm = Math.round(totalInches * 2.54);
      const weightKg = Math.round(weightLbs / 2.20462);
      const age = Number.parseInt(formData.age, 10);

      const userProfile = {
        height: heightCm,
        weight: weightKg,
        age,
      };

      const closestSports = findClosestSports(userProfile);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightInches: totalInches,
          weightLbs,
          age,
          gender: formData.gender,
          endurance: formData.endurance,
          power: formData.power,
          closestSports,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Analysis failed' }));
        setResult(error || 'Analysis failed');
        return;
      }

      const parsed = (await res.json()) as ArchetypeResult;
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setResult('Analysis could not be completed. Check the server configuration and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'endurance' || name === 'power' ? Number(value) : value,
    }));
  };

  const useSampleProfile = () => {
    setFormData(sampleFormState);
    setResult(null);
  };

  const isReady = Boolean(data) && !loading;

  return (
    <section className="min-w-0 rounded-lg border border-[color:var(--border)] bg-[var(--panel)] shadow-[var(--shadow)]">
      <div className="border-b border-[color:var(--border)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-text)]">Athlete input deck</p>
            <h2 className="mt-1 text-3xl font-black text-[var(--foreground)] sm:text-4xl">Find your archetype</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={useSampleProfile}
              className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[color:var(--accent-solid)] hover:text-[var(--accent-text)]"
            >
              Use sample profile
            </button>
            <span
              className={`w-fit rounded-md border px-3 py-2 text-sm font-semibold ${
                loading
                  ? 'border-[color:var(--accent-solid)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : data
                    ? 'border-[color:var(--success-text)] bg-[var(--success-soft)] text-[var(--success-text)]'
                    : 'border-[color:var(--usa-red)] bg-[var(--danger-soft)] text-[var(--danger-text)]'
              }`}
            >
              {statusText}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
          {[
            ['Height', profilePreview.height],
            ['Weight', profilePreview.weight],
            ['Age', profilePreview.age],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] px-3 py-3">
              <div className="text-xs font-semibold text-[var(--faint)]">{label}</div>
              <div className="mt-1 text-lg font-black text-[var(--foreground)]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <label className={labelClass} htmlFor="feet">
              Feet
            </label>
            <input
              id="feet"
              type="number"
              name="feet"
              value={formData.feet}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="5"
              min="3"
              max="8"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="inches">
              Inches
            </label>
            <input
              id="inches"
              type="number"
              name="inches"
              value={formData.inches}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="10"
              min="0"
              max="11"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="weightLbs">
              Weight
            </label>
            <input
              id="weightLbs"
              type="number"
              name="weightLbs"
              value={formData.weightLbs}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="160"
              min="50"
              max="500"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="age">
              Age
            </label>
            <input
              id="age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="25"
              min="8"
              max="90"
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className={labelClass} htmlFor="gender">
              Division
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="Male">Men</option>
              <option value="Female">Women</option>
              <option value="Other">Open</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <label className="font-semibold text-[var(--foreground)]" htmlFor="endurance">
                Endurance index
              </label>
              <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-sm font-black text-[var(--accent-text)]">
                {formData.endurance}
              </span>
            </div>
            <input
              id="endurance"
              type="range"
              name="endurance"
              min="0"
              max="100"
              value={formData.endurance}
              onChange={handleChange}
              className="range-field"
            />
            <div className="mt-2 flex justify-between text-xs font-semibold text-[var(--faint)]">
              <span>Explosive</span>
              <span>Enduring</span>
            </div>
          </div>

          <div className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <label className="font-semibold text-[var(--foreground)]" htmlFor="power">
                Strength index
              </label>
              <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-sm font-black text-[var(--accent-text)]">
                {formData.power}
              </span>
            </div>
            <input
              id="power"
              type="range"
              name="power"
              min="0"
              max="100"
              value={formData.power}
              onChange={handleChange}
              className="range-field"
            />
            <div className="mt-2 flex justify-between text-xs font-semibold text-[var(--faint)]">
              <span>Speed</span>
              <span>Strength</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={analyzing || !isReady}
          className="group relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-md bg-[var(--accent-solid)] px-6 py-4 text-base font-black text-[var(--accent-contrast)] shadow-lg transition hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[var(--panel-soft)] disabled:text-[var(--faint)] disabled:shadow-none"
        >
          <span className="relative z-10">
            {analyzing ? 'Consulting the specialist panel' : 'Run archetype analysis'}
          </span>
          {analyzing && <span className="absolute inset-x-0 bottom-0 h-1 animate-scan bg-[var(--usa-red)]" />}
        </button>

        {analyzing && (
          <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-3" aria-live="polite">
            {['Coach fit', 'Biomechanics', 'Team USA history'].map((step) => (
              <div key={step} className="rounded-md border border-[color:var(--accent-solid)] bg-[var(--accent-soft)] px-3 py-2 text-[var(--accent-text)]">
                {step}
              </div>
            ))}
          </div>
        )}
      </form>

      {result && (
        <div className="border-t border-[color:var(--border)] p-5 sm:p-6" aria-live="polite">
          {typeof result === 'string' ? (
            <div className="rounded-md border border-[color:var(--usa-red)] bg-[var(--danger-soft)] p-4 text-[var(--danger-text)]">
              {result}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-md border border-[color:var(--accent-solid)] bg-[var(--accent-soft)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--accent-text)]">Overall archetype</p>
                  <span className="rounded-md border border-[color:var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-black text-[var(--foreground)]">
                    {result.analysisMode === 'demo' ? 'Demo mode' : 'Gemini panel'}
                  </span>
                </div>
                <h3 className="mt-1 text-3xl font-black text-[var(--foreground)] sm:text-4xl">{result.overallArchetype}</h3>
                <p className="mt-3 text-lg text-[var(--foreground)]">{result.tagline}</p>
                {result.notice && (
                  <p className="mt-4 rounded-md border border-[color:var(--info-text)] bg-[var(--info-soft)] p-3 text-sm leading-6 text-[var(--info-text)]">
                    {result.notice}
                  </p>
                )}
                <p className="mt-4 border-t border-[color:var(--border-strong)] pt-4 text-sm leading-6 text-[var(--accent-text)]">
                  {result.funFact}
                </p>
              </div>

              <div className="space-y-4">
                {result.archetypes?.map((archetype) => (
                  <article
                    key={`${archetype.rank}-${archetype.sport}`}
                    data-testid="archetype-card"
                    className="rounded-md border border-[color:var(--border)] bg-[var(--panel-strong)] p-5 transition hover:border-[color:var(--accent-solid)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--foreground)] text-lg font-black text-[var(--background)]">
                          {archetype.rank.toString().padStart(2, '0')}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-2xl font-black text-[var(--foreground)]">{archetype.archetypeName}</h4>
                            {archetype.paralympic && (
                              <span className="rounded-md border border-[color:var(--info-text)] bg-[var(--info-soft)] px-2 py-1 text-xs font-black text-[var(--info-text)]">
                                Paralympic
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-semibold text-[var(--accent-text)]">{archetype.sport}</p>
                        </div>
                      </div>
                      <div className="w-full sm:w-28 sm:text-right">
                        <div className="text-3xl font-black text-[var(--success-text)]">
                          {clampScore(archetype.matchScore)}%
                        </div>
                        <div className="text-xs font-semibold text-[var(--faint)]">Match score</div>
                      </div>
                    </div>

                    <p className="mt-5 rounded-md bg-[var(--panel-soft)] p-4 text-lg font-semibold text-[var(--foreground)]">
                      {archetype.tagline}
                    </p>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div>
                        <h5 className="font-black text-[var(--accent-text)]">Sport fit</h5>
                        <p className="mt-2 leading-7 text-[var(--muted)]">{archetype.why}</p>
                      </div>
                      <div>
                        <h5 className="font-black text-[var(--accent-text)]">Golden era</h5>
                        <p className="mt-2 leading-7 text-[var(--muted)]">{archetype.goldenEra}</p>
                      </div>
                      <div>
                        <h5 className="font-black text-[var(--accent-text)]">Historical pattern</h5>
                        <p className="mt-2 leading-7 text-[var(--muted)]">{archetype.historicalNote}</p>
                      </div>
                      <div>
                        <h5 className="font-black text-[var(--accent-text)]">Development arc</h5>
                        <p className="mt-2 leading-7 text-[var(--muted)]">{archetype.lateBloomer}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {archetype.traits?.map((trait) => (
                        <span
                          key={trait}
                          className="rounded-md border border-[color:var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
