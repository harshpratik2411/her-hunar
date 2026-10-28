import { Link } from 'react-router-dom';
import { IconInfo } from './icons.jsx';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-mist/60">
      <div className="shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-base font-extrabold text-white">
              H
            </span>
            <span className="text-base font-extrabold tracking-tight text-ink-900">herHunar</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
            A skill-first hiring platform for women who build, cook, stitch, teach, and create. Post what you can do,
            get found by companies hiring for exactly those skills.
          </p>
          <p className="mt-5 text-xs font-semibold tracking-wide text-brand-700 uppercase">
            Her Skills. Her Income. Her Independence.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink-900">Platform</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            <li>
              <Link to="/discover" className="transition hover:text-brand-700">
                Discover talent
              </Link>
            </li>
            <li>
              <Link to="/join?as=talent" className="transition hover:text-brand-700">
                Join as talent
              </Link>
            </li>
            <li>
              <Link to="/join?as=company" className="transition hover:text-brand-700">
                Hire talent
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-brand-700">
                Log in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink-900">How the demo works</h3>
          <div className="mt-4 flex gap-2 text-xs leading-relaxed text-ink-500">
            <span className="mt-0.5 shrink-0 text-brand-600">
              <IconInfo size={16} />
            </span>
            <p>
              herHunar runs entirely in your browser using <strong>localStorage</strong>. There is no server, so
              profiles are only visible on this device. Public links open a profile when that data already exists in
              the browser visiting the link.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="shell flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} herHunar · Demo project build.</p>
          <p>Built with React, Vite, and Tailwind CSS. Sample profiles are fictional.</p>
        </div>
      </div>
    </footer>
  );
}
