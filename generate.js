/**
 * pages/generate.js
 * Generate page: prompt input, settings, image display, actions.
 */

import { store } from '../services/store.js';
import { generateImage, getRandomPrompt, improvePrompt } from '../services/imageService.js';
import { showToast } from '../components/toast.js';
import { MAX_RECENT_IMAGES } from '../lib/constants.js';

// ── Settings state (local to this page) ─────────────────────
const settings = {
  model: 'FLUX.1 Pro',
  steps: 28,
  cfg:   7,
  style: 'Aucun',
};

// ── Init ─────────────────────────────────────────────────────
export function initGenerate() {
  // Nothing extra needed on first load; HTML is static.
}

// ── Prompt helpers ───────────────────────────────────────────
export function addTag(tag) {
  const input = document.getElementById('promptInput');
  if (!input) return;
  const val = input.value.trim();
  input.value = val ? `${val}, ${tag}` : tag;
  input.focus();
}

export function randomPrompt() {
  const input = document.getElementById('promptInput');
  if (input) input.value = getRandomPrompt();
  showToast('Prompt aléatoire chargé ! 🎲', 'success');
}

export function enhancePrompt() {
  const input = document.getElementById('promptInput');
  if (!input || !input.value.trim()) {
    showToast('Entrez d\'abord un prompt à améliorer.', 'error');
    return;
  }
  input.value = improvePrompt(input.value);
  showToast('Prompt amélioré ! ✨', 'success');
}

export function selectStyle(btn) {
  document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  settings.style = btn.textContent.trim();
}

export function updateModel(value) {
  settings.model = value;
}

// ── Generation ───────────────────────────────────────────────
export async function triggerGenerate() {
  const input  = document.getElementById('promptInput');
  const prompt = input?.value.trim();
  if (!prompt) { showToast("Entrez un prompt d'abord !", 'error'); return; }
  if (store.get('isGenerating')) return; // prevent double-click

  store.set('isGenerating', true);
  setGenerateUI('loading');

  try {
    const result = await generateImage(prompt, settings, msg => {
      const loadingText = document.getElementById('loadingText');
      if (loadingText) loadingText.textContent = msg;
    });

    store.set('currentImg', result);
    setGenerateUI('done', result.url);
    addToRecent(result.url, prompt);
    showToast('Image générée avec succès ! ✨', 'success');
  } catch (err) {
    showToast('Erreur lors de la génération.', 'error');
    setGenerateUI('idle');
  } finally {
    store.set('isGenerating', false);
  }
}

/** Controls the canvas + button UI state */
function setGenerateUI(state, imgUrl = '') {
  const btn         = document.getElementById('generateBtn');
  const placeholder = document.getElementById('canvasPlaceholder');
  const loadingDiv  = document.getElementById('loadingState');
  const img         = document.getElementById('generatedImg');
  const actions     = document.getElementById('canvasActions');

  if (state === 'loading') {
    btn.classList.add('loading');
    btn.innerHTML = `<div class="loading-ring" style="width:18px;height:18px;border-width:2px;"></div> Génération...`;
    placeholder.style.display   = 'none';
    img.style.display            = 'none';
    loadingDiv.style.display     = 'flex';
    if (actions) actions.style.opacity = '0';
  }

  if (state === 'done') {
    btn.classList.remove('loading');
    btn.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> GÉNÉRER`;
    loadingDiv.style.display = 'none';
    img.src   = imgUrl;
    img.style.display = 'block';
    img.style.animation = 'fadeUp 0.4s ease';
  }

  if (state === 'idle') {
    btn.classList.remove('loading');
    btn.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> GÉNÉRER`;
    loadingDiv.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

// ── Canvas actions ───────────────────────────────────────────
export function downloadCurrentImg() {
  const img = store.get('currentImg');
  if (!img) return;
  const a = document.createElement('a');
  a.href = img.url;
  a.download = 'genforge-image.png';
  a.target = '_blank';
  a.click();
  showToast('Téléchargement lancé', 'success');
}

export function saveCurrentImage() {
  const img  = store.get('currentImg');
  const user = store.get('user');
  if (!img)  return;
  if (!user) { window.openModal?.('login'); showToast('Connectez-vous pour sauvegarder', 'error'); return; }

  const { getAvatarColor } = require('../lib/utils.js');
  const entry = {
    ...img,
    id:          'u' + Date.now(),
    author:      user.name,
    authorColor: getAvatarColor(user.name),
    likes:       0,
    time:        'à l\'instant',
    comments:    [],
  };
  store.update('savedImages', imgs => [entry, ...imgs]);
  showToast('Image sauvegardée dans votre profil ! 💾', 'success');
}

export function remixCurrentPrompt() {
  const img = store.get('currentImg');
  if (!img) return;
  const input = document.getElementById('promptInput');
  if (input) input.value = img.prompt;
  showToast('Prompt chargé pour remix !', 'success');
}

export function shareCurrentImage() {
  const img  = store.get('currentImg');
  const user = store.get('user');
  if (!img) { showToast("Générez d'abord une image", 'error'); return; }

  const { getAvatarColor } = require('../lib/utils.js');
  const entry = {
    ...img,
    id:          'pub' + Date.now(),
    author:      user ? user.name : 'Anonyme',
    authorColor: user ? getAvatarColor(user.name) : 'c3',
    likes:       0,
    time:        'à l\'instant',
    comments:    [],
  };
  store.update('galleryData', data => [entry, ...data]);
  showToast('Image partagée dans la galerie ! 🌍', 'success');
}

// ── Recent images sidebar ────────────────────────────────────
function addToRecent(url, prompt) {
  const container = document.getElementById('recentImages');
  const empty     = document.getElementById('recentEmpty');
  if (!container) return;

  if (empty) empty.style.display = 'none';

  const div = document.createElement('div');
  div.className = 'recent-thumb';
  div.setAttribute('tabindex', '0');
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', `Recharger: ${prompt}`);
  div.innerHTML = `<img src="${url}" loading="lazy" alt="${prompt}" decoding="async"/>`;
  div.addEventListener('click',  () => restoreImage(url, prompt));
  div.addEventListener('keydown', e => { if (e.key === 'Enter') restoreImage(url, prompt); });

  container.insertBefore(div, container.firstChild);
  while (container.children.length > MAX_RECENT_IMAGES) container.lastChild.remove();
}

function restoreImage(url, prompt) {
  const input = document.getElementById('promptInput');
  if (input) input.value = prompt;
  store.set('currentImg', { url, prompt });

  const img = document.getElementById('generatedImg');
  const placeholder = document.getElementById('canvasPlaceholder');
  if (img)         { img.src = url; img.style.display = 'block'; }
  if (placeholder) placeholder.style.display = 'none';
}
