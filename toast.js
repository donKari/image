/**
 * components/toast.js
 * Lightweight toast notification component.
 * Self-contained: creates its own container on first use.
 */

let _container = null;

function getContainer() {
  if (!_container) {
    _container = document.getElementById('toastContainer');
  }
  return _container;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration  ms before auto-dismiss
 */
export function showToast(message, type = 'success', duration = 3000) {
  const container = getContainer();
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 280);
  }, duration);
}
