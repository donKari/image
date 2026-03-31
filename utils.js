/**
 * lib/utils.js
 * Pure utility functions — no DOM, no side effects.
 */

/** Avatar color classes cycling on first char code */
const AVATAR_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
export function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  return AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
}

/** Sanitise user input to prevent basic XSS in innerHTML contexts */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Debounce — delays fn execution until `ms` ms after the last call */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Simple unique ID generator */
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Pick a random item from an array */
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shallow clone an object */
export function clone(obj) {
  return { ...obj };
}

/** Format relative time label (static labels for MVP) */
export function relativeTime(label) {
  return label || 'maintenant';
}

/** Validate email format */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Copy text to clipboard, returns promise */
export function copyToClipboard(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  // fallback
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}
