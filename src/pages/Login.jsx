import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Field, InfoNote, useToast } from '../components/ui.jsx';
import { cx, isValidEmail, publicProfilePath } from '../lib/utils.js';
import { IconArrowRight, IconBriefcase, IconUser } from '../components/icons.jsx';

export default function Login() {
  const { login, currentUser, talents, companies } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = useMemo(
    () => [
      ...talents.slice(0, 2).map((talent) => ({
        email: talent.email,
        label: talent.name,
        detail: `Talent · ${talent.occupation}`,
        kind: 'talent',
      })),
      ...companies.slice(0, 2).map((company) => ({
        email: company.email,
        label: company.companyName,
        detail: `Company · ${company.contactPerson}`,
        kind: 'company',
      })),
    ],
    [talents, companies],
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const result = login(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setErrors({ password: result.error });
      notify(result.error, 'error');
      return;
    }

    notify('Logged in. Your profile was loaded from this browser.');
    navigate(publicProfilePath({ kind: result.kind, id: result.id }));
  };

  const useDemoAccount = (account) => {
    setEmail(account.email);
    setPassword('herhunar');
    setErrors({});
  };

  return (
    <div className="shell py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Log in to herHunar</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            This is a demo login. Accounts are stored in your browser, so signing in only works for profiles created
            here (or the sample profiles below).
          </p>

          {currentUser && (
            <InfoNote className="mt-6" tone="neutral">
              You are already signed in as{' '}
              <strong>{currentUser.kind === 'company' ? currentUser.companyName : currentUser.name}</strong>. Continue to{' '}
              <Link to={publicProfilePath(currentUser)} className="link">
                your public profile
              </Link>
              , or log out from the S tab to switch accounts.
            </InfoNote>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5" noValidate>
            <Field label="Email" htmlFor="email" required error={errors.email}>
              <input
                id="email"
                type="email"
                className={cx('input', errors.email && 'input-error')}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              required
              error={errors.password}
              hint="Every demo account uses the password “herhunar”."
            >
              <input
                id="password"
                type="password"
                className={cx('input', errors.password && 'input-error')}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </Field>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log in'}
                {!submitting && <IconArrowRight size={16} />}
              </button>
              <Link to="/join" className="btn-ghost">
                Create a new account
              </Link>
            </div>
          </form>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="text-sm font-bold text-ink-900">Demo accounts</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Tap one to fill the form, then press Log in.
          </p>
          <ul className="mt-4 grid gap-2">
            {demoAccounts.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => useDemoAccount(account)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/60"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      {account.kind === 'company' ? <IconBriefcase size={15} /> : <IconUser size={15} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-900">{account.label}</span>
                      <span className="block truncate text-xs text-ink-500">{account.detail}</span>
                    </span>
                  </span>
                  <span className="mt-2 block truncate font-mono text-[11px] text-ink-400">{account.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
