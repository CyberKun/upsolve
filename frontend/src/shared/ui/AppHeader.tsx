import { useRef, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { ArrowUpRight, Menu, X } from 'lucide-react';

interface AppHeaderProps {
  links: readonly { to: string; label: string }[];
  themeSwitcher: ReactNode;
  accountLink: { to: string; label: string };
}

export function AppHeader({ links, themeSwitcher, accountLink }: AppHeaderProps) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-primary-bg" data-app-header onKeyDown={event => {
      if (event.key === 'Escape' && open) { close(); toggle.current?.focus(); }
    }}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="header-inner mx-auto grid max-w-[1600px] items-center gap-x-6 px-4 sm:px-8 xl:px-10">
        <Link to="/explore" onClick={close} aria-label="Upsolve home" className="flex w-fit items-center gap-2 text-2xl font-semibold tracking-[-0.06em] text-primary-text">
          <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-on-accent"><ArrowUpRight size={25} strokeWidth={2.5} aria-hidden="true" /></span>
          upsolve<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {links.map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => `rounded-full px-3 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-accent-light text-accent' : 'text-secondary-text hover:bg-secondary-bg hover:text-primary-text'}`}>{link.label}</NavLink>)}
        </nav>
        <div className="header-theme">{themeSwitcher}</div>
        <Link to={accountLink.to} onClick={close} className="hidden min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium hover:bg-secondary-bg xl:flex">{accountLink.label}</Link>
        <button ref={toggle} type="button" aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="col-start-2 row-start-1 ml-auto flex size-11 items-center justify-center rounded-full hover:bg-secondary-bg xl:hidden">
          {open ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
      </div>
      {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-b border-border bg-primary-bg p-4 shadow-lg shadow-theme xl:hidden">
        {links.map(link => <NavLink key={link.to} to={link.to} onClick={close} className={({ isActive }) => `block rounded-xl px-4 py-3 text-sm ${isActive ? 'bg-accent-light text-accent' : 'text-primary-text hover:bg-secondary-bg'}`}>{link.label}</NavLink>)}
        <Link to={accountLink.to} onClick={close} className="mt-2 block rounded-xl border border-border px-4 py-3 text-sm hover:bg-secondary-bg">{accountLink.label}</Link>
      </nav>}
    </header>
  );
}
