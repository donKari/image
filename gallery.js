/**
 * pages/gallery.js
 * Gallery page: render, filter, search, infinite scroll, interactions.
 */

import { store } from '../services/store.js';
import { renderImageCard, renderSkeletonCard } from '../components/imageCard.js';
import { renderEmptyState } from '../components/emptyState.js';
import { showToast } from '../components/toast.js';
import { copyToClipboard, debounce } from '../lib/utils.js';
import { GALLERY_PAGE_SIZE } from '../lib/constants.js';

// ── IntersectionObserver for infinite scroll ─────────────────
let _scrollObserver = null;

export function initGallery() {
  // Debounced search
  const searchInput = document.getElementById('gallerySearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(e => {
      store.set('gallerySearch', e.target.value.toLowerCase());
      store.set('galleryPage', 1);
      renderGallery();
    }, 250));
  }

  // Delegate card interactions (one listener on the grid — not per-card)
  const grid = document.getElementById('galleryGrid');
  if (grid) {
    grid.addEventListener('click', handleGridClick);
    grid.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') handleGridClick(e);
    });
  }

  renderGallery();
  setupInfiniteScroll();
}

/** Main render — uses current filter/search/page from store */
export function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const filter  = store.get('galleryFilter');
  const search  = store.get('gallerySearch');
  const page    = store.get('galleryPage');
  const likedIds = store.get('likedIds');
  let data = [...store.get('galleryData')];

  // Filter
  if (filter === 'popular') data.sort((a, b) => b.likes - a.likes);
  if (filter === 'recent')  data = data.reverse();

  // Search
  if (search) {
    data = data.filter(img =>
      img.prompt.toLowerCase().includes(search) ||
      img.author.toLowerCase().includes(search)
    );
  }

  const total   = data.length;
  const sliced  = data.slice(0, page * GALLERY_PAGE_SIZE);

  if (!sliced.length) {
    grid.innerHTML = renderEmptyState({
      icon: 'image',
      title: 'Aucune image trouvée',
      description: 'Essayez d\'autres mots-clés ou filtres.',
    });
    return;
  }

  grid.innerHTML = sliced.map(img =>
    renderImageCard(img, { isLiked: likedIds.has(img.id) })
  ).join('');

  // Sentinel for infinite scroll
  if (sliced.length < total) {
    const sentinel = document.createElement('div');
    sentinel.id = 'gallerysentinel';
    sentinel.style.height = '20px';
    grid.appendChild(sentinel);
    if (_scrollObserver) _scrollObserver.observe(sentinel);
  }
}

function setupInfiniteScroll() {
  _scrollObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      store.update('galleryPage', p => p + 1);

      // Show skeleton briefly for perceived performance
      const grid = document.getElementById('galleryGrid');
      if (grid) {
        const skeletons = Array.from({ length: 4 }, () => renderSkeletonCard()).join('');
        const div = document.createElement('div');
        div.className = 'image-grid';
        div.style.display = 'contents';
        div.innerHTML = skeletons;
        grid.appendChild(div);
        setTimeout(() => { div.remove(); renderGallery(); }, 400);
      }
    }
  }, { rootMargin: '200px' });
}

/** Delegated click handler for the grid */
function handleGridClick(e) {
  const card        = e.target.closest('[data-action]');
  if (!card) return;

  const action = card.dataset.action;
  const id     = card.dataset.id;

  // Stop card open when clicking action buttons
  if (action === 'copy-prompt' || action === 'toggle-like') e.stopPropagation();

  switch (action) {
    case 'open-modal':    window.openImgModal?.(id);   break;
    case 'copy-prompt':   handleCopyPrompt(id);         break;
    case 'remix':         handleRemix(id);              break;
    case 'toggle-like':   handleToggleLike(id);         break;
  }
}

export function handleToggleLike(id) {
  const allData  = [...store.get('galleryData'), ...store.get('savedImages')];
  const img      = allData.find(i => i.id === id);
  if (!img) return;

  const likedIds = new Set(store.get('likedIds'));
  if (likedIds.has(id)) {
    likedIds.delete(id);
    img.likes = Math.max(0, img.likes - 1);
  } else {
    likedIds.add(id);
    img.likes++;
    showToast('Liked ! ❤️', 'success');
  }
  store.set('likedIds', likedIds);
  renderGallery();
}

function handleCopyPrompt(id) {
  const allData = [...store.get('galleryData'), ...store.get('savedImages')];
  const img     = allData.find(i => i.id === id);
  if (!img) return;
  copyToClipboard(img.prompt)
    .then(() => showToast('Prompt copié ! 📋', 'success'))
    .catch(() => showToast('Copie impossible', 'error'));
}

function handleRemix(id) {
  const allData = [...store.get('galleryData'), ...store.get('savedImages')];
  const img     = allData.find(i => i.id === id);
  if (!img) return;
  const input = document.getElementById('promptInput');
  if (input) input.value = img.prompt;
  window.navigate?.('generate');
  showToast('Prompt chargé pour remix !', 'success');
}

export function setGalleryFilter(filter, btn) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  store.set('galleryFilter', filter);
  store.set('galleryPage', 1);
  renderGallery();
}
