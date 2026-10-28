/**
 * Storage layer — everything lives in the browser's localStorage.
 *
 * There is intentionally no backend and no shared database: data written by one
 * person/device is not visible to anyone else. Public profile links only render
 * a profile when that profile's data already exists in the browser opening it.
 * A small in-memory fallback keeps the demo usable if localStorage is blocked.
 */

import { DEMO_TALENTS, DEMO_COMPANIES, DEMO_REQUESTS } from '../data/seed.js';

export const KEYS = {
  talents: 'herhunar.v1.talents',
  companies: 'herhunar.v1.companies',
  requests: 'herhunar.v1.requests',
  credentials: 'herhunar.v1.credentials',
  session: 'herhunar.v1.session',
  seeded: 'herhunar.v1.seeded',
};

const memory = new Map();

function storageAvailable() {
  try {
    const probe = '__herhunar_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const available = typeof window !== 'undefined' && storageAvailable();

function read(key, fallback) {
  try {
    const raw = available ? window.localStorage.getItem(key) : memory.get(key) ?? null;
    if (raw === null || raw === undefined) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.warn(`[herHunar] Could not read "${key}" from storage.`, error);
    return fallback;
  }
}

function write(key, value) {
  try {
    const raw = JSON.stringify(value);
    if (available) window.localStorage.setItem(key, raw);
    else memory.set(key, raw);
    return true;
  } catch (error) {
    console.warn(`[herHunar] Could not write "${key}" to storage.`, error);
    return false;
  }
}

export const storageMode = available ? 'localStorage' : 'memory';

/** Generates short, readable, URL-friendly ids: tal-k3f9x2a1 / com-91ab7c33 */
export function makeId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  const stamp = Date.now().toString(36).slice(-4);
  return `${prefix}-${stamp}${random}`;
}

/* ------------------------------------------------------------------ seeding */

export function isSeeded() {
  return read(KEYS.seeded, false) === true;
}

/** Load demo data once, so the platform is never empty on first open. */
export function ensureSeeded() {
  if (isSeeded()) return;
  write(KEYS.talents, DEMO_TALENTS);
  write(KEYS.companies, DEMO_COMPANIES);
  write(KEYS.requests, DEMO_REQUESTS);
  write(
    KEYS.credentials,
    [
      ...DEMO_TALENTS.map((talent) => ({ email: talent.email, kind: 'talent', id: talent.id, password: 'herhunar' })),
      ...DEMO_COMPANIES.map((company) => ({
        email: company.email,
        kind: 'company',
        id: company.id,
        password: 'herhunar',
      })),
    ],
  );
  write(KEYS.seeded, true);
}

/** Restores the original demo dataset (used by the "Reset demo data" action). */
export function resetDemoData() {
  write(KEYS.talents, DEMO_TALENTS);
  write(KEYS.companies, DEMO_COMPANIES);
  write(KEYS.requests, DEMO_REQUESTS);
  write(
    KEYS.credentials,
    [
      ...DEMO_TALENTS.map((talent) => ({ email: talent.email, kind: 'talent', id: talent.id, password: 'herhunar' })),
      ...DEMO_COMPANIES.map((company) => ({
        email: company.email,
        kind: 'company',
        id: company.id,
        password: 'herhunar',
      })),
    ],
  );
  write(KEYS.seeded, true);
}

/* ------------------------------------------------------------------ talents */

export const getTalents = () => read(KEYS.talents, []);
export const getTalent = (id) => getTalents().find((talent) => talent.id === id) ?? null;

export function saveTalent(talent) {
  const talents = getTalents();
  const index = talents.findIndex((item) => item.id === talent.id);
  const record = { ...talent, updatedAt: new Date().toISOString() };
  if (index >= 0) talents[index] = record;
  else talents.unshift(record);
  write(KEYS.talents, talents);
  return record;
}

/* ---------------------------------------------------------------- companies */

export const getCompanies = () => read(KEYS.companies, []);
export const getCompany = (id) => getCompanies().find((company) => company.id === id) ?? null;

export function saveCompany(company) {
  const companies = getCompanies();
  const index = companies.findIndex((item) => item.id === company.id);
  const record = { ...company, updatedAt: new Date().toISOString() };
  if (index >= 0) companies[index] = record;
  else companies.unshift(record);
  write(KEYS.companies, companies);
  return record;
}

/* ----------------------------------------------------------------- requests */

export const getRequests = () => read(KEYS.requests, []);

export function addRequest(request) {
  const requests = getRequests();
  const record = { ...request, id: request.id ?? makeId('creq') };
  requests.unshift(record);
  write(KEYS.requests, requests);
  return record;
}

export function updateRequestStatus(id, status) {
  const requests = getRequests().map((request) =>
    request.id === id ? { ...request, status, respondedAt: new Date().toISOString() } : request,
  );
  write(KEYS.requests, requests);
  return requests;
}

export const requestsForTalent = (talentId) => getRequests().filter((request) => request.talentId === talentId);
export const requestsForCompany = (companyId) => getRequests().filter((request) => request.companyId === companyId);

/* ------------------------------------------------------------ auth (demo) */

export const getCredentials = () => read(KEYS.credentials, []);

export function addCredential({ email, password, kind, id }) {
  const credentials = getCredentials().filter(
    (credential) => credential.email.toLowerCase() !== email.toLowerCase(),
  );
  credentials.push({ email, password, kind, id });
  write(KEYS.credentials, credentials);
}

export function findCredential(email, password) {
  const normalized = email.trim().toLowerCase();
  return (
    getCredentials().find(
      (credential) => credential.email.toLowerCase() === normalized && credential.password === password,
    ) ?? null
  );
}

export function emailTaken(email) {
  const normalized = email.trim().toLowerCase();
  return (
    getCredentials().some((credential) => credential.email.toLowerCase() === normalized) ||
    getTalents().some((talent) => talent.email?.toLowerCase() === normalized) ||
    getCompanies().some((company) => company.email?.toLowerCase() === normalized)
  );
}

export const getSession = () => read(KEYS.session, null);
export const setSession = (session) => write(KEYS.session, session);
export const clearSession = () => write(KEYS.session, null);
