import { useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router';
import { FilterNav } from './components/FilterNav';
import { HeroSection } from './components/HeroSection';
import { ProductGrid } from './components/ProductGrid';
import { CollectionArt } from './components/CollectionArt';
import { filterProducts, filters, products, type Category, type Product } from './products';

export function ExplorePage({ dailyPractice }: { dailyPractice?: ReactNode }) {
  const [category, setCategory] = useState<Category>('all');
  const [selected, setSelected] = useState<Product | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const collectionHeading = useRef<HTMLHeadingElement>(null);
  const visibleProducts = filterProducts(products, category);
  const explore = () => {
    collectionHeading.current?.scrollIntoView({ block: 'start' });
    collectionHeading.current?.focus({ preventScroll: true });
  };
  return <>
    <FilterNav items={filters} selected={category} onSelect={next => { setCategory(next); collectionHeading.current?.scrollIntoView({ block: 'start' }); }} />
    <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 lg:px-12">
      <HeroSection title="Meet your next breakthrough." description="Thoughtful practice for curious problem solvers. Less getting stuck. More moving forward." onExplore={explore} practiceLink="/queue" reviewLink="/reviews" />
      {dailyPractice && <section aria-label="Your daily practice" className="mt-12 rounded-[28px] border border-border bg-secondary-bg py-4">{dailyPractice}</section>}
      <section aria-labelledby="collections-heading" className="pb-14 pt-16 sm:pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 sm:mb-10">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Find your focus</p>
            <h2 id="collections-heading" ref={collectionHeading} tabIndex={-1} className="scroll-mt-6 text-3xl font-medium tracking-[-0.045em] sm:text-[2.6rem]">A collection for every next step.</h2>
          </div>
          <p role="status" aria-live="polite" className="text-sm text-secondary-text">{visibleProducts.length} {visibleProducts.length === 1 ? 'collection' : 'collections'} <span aria-hidden="true">·</span> Preview catalog</p>
        </div>
        <ProductGrid products={visibleProducts} onSelect={product => { returnFocus.current = document.activeElement as HTMLElement; setSelected(product); }} />
      </section>
      <section className="flex flex-col items-center gap-6 rounded-[28px] bg-secondary-bg px-6 py-12 text-center sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">Your pace. Your progress.</p>
        <h2 className="max-w-xl text-3xl font-medium tracking-[-0.045em] sm:text-4xl">The best next step?<br />The one you take today.</h2>
        <p className="max-w-md text-sm leading-relaxed text-secondary-text">Your queue, notes, and spaced reviews. All together in one calm place to get better.</p>
        <Link to="/today" className="button-primary">Go to my practice <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
      <footer className="mt-14 flex flex-wrap justify-between gap-4 border-t border-border pt-7 text-xs text-secondary-text">
        <p className="text-base font-semibold tracking-tight text-primary-text">upsolve.</p>
        <p>Keep the curiosity. Build the habit.</p>
        <Link to="/settings" className="hover:text-accent hover:underline">Practice settings</Link>
      </footer>
    </div>
    <Dialog.Root open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }} className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-border bg-primary-bg p-6 shadow-xl shadow-theme sm:p-8">
          <Dialog.Close aria-label="Close collection" className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-primary-bg hover:bg-secondary-bg"><X size={20} aria-hidden="true" /></Dialog.Close>
          {selected && <>
            <div className={`tone-${selected.tone} mb-6 h-44 rounded-2xl bg-art-bg`}><CollectionArt kind={selected.illustration} /></div>
            <p className="mb-2 text-xs font-medium text-accent">Collection preview · {selected.problemCount} sample problems</p>
            <Dialog.Title className="text-3xl font-medium tracking-tight">{selected.title}</Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-relaxed text-secondary-text">{selected.description} This is a sample collection; your personal practice lives in your queue.</Dialog.Description>
            <p className="mt-5 text-sm">Rating {selected.level} · {selected.duration}</p>
            <ul aria-label="Topics" className="my-5 flex flex-wrap gap-2">{selected.topics.map(topic => <li key={topic} className="rounded-full bg-secondary-bg px-3 py-2 text-xs text-secondary-text">{topic}</li>)}</ul>
            <Dialog.Close asChild><Link to="/queue" className="button-primary">Open my practice queue <ArrowRight size={16} aria-hidden="true" /></Link></Dialog.Close>
          </>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
