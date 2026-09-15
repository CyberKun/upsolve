import { ArrowRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';
import { CollectionArt } from './CollectionArt';

interface HeroSectionProps {
  title: string;
  description: string;
  onExplore: () => void;
  practiceLink: string;
  reviewLink: string;
}

export function HeroSection({ title, description, onExplore, practiceLink, reviewLink }: HeroSectionProps) {
  return <>
    <div className="px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">A little practice. A lot of possibility.</p>
      <h1 className="mx-auto max-w-3xl text-[2.6rem] font-medium leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-[4.25rem]">{title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-secondary-text sm:text-lg">{description}</p>
    </div>
    <section aria-label="Featured practice" className="grid gap-5 lg:grid-cols-[1.8fr_1fr]">
      <article className="tone-mint relative flex min-h-[490px] flex-col overflow-hidden rounded-[28px] bg-secondary-bg sm:min-h-[530px]">
        <div className="relative z-10 px-7 pt-8 sm:px-10 sm:pt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent">Built for your next breakthrough</p>
          <h2 className="max-w-md text-3xl font-medium leading-[1.12] tracking-[-0.045em] sm:text-[2.65rem]">Good practice.<br />Great possibilities.</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-secondary-text">Turn “almost solved” into “I’ve got this.”<br className="hidden sm:block" /> Find your focus, one problem at a time.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="button" onClick={onExplore} className="button-primary">Explore collections</button>
            <Link to={practiceLink} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">Open my queue <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="mt-auto h-[235px] sm:h-[265px]"><CollectionArt kind="blocks" hero /></div>
      </article>
      <article className="tone-lavender flex min-h-[420px] flex-col items-center overflow-hidden rounded-[28px] bg-art-bg px-7 pt-9 text-center sm:pt-10">
        <span className="mb-5 flex size-12 items-center justify-center rounded-full bg-primary-bg text-accent"><RotateCcw size={22} aria-hidden="true" /></span>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-secondary-text">Remember more</p>
        <h2 className="max-w-xs text-3xl font-medium leading-[1.15] tracking-[-0.045em] sm:text-4xl">Make it click.<br />Make it stick.</h2>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-secondary-text">Revisit the tricky ones. Build a practice habit that stays with you.</p>
        <Link to={reviewLink} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-text px-6 text-sm font-medium hover:bg-primary-bg">Your reviews <ArrowRight size={16} aria-hidden="true" /></Link>
        <div className="-mb-8 mt-auto h-[200px] w-full max-w-[300px]"><CollectionArt kind="orbit" /></div>
      </article>
    </section>
  </>;
}
