import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as store from '../lib/storage.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [talents, setTalents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [session, setSession] = useState(null);
  const [storageNotice, setStorageNotice] = useState('');

  const refresh = useCallback(() => {
    setTalents(store.getTalents());
    setCompanies(store.getCompanies());
    setRequests(store.getRequests());
  }, []);

  useEffect(() => {
    store.ensureSeeded();
    refresh();
    setSession(store.getSession());
    if (store.storageMode === 'memory') {
      setStorageNotice(
        'This browser is blocking localStorage, so data will only last for this session. Turn off private browsing to keep profiles after a refresh.',
      );
    }
  }, [refresh]);

  const findRecord = useCallback(
    (activeSession) => {
      if (!activeSession) return null;
      return activeSession.kind === 'company'
        ? companies.find((company) => company.id === activeSession.id) ?? null
        : talents.find((talent) => talent.id === activeSession.id) ?? null;
    },
    [companies, talents],
  );

  const currentUser = useMemo(() => findRecord(session), [findRecord, session]);
  const isCompany = currentUser?.kind === 'company';
  const isTalent = currentUser?.kind === 'talent';

  /* --------------------------------------------------------------- accounts */

  const registerTalent = useCallback(
    (draft) => {
      if (store.emailTaken(draft.email)) {
        return { ok: false, error: 'This email is already registered. Try logging in instead.' };
      }
      const record = store.saveTalent({
        ...draft,
        password: undefined,
        id: store.makeId('tal'),
        kind: 'talent',
        createdAt: new Date().toISOString(),
      });
      store.addCredential({ email: draft.email, password: draft.password, kind: 'talent', id: record.id });
      store.setSession({ kind: 'talent', id: record.id });
      refresh();
      setSession({ kind: 'talent', id: record.id });
      return { ok: true, record };
    },
    [refresh],
  );

  const registerCompany = useCallback(
    (draft) => {
      if (store.emailTaken(draft.email)) {
        return { ok: false, error: 'This email is already registered. Try logging in instead.' };
      }
      const record = store.saveCompany({
        ...draft,
        password: undefined,
        id: store.makeId('com'),
        kind: 'company',
        createdAt: new Date().toISOString(),
      });
      store.addCredential({ email: draft.email, password: draft.password, kind: 'company', id: record.id });
      store.setSession({ kind: 'company', id: record.id });
      refresh();
      setSession({ kind: 'company', id: record.id });
      return { ok: true, record };
    },
    [refresh],
  );

  const login = useCallback(
    (email, password) => {
      const credential = store.findCredential(email, password);
      if (!credential) {
        return { ok: false, error: 'Email or password is incorrect. Demo accounts use the password “herhunar”.' };
      }
      store.setSession({ kind: credential.kind, id: credential.id });
      refresh();
      setSession({ kind: credential.kind, id: credential.id });
      return { ok: true, kind: credential.kind, id: credential.id };
    },
    [refresh],
  );

  const logout = useCallback(() => {
    store.clearSession();
    setSession(null);
  }, []);

  /* ------------------------------------------------------------ profile edit */

  const updateTalent = useCallback(
    (id, patch) => {
      const existing = store.getTalent(id);
      if (!existing) return { ok: false, error: 'Profile not found in this browser.' };
      const record = store.saveTalent({ ...existing, ...patch, password: undefined });
      refresh();
      return { ok: true, record };
    },
    [refresh],
  );

  const updateCompany = useCallback(
    (id, patch) => {
      const existing = store.getCompany(id);
      if (!existing) return { ok: false, error: 'Company not found in this browser.' };
      const record = store.saveCompany({ ...existing, ...patch, password: undefined });
      refresh();
      return { ok: true, record };
    },
    [refresh],
  );

  /* -------------------------------------------------------- contact requests */

  const sendRequest = useCallback(
    ({ companyId, talentId, requirement, message }) => {
      const duplicate = store.getRequests().find(
        (request) =>
          request.companyId === companyId &&
          request.talentId === talentId &&
          request.requirementId === requirement.id &&
          request.status !== 'declined',
      );
      if (duplicate) {
        return { ok: false, error: 'You have already contacted this candidate for this role.' };
      }
      const record = store.addRequest({
        companyId,
        talentId,
        requirementId: requirement.id,
        requirementTitle: requirement.title,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setRequests(store.getRequests());
      return { ok: true, record };
    },
    [],
  );

  const respondToRequest = useCallback((id, status) => {
    setRequests(store.updateRequestStatus(id, status));
  }, []);

  const resetDemo = useCallback(() => {
    store.resetDemoData();
    store.clearSession();
    setSession(null);
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ready: true,
      storageMode: store.storageMode,
      storageNotice,
      talents,
      companies,
      requests,
      session,
      currentUser,
      isCompany,
      isTalent,
      registerTalent,
      registerCompany,
      login,
      logout,
      updateTalent,
      updateCompany,
      sendRequest,
      respondToRequest,
      resetDemo,
      refresh,
      getTalent: (id) => talents.find((talent) => talent.id === id) ?? null,
      getCompany: (id) => companies.find((company) => company.id === id) ?? null,
    }),
    [
      storageNotice,
      talents,
      companies,
      requests,
      session,
      currentUser,
      isCompany,
      isTalent,
      registerTalent,
      registerCompany,
      login,
      logout,
      updateTalent,
      updateCompany,
      sendRequest,
      respondToRequest,
      resetDemo,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside <AppProvider>');
  return context;
}
