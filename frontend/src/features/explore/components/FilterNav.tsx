import { Check } from 'lucide-react';
import type { Category } from '../products';

interface FilterNavProps {
  items: readonly { id: Category; label: string }[];
  selected: Category;
  onSelect: (category: Category) => void;
}

export function FilterNav({ items, selected, onSelect }: FilterNavProps) {
  return <nav aria-label="Collection filters" data-filter-nav className="sticky top-[var(--header-height)] z-20 border-b border-border bg-primary-bg">
    <div className="overflow-x-auto"><div className="mx-auto flex w-max min-w-full gap-2 px-4 py-3 sm:justify-center sm:px-8 sm:py-4">
      {items.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} aria-controls="collection-grid" onClick={() => onSelect(item.id)} className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors active:scale-[0.98] ${selected === item.id ? 'border-accent bg-accent text-on-accent hover:bg-button-hover' : 'border-border bg-primary-bg text-primary-text hover:border-accent hover:bg-secondary-bg'}`}>
        {selected === item.id && <Check size={15} aria-hidden="true" />}{item.label}
      </button>)}
    </div></div>
  </nav>;
}
