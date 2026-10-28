import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from './ui.jsx';
import { Avatar, CopyLinkButton } from './ui.jsx';
import { exportAllAsMarkdown, exportRecordAsMarkdown } from '../lib/export.js';
import { cx, publicProfilePath, publicProfileUrl, relativeTime } from '../lib/utils.js';
import {
  IconBriefcase,
  IconCheck,
  IconClose,
  IconDownload,
  IconExternal,
  IconInfo,
  IconUser,
  IconXCircle,
} from './icons.jsx';

const STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  declined: 'border-slate-200 bg-slate-50 text-ink-400',
};

function RequestRow({ request, otherName, canRespond, onRespond, busy }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{otherName}</p>
          <p className="truncate text-xs text-ink-500">{request.requirementTitle}</p>
        </div>
        <span className={cx('badge border shrink-0 capitalize', STATUS_STYLES[request.status])}>{request.status}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500">{request.message}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-ink-300">{relativeTime(request.createdAt)}</span>
        {canRespond && request.status === 'pending' && (
          <div className="flex gap-1.5">
            <button
              type="button"
              className="btn-sm btn-outline"
              disabled={busy}
              onClick={() => onRespond(request.id, 'declined')}
            >
              <IconXCircle size={13} />
              Decline
            </button>
            <button
              type="button"
              className="btn-sm btn-primary"
              disabled={busy}
              onClick={() => onRespond(request.id, 'accepted')}
            >
              <IconCheck size={13} />
              Accept
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default function AccountPanel({ open, onClose }) {
  const {
    currentUser,
    isCompany,
    isTalent,
    requests,
    talents,
    companies,
    storageMode,
    storageNotice,
    logout,
    respondToRequest,
    resetDemo,
  } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [showRequests, setShowRequests] = useState(false);
  const [busy, setBusy] = useState(false);

  /* Close on outside click + Escape */
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) onClose();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return isCompany
      ? requests.filter((request) => request.companyId === currentUser.id)
      : requests.filter((request) => request.talentId === currentUser.id);
  }, [currentUser, isCompany, requests]);

  const pendingCount = myRequests.filter((request) => request.status === 'pending').length;

  const nameFor = (request) => {
    if (isCompany) return talents.find((talent) => talent.id === request.talentId)?.name ?? 'Candidate';
    return companies.find((company) => company.id === request.companyId)?.companyName ?? 'Company';
  };

  const handleLogout = () => {
    logout();
    onClose();
    notify('You have been logged out.');
    navigate('/');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(90vw,23rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift"
          role="menu"
          aria-label="Account options"
        >
          {!currentUser ? (
            <div className="p-4">
              <p className="text-sm font-bold text-ink-900">Welcome to herHunar</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                Sign in to save your profile, keep a public link, and send or receive contact requests. This is a demo
                flow — any email and the password <strong>herhunar</strong> works for the sample accounts.
              </p>
              <div className="mt-3 grid gap-2">
                <Link to="/login" className="btn-primary" onClick={onClose}>
                  Log in
                </Link>
                <Link to="/join?as=talent" className="btn-outline" onClick={onClose}>
                  <IconUser size={15} />
                  Join as talent
                </Link>
                <Link to="/join?as=company" className="btn-outline" onClick={onClose}>
                  <IconBriefcase size={15} />
                  Join as a company
                </Link>
              </div>
              <Link
                to="/discover"
                onClick={onClose}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Or browse talent first
                <IconExternal size={13} />
              </Link>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={isCompany ? currentUser.companyName : currentUser.name} seed={currentUser.id} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">
                      {isCompany ? currentUser.companyName : currentUser.name}
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {isCompany
                        ? `${currentUser.contactPerson} · ${currentUser.role}`
                        : `${currentUser.occupation} · Age ${currentUser.age}`}
                    </p>
                  </div>
                  <span className="badge-muted ml-auto shrink-0">
                    {isCompany ? 'Company' : 'Talent'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand-100 bg-white/80 p-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-500">
                    {publicProfileUrl(currentUser).replace(/^https?:\/\//, '')}
                  </span>
                  <CopyLinkButton record={currentUser} label="Copy" size="sm" variant="outline" />
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-3">
                <div className="grid gap-1">
                  <Link to="/edit-profile" className="btn-ghost justify-start" onClick={onClose}>
                    <IconUser size={16} />
                    Edit my profile
                  </Link>
                  <Link to={publicProfilePath(currentUser)} className="btn-ghost justify-start" onClick={onClose}>
                    <IconExternal size={16} />
                    View public profile
                  </Link>
                  <button
                    type="button"
                    className="btn-ghost justify-start"
                    onClick={() => {
                      exportRecordAsMarkdown(currentUser);
                      notify('Profile exported as a .md file.');
                    }}
                  >
                    <IconDownload size={16} />
                    Export my profile (.md)
                  </button>
                  <button
                    type="button"
                    className="btn-ghost justify-start"
                    onClick={() => {
                      exportAllAsMarkdown({ talents, companies });
                      notify('All saved profiles exported as one .md file.');
                    }}
                  >
                    <IconDownload size={16} />
                    Export everything (.md)
                  </button>
                </div>

                <div className="my-3 border-t border-slate-100" />

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-ink-800 transition hover:bg-brand-50"
                  onClick={() => setShowRequests((value) => !value)}
                  aria-expanded={showRequests}
                >
                  <span className="flex items-center gap-2">
                    <IconInfo size={16} />
                    {isCompany ? 'Sent requests' : 'Contact requests'}
                  </span>
                  <span className="flex items-center gap-2">
                    {pendingCount > 0 && (
                      <span className="badge border border-amber-200 bg-amber-50 text-amber-700">{pendingCount} new</span>
                    )}
                    <span className="badge-muted">{myRequests.length}</span>
                  </span>
                </button>

                {showRequests && (
                  <div className="mt-2">
                    {myRequests.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-ink-400">
                        {isCompany
                          ? 'No contact requests sent yet. Open a candidate profile and send one.'
                          : 'No requests received yet.'}
                      </p>
                    ) : (
                      <ul className="grid gap-2">
                        {myRequests.map((request) => (
                          <RequestRow
                            key={request.id}
                            request={request}
                            otherName={nameFor(request)}
                            canRespond={isTalent}
                            busy={busy}
                            onRespond={(id, status) => {
                              setBusy(true);
                              respondToRequest(id, status);
                              setBusy(false);
                              notify(status === 'accepted' ? 'Request accepted.' : 'Request declined.');
                            }}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="my-3 border-t border-slate-100" />

                <button
                  type="button"
                  className="btn-ghost w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={handleLogout}
                >
                  <IconClose size={16} />
                  Log out
                </button>

                <p className="mt-3 rounded-xl bg-mist p-3 text-[11px] leading-relaxed text-ink-500">
                  {storageMode === 'localStorage'
                    ? 'Everything on herHunar is stored in this browser only. It is not shared with other people or devices.'
                    : storageNotice}
                  <button
                    type="button"
                    className="mt-2 block font-semibold text-brand-600 hover:text-brand-700"
                    onClick={() => {
                      resetDemo();
                      onClose();
                      notify('Demo data restored.');
                    }}
                  >
                    Reset demo data
                  </button>
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
