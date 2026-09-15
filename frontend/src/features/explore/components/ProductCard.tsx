import { ArrowRight } from 'lucide-react';
import type { Product } from '../products';
import { CollectionArt } from './CollectionArt';

export function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  return <article className="group flex min-w-0 flex-col" data-product-card>
    <div className={`tone-${product.tone} relative h-[270px] overflow-hidden rounded-[24px] bg-art-bg sm:h-[290px]`}>
      {product.badge && <span className="absolute left-5 top-5 z-10 rounded-full bg-primary-bg px-3 py-1.5 text-xs font-medium text-primary-text">{product.badge}</span>}
      <CollectionArt kind={product.illustration} />
    </div>
    <div className="flex flex-1 flex-col px-2 pb-3 pt-6 sm:px-3">
      <p className="mb-2 text-xs font-medium text-secondary-text">{product.problemCount} problems <span aria-hidden="true">·</span> Rating {product.level}</p>
      <h3 className="max-w-xs text-2xl font-medium leading-tight tracking-[-0.035em]">{product.title}</h3>
      <p className="mb-5 mt-3 text-sm leading-relaxed text-secondary-text">{product.description}</p>
      <button type="button" onClick={() => onSelect(product)} aria-label={`Explore ${product.title}`} className="mt-auto flex min-h-11 w-fit items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent-light active:bg-surface-hover">Explore collection <ArrowRight size={16} aria-hidden="true" /></button>
    </div>
  </article>;
}
