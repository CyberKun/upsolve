import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { applyTheme, isTheme, readTheme, THEME_STORAGE_KEY, type ThemeId } from './themes';

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (theme: ThemeId) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setCurrentTheme] = useState(readTheme);
  const setTheme = (next: ThemeId) => {
    if (!isTheme(next)) return;
    applyTheme(next);
    setCurrentTheme(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* Works without persistence. */ }
  };
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        const next = readTheme();
        applyTheme(next);
        setCurrentTheme(next);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme requires ThemeProvider');
  return value;
}
