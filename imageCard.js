/**
 * components/imageCard.js
 * Renders an image card — used in Gallery, Profile (creations + favourites).
 * Returns an HTML string; caller inserts it into the grid.
 *
 * Centralising this eliminates the three near-identical card templates
 * that existed across renderGallery / renderUserImages / switchProfileTab.
 */

import { escapeHtml } from '../lib/utils.js';

/**
 * @param {object}  img
 * @param {object}  opts
 * @param {boolean} opts.showActions   show copy/remix overlay buttons (default true)
 * @param {boolean} opts.isLiked       render like button as active
 * @param {boolean} opts.isOwned       show delete button (future use)
 */
export function renderImageCard(img, { showActions = true, isLiked = false } = {}) {
  const safePrompt  = escapeHtml(img.prompt);
  const safeAuthor  = escapeHtml(img.author);
  const likedClass  = isLiked ? 'liked' : '';
  const likeFill    = isLiked ? 'currentColor' : 'none';

  const actionsHtml = showActions ? `
    <div class="card-hover-overlay" aria-hidden="true">
      <button class="icon-btn" data-action="copy-prompt" data-id="${img.id}" title="Copier le prompt" aria-label="Copier le prompt">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      </button>
      <button class="icon-btn" data-action="remix" data-id="${img.id}" title="Remix" aria-label="Remixer cette image">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/></svg>
      </button>
    </div>` : '';

  return `
    <article class="image-card" data-action="open-modal" data-id="${img.id}" tabindex="0"
             role="button" aria-label="Voir l'image : ${safePrompt}">
      <div class="card-img-wrap">
        <img src="${img.url}" loading="lazy" alt="${safePrompt}" decoding="async"/>
        ${actionsHtml}
      </div>
      <div class="card-info">
        <p class="card-prompt" title="${safePrompt}">${safePrompt}</p>
        <div class="card-meta">
          <div class="card-author">
            <div class="mini-avatar ${img.authorColor}" aria-hidden="true">${safeAuthor[0].toUpperCase()}</div>
            <span>${safeAuthor}</span>
          </div>
          <div class="card-stats">
            <button class="stat-btn ${likedClass}" data-action="toggle-like" data-id="${img.id}"
                    aria-label="${isLiked ? 'Retirer le like' : 'Liker cette image'}" aria-pressed="${isLiked}">
              <svg fill="${likeFill}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <span>${img.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </article>`;
}

/**
 * Renders a skeleton placeholder card for lazy-loading states.
 */
export function renderSkeletonCard() {
  return `
    <div class="image-card skeleton-card" aria-hidden="true">
      <div class="card-img-wrap skeleton-img"></div>
      <div class="card-info">
        <div class="skeleton-line" style="width:85%;height:12px;margin-bottom:10px;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="skeleton-line" style="width:40%;height:11px;"></div>
          <div class="skeleton-line" style="width:20%;height:11px;"></div>
        </div>
      </div>
    </div>`;
}
