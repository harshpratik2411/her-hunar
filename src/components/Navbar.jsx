import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import AccountPanel from './AccountPanel.jsx';
import { cx } from '../lib/utils.js';
import { IconClose } from './icons.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/discover', label: 'Discover talent' },
  { to: '/join?as=company', label: 'For companies' },
  { to: '/join?as=talent', label: 'For talent' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-base font-extrabold text-white shadow-[0_10px_22px_-12px_rgba(29,47,156,0.95)]">
        H
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-extrabold tracking-tight text-ink-900">herHunar</span>
        <span className="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Skills → opportunities</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { currentUser } = useApp();
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Close overlays when the route changes. */
  useEffect(() => {
    setPanelOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => {
            const isActive = `${location.pathname}${location.search}` === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cx(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!currentUser && (
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">
              Log in
            </Link>
          )}
          <Link to="/join" className="btn-primary hidden sm:inline-flex">
            Get started
          </Link>

          {/* The compact “S” account tab. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPanelOpen((value) => !value)}
              aria-expanded={panelOpen}
              aria-haspopup="menu"
              aria-label="Account and profile options"
              className={cx(
                'relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white transition',
                'bg-gradient-to-br from-brand-600 to-brand-800 shadow-[0_10px_22px_-12px_rgba(29,47,156,0.95)] hover:from-brand-500 hover:to-brand-700 active:translate-y-px',
                panelOpen && 'ring-4 ring-brand-500/20',
              )}
            >
              S
              {currentUser && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
              )}
            </button>
            <AccountPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
          </div>

          <button
            type="button"
            className="btn-ghost rounded-lg p-2 lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? (
              <IconClose size={20} />
            ) : (
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="shell flex flex-col gap-1 py-3">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!currentUser && (
                <Link
                  to="/login"
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  Log in
                </Link>
              )}
              <Link to="/join" className="btn-primary mt-2" onClick={() => setMenuOpen(false)}>
                Get started
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
