'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'team-usa-archetype-theme';

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent<Theme>('team-usa-theme-change', { detail: theme }));
}

export function useTheme(): [Theme, (theme: Theme | ((current: Theme) => Theme)) => void] {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (nextTheme === 'light' || nextTheme === 'dark') {
        setThemeState((current) => (current === nextTheme ? current : nextTheme));
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      const nextTheme = event.newValue;
      if (nextTheme === 'light' || nextTheme === 'dark') {
        setThemeState((current) => (current === nextTheme ? current : nextTheme));
      }
    };

    window.addEventListener('team-usa-theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('team-usa-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme | ((current: Theme) => Theme)) => {
    setThemeState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      return resolved === 'light' || resolved === 'dark' ? resolved : current;
    });
  }, []);

  return [theme, setTheme];
}
