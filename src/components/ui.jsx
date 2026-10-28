import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cx, initials, avatarGradient, copyToClipboard, publicProfileUrl } from '../lib/utils.js';
import { MATCH_BAR, MATCH_TONES, matchLabel } from '../lib/matching.js';
import { IconAlert, IconCheck, IconCheckCircle, IconClose, IconCopy, IconInfo } from './icons.jsx';

/* ------------------------------------------------------------------ avatar */

const AVATAR_SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

export function Avatar({ name = '', seed, size = 'md', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-[0_10px_24px_-14px_rgba(29,47,156,0.8)]',
        avatarGradient(seed ?? name),
        AVATAR_SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ badges */

export function SkillBadge({ children, matched = false, missing = false, className = '' }) {
  return (
    <span
      className={cx(
        'badge border text-xs',
        matched && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        missing && 'border-slate-200 bg-slate-50 text-ink-400 line-through decoration-slate-300',
        !matched && !missing && 'border-brand-100 bg-brand-50 text-brand-700',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MatchBadge({ percent = 0, hasRequirement = true, className = '' }) {
  const label = matchLabel(percent, hasRequirement);
  return (
    <span className={cx('badge border', MATCH_TONES[label.tone], className)}>
      {hasRequirement ? (
        <>
          <span className="font-extrabold">{percent}%</span>
          <span className="font-medium opacity-80">{label.text}</span>
        </>
      ) : (
        label.text
      )}
    </span>
  );
}

export function MatchMeter({ percent = 0, hasRequirement = true, className = '' }) {
  const label = matchLabel(percent, hasRequirement);
  return (
    <div className={cx('w-full', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cx('h-full rounded-full transition-[width] duration-700 ease-out', MATCH_BAR[label.tone])}
          style={{ width: `${hasRequirement ? Math.max(percent, 3) : 0}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- form fields */

export function Field({ label, htmlFor, error, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-brand-600">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="error-text">
          <IconAlert size={14} />
          {error}
        </p>
      ) : (
        hint && <p className="hint">{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- notes */

export function InfoNote({ title, children, tone = 'info', icon = true, className = '' }) {
  const tones = {
    info: 'border-brand-100 bg-brand-50/70 text-brand-800',
    warn: 'border-amber-200 bg-amber-50/80 text-amber-900',
    neutral: 'border-slate-200 bg-mist text-ink-700',
  };
  return (
    <div className={cx('rounded-2xl border p-4 text-sm leading-relaxed', tones[tone], className)}>
      <div className="flex gap-3">
        {icon && (
          <span className="mt-0.5 shrink-0">
            {tone === 'warn' ? <IconAlert size={18} /> : <IconInfo size={18} />}
          </span>
        )}
        <div>
          {title && <p className="mb-1 font-semibold">{title}</p>}
          <div className="space-y-1.5 opacity-95">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={cx('card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      {icon && (
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      {description && <p className="max-w-md text-sm leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------- modal */

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const widths = { md: 'max-w-lg', lg: 'max-w-3xl' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cx(
              'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl',
              widths[size],
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
              </div>
              <button type="button" className="btn-ghost -mt-1 -mr-1 rounded-lg p-2" onClick={onClose} aria-label="Close">
                <IconClose size={18} />
              </button>
            </div>
            {children}
            {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ toasts */

const ToastContext = createContext({ notify: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cx(
                'pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lift',
                toast.tone === 'error' ? 'bg-rose-600' : 'bg-ink-900',
              )}
            >
              <span className="mt-0.5 shrink-0">
                {toast.tone === 'error' ? <IconAlert size={16} /> : <IconCheckCircle size={16} />}
              </span>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* --------------------------------------------------------------- copy link */

export function CopyLinkButton({ record, label = 'Copy link', variant = 'outline', size = 'md', className = '' }) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(publicProfileUrl(record));
    if (ok) {
      setCopied(true);
      notify('Public profile link copied to clipboard.');
      setTimeout(() => setCopied(false), 2200);
    } else {
      notify('Copying is blocked in this browser. Please copy the link manually.', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cx(
        variant === 'primary' ? 'btn-primary' : 'btn-outline',
        size === 'sm' && 'btn-sm',
        className,
      )}
    >
      {copied ? <IconCheck size={size === 'sm' ? 14 : 16} /> : <IconCopy size={size === 'sm' ? 14 : 16} />}
      {copied ? 'Copied' : label}
    </button>
  );
}
