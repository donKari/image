/**
 * services/authService.js
 * Authentication logic.
 * All validation lives here — the UI just calls these functions and handles results.
 * Replace internals with Supabase / Firebase calls when ready.
 */

import { isValidEmail, escapeHtml } from '../lib/utils.js';
import { PASSWORD_MIN_LENGTH } from '../lib/constants.js';

/** @typedef {{ name: string, email: string }} User */

/**
 * Validate and "log in" a user.
 * @returns {{ ok: boolean, user?: User, error?: string }}
 */
export function login(email, password) {
  if (!email || !password) return { ok: false, error: 'Remplissez tous les champs.' };
  if (!isValidEmail(email))  return { ok: false, error: 'Email invalide.' };

  // Mock: derive name from email prefix
  const name = escapeHtml(email.split('@')[0]);
  return { ok: true, user: { name, email } };
}

/**
 * Validate and register a new user.
 * @returns {{ ok: boolean, user?: User, error?: string }}
 */
export function register(name, email, password) {
  if (!name || !email || !password) return { ok: false, error: 'Remplissez tous les champs.' };
  if (name.trim().length < 2)       return { ok: false, error: 'Pseudo trop court (min. 2 caractères).' };
  if (!isValidEmail(email))          return { ok: false, error: 'Email invalide.' };
  if (password.length < PASSWORD_MIN_LENGTH)
    return { ok: false, error: `Mot de passe trop court (min. ${PASSWORD_MIN_LENGTH} caractères).` };

  return { ok: true, user: { name: escapeHtml(name.trim()), email } };
}

/** Quick demo login — no validation needed */
export function demoLogin() {
  return { ok: true, user: { name: 'DemoUser', email: 'demo@genforge.ai' } };
}
