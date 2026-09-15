import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { CollectionArt } from '@/features/explore/components/CollectionArt';

export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="mx-auto grid min-h-[calc(100dvh-var(--header-height))] max-w-7xl items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-16">
    <section className="tone-mint hidden overflow-hidden rounded-[32px] bg-art-bg px-10 pt-12 lg:block">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-accent">Progress starts with curiosity</p>
      <h2 className="text-5xl font-medium leading-[1.1] tracking-[-0.05em]">One more try.<br />One step further.</h2>
      <p className="mt-6 max-w-sm leading-relaxed text-secondary-text">A home for the problems you want to solve, the ideas you want to keep, and the progress you make along the way.</p>
      <Link to="/explore" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">Find your next focus <ArrowRight size={16} aria-hidden="true" /></Link>
      <div className="h-80"><CollectionArt kind="blocks" hero /></div>
    </section>
    <section className="mx-auto w-full max-w-md rounded-[28px] border border-border bg-primary-bg p-6 sm:p-9">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Your practice, together</p>
      <h1 className="text-3xl font-medium tracking-[-0.04em]">{title}</h1>
      <p className="mb-8 mt-3 text-sm leading-relaxed text-secondary-text">{description}</p>
      {children}
    </section>
  </div>;
}
