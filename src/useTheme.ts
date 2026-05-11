'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'team-usa-archetype-theme';

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent<Theme>('team-usa-theme-change', { detail: theme }));
}

export function useTheme(): [Theme, (theme: Theme | ((current: Theme) => Theme)) => void] {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());

  useEffect(() => {
    applyTheme(theme);

    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (nextTheme === 'light' || nextTheme === 'dark') {
        setThemeState(nextTheme);
      }
    };

    window.addEventListener('team-usa-theme-change', handleThemeChange);
    return () => window.removeEventListener('team-usa-theme-change', handleThemeChange);
  }, [theme]);

  const setTheme = (next: Theme | ((current: Theme) => Theme)) => {
    setThemeState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      applyTheme(resolved);
      return resolved;
    });
  };

  return [theme, setTheme];
}
