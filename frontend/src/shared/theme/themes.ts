export const themes = [
  { id: 'google-light', label: 'Google Store Light' },
  { id: 'midnight', label: 'Midnight Blue & Gold' },
  { id: 'cyberpunk', label: 'High-Contrast Cyberpunk' },
  { id: 'earth', label: 'Warm Earth Tones' },
  { id: 'pastel', label: 'Soft Pastel' },
] as const;

export type ThemeId = (typeof themes)[number]['id'];
export const DEFAULT_THEME: ThemeId = 'google-light';
export const THEME_STORAGE_KEY = 'upsolve-theme';

export function isTheme(value: unknown): value is ThemeId {
  return themes.some(theme => theme.id === value);
}

export function readTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
}
