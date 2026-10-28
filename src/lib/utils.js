export const cx = (...values) => values.filter(Boolean).join(' ');

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'HH';

/** Deterministic blue/violet gradient per profile, so avatars feel consistent. */
const AVATAR_GRADIENTS = [
  'from-brand-500 to-brand-800',
  'from-blue-400 to-indigo-700',
  'from-sky-400 to-blue-700',
  'from-indigo-400 to-brand-800',
  'from-cyan-400 to-brand-700',
  'from-blue-500 to-violet-700',
];

export function avatarGradient(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function relativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(value ?? '').trim());

export const isValidPhone = (value) => String(value ?? '').replace(/\D/g, '').length >= 10;

export const isValidUrl = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return true; // optional field
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return Boolean(url.hostname.includes('.'));
  } catch {
    return false;
  }
};

export const parseList = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const publicProfilePath = (record) =>
  record?.kind === 'company' ? `/company/${record.id}` : `/talent/${record.id}`;

export const publicProfileUrl = (record) =>
  `${window.location.origin}${publicProfilePath(record)}`;

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers that block the async clipboard API.
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export function downloadFile(filename, content, type = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slugify = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'profile';
