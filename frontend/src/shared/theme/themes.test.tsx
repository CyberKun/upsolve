import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { DEFAULT_THEME, readTheme, themes, THEME_STORAGE_KEY } from './themes';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

function Switcher() {
  const { theme, setTheme } = useTheme();
  return <ThemeSwitcher value={theme} options={themes} onChange={setTheme} />;
}

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe('theme preferences', () => {
  it('restores valid preferences and rejects unknown values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'midnight');
    expect(readTheme()).toBe('midnight');
    localStorage.setItem(THEME_STORAGE_KEY, 'old-theme');
    expect(readTheme()).toBe(DEFAULT_THEME);
  });

  it('falls back when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    expect(readTheme()).toBe(DEFAULT_THEME);
  });

  it('switches the root attribute and persists every palette', async () => {
    render(<ThemeProvider><Switcher /></ThemeProvider>);
    const user = userEvent.setup();
    for (const theme of themes) {
      await user.selectOptions(screen.getByLabelText('Theme'), theme.id);
      expect(document.documentElement.dataset.theme).toBe(theme.id);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme.id);
    }
  });

  it('still switches when saving fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    render(<ThemeProvider><Switcher /></ThemeProvider>);
    await userEvent.selectOptions(screen.getByLabelText('Theme'), 'cyberpunk');
    expect(document.documentElement.dataset.theme).toBe('cyberpunk');
  });
});
