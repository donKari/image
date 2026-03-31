/**
 * services/store.js
 * Centralised application state.
 * Uses a simple pub/sub pattern so any module can react to state changes
 * without tight coupling.
 *
 * Usage:
 *   import { store } from './store.js';
 *   store.subscribe('user', (user) => updateNavAuth(user));
 *   store.set('user', { name: 'Alice' });
 *   const user = store.get('user');
 */

import { SAMPLE_GALLERY, SEED_COMMENTS } from '../lib/constants.js';

// ── Seed comments into gallery ────────────────────────────────
const initialGallery = SAMPLE_GALLERY.map(img => ({ ...img, comments: [...img.comments] }));
SEED_COMMENTS.forEach(({ imageId, comments }) => {
  const img = initialGallery.find(i => i.id === imageId);
  if (img) img.comments = comments;
});

// ── Initial state shape ───────────────────────────────────────
const _state = {
  user:           null,        // { name, email } | null
  currentPage:    'generate',
  currentImg:     null,        // { url, prompt, seed, model, time } | null
  galleryFilter:  'all',       // 'all' | 'popular' | 'recent'
  gallerySearch:  '',
  galleryPage:    1,           // for infinite scroll
  profileTab:     'creations',
  generatorVars:  [],          // [{ name, values }]

  // Collections
  galleryData:    initialGallery,
  likedIds:       new Set(),
  savedImages:    [],
  savedGenerators: [],

  // UI helpers
  isGenerating:   false,
  lastCommentTime: 0,          // timestamp — anti-spam
};

// ── Subscribers map ───────────────────────────────────────────
const _subscribers = {};

/**
 * Subscribe to changes on a specific key.
 * Returns an unsubscribe function.
 */
function subscribe(key, fn) {
  if (!_subscribers[key]) _subscribers[key] = [];
  _subscribers[key].push(fn);
  return () => {
    _subscribers[key] = _subscribers[key].filter(f => f !== fn);
  };
}

/** Notify all subscribers for a key */
function _notify(key) {
  (_subscribers[key] || []).forEach(fn => fn(_state[key]));
}

/** Read a value from state */
function get(key) {
  return _state[key];
}

/** Write a value to state and notify subscribers */
function set(key, value) {
  _state[key] = value;
  _notify(key);
}

/** Update a single key with a merger function: set('arr', prev => [...prev, newItem]) */
function update(key, fn) {
  set(key, fn(_state[key]));
}

export const store = { get, set, update, subscribe };
