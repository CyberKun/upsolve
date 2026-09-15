import { Palette } from 'lucide-react';
import { isTheme, type ThemeId } from '../theme/themes';

interface ThemeSwitcherProps {
  value: ThemeId;
  options: readonly { id: ThemeId; label: string }[];
  onChange: (theme: ThemeId) => void;
}

export function ThemeSwitcher({ value, options, onChange }: ThemeSwitcherProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-secondary-text">
      <Palette size={17} aria-hidden="true" className="shrink-0" />
      <label htmlFor="theme-select" className="text-xs font-medium">Theme</label>
      <select id="theme-select" value={value} onChange={event => {
        if (isTheme(event.target.value)) onChange(event.target.value);
      }} className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-primary-bg px-2 text-xs text-primary-text hover:bg-surface-hover xl:w-48">
        {options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </div>
  );
}
