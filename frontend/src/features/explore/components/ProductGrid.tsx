import type { Product } from '../products';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, onSelect }: { products: readonly Product[]; onSelect: (product: Product) => void }) {
  return <div id="collection-grid" className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-14">
    {products.map(product => <ProductCard key={product.id} product={product} onSelect={onSelect} />)}
    {products.length === 0 && <p className="col-span-full rounded-3xl bg-secondary-bg p-10 text-center text-secondary-text">No collections in this category yet. Try another filter.</p>}
  </div>;
}
