import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  ) {
    return 'dark';
  }
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches)
      return 'dark';
  } catch {
    /* ignore storage/matchMedia errors */
  }
  return 'light';
}

/**
 * Manages the light/dark theme: applies the `dark` class on <html> and
 * persists the choice to localStorage.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );

  return { theme, toggleTheme };
}
