/**
 * components/commentSection.js
 * Renders the comments list and handles new comment submission.
 * Anti-spam: cooldown between posts. Max length enforced.
 */

import { escapeHtml } from '../lib/utils.js';
import { showToast } from './toast.js';
import { store } from '../services/store.js';
import { COMMENT_COOLDOWN_MS, COMMENT_MAX_LENGTH } from '../lib/constants.js';

/**
 * Render the comment list into the given container element.
 * @param {HTMLElement} listEl
 * @param {Array} comments
 */
export function renderComments(listEl, comments) {
  const countEl = document.getElementById('commentsCount');
  if (countEl) countEl.textContent = comments.length;

  if (!comments.length) {
    listEl.innerHTML = `<p class="comments-empty">Aucun commentaire. Soyez le premier !</p>`;
    return;
  }

  listEl.innerHTML = comments.map(c => `
    <div class="comment">
      <div class="mini-avatar ${c.color || 'c1'}" style="width:28px;height:28px;font-size:11px;flex-shrink:0;"
           aria-hidden="true">${escapeHtml(c.user)[0].toUpperCase()}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-user">${escapeHtml(c.user)}</span>
          <span class="comment-time">${escapeHtml(c.time)}</span>
        </div>
        <p class="comment-text">${escapeHtml(c.text)}</p>
      </div>
    </div>`).join('');

  // Scroll to latest
  listEl.scrollTop = listEl.scrollHeight;
}

/**
 * Handle new comment submission.
 * Returns the new comment object on success, null on failure.
 *
 * @param {string} text
 * @returns {{ user, text, time, color } | null}
 */
export function submitComment(text) {
  const user = store.get('user');
  if (!user) {
    showToast('Connectez-vous pour commenter.', 'error');
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) return null;

  // Max length
  if (trimmed.length > COMMENT_MAX_LENGTH) {
    showToast(`Commentaire trop long (max ${COMMENT_MAX_LENGTH} caractères).`, 'error');
    return null;
  }

  // Anti-spam cooldown
  const now = Date.now();
  const lastTime = store.get('lastCommentTime');
  if (now - lastTime < COMMENT_COOLDOWN_MS) {
    const wait = Math.ceil((COMMENT_COOLDOWN_MS - (now - lastTime)) / 1000);
    showToast(`Attendez ${wait}s avant de commenter à nouveau.`, 'error');
    return null;
  }

  store.set('lastCommentTime', now);

  return {
    user:  user.name,
    text:  trimmed,
    time:  'à l\'instant',
    color: require('../lib/utils.js').getAvatarColor(user.name),
  };
}
