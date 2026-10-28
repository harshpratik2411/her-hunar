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
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="text-xl font-extrabold tracking-tight text-ink-900">herHunar</span>
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
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between gap-4">
        <div className="flex-1">
          <Logo />
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {NAV_LINKS.map((item) => {
            const isActive = `${location.pathname}${location.search}` === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cx(
                  'text-sm font-semibold transition-colors',
                  isActive ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-4">
          {!currentUser && (
            <Link to="/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hidden sm:inline-flex">
              Login
            </Link>
          )}
          <Link to="/join" className="btn-outline btn-sm hidden sm:inline-flex">
            Get Started
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
                'relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold text-white transition',
                'bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm hover:from-brand-600 hover:to-brand-800 active:scale-95',
                panelOpen && 'ring-2 ring-brand-500/20',
              )}
            >
              S
              {currentUser && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
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
