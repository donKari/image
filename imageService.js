/**
 * services/imageService.js
 * All logic related to image generation.
 * Isolated from DOM so it's easy to swap the mock for a real API call.
 */

import { LOADING_MESSAGES, IMPROVEMENT_SUFFIXES, RANDOM_PROMPTS } from '../lib/constants.js';
import { randomPick, uid } from '../lib/utils.js';

/**
 * Simulates an AI image generation call.
 * Replace the body of this function with a real fetch() to your API.
 *
 * @param {string} prompt
 * @param {{ model: string, steps: number, cfg: number, style: string }} settings
 * @param {(msg: string) => void} onProgress  — called with status updates
 * @returns {Promise<{ url: string, prompt: string, model: string, seed: number }>}
 */
export function generateImage(prompt, settings, onProgress) {
  return new Promise((resolve) => {
    let msgIndex = 0;

    const interval = setInterval(() => {
      onProgress(LOADING_MESSAGES[msgIndex % LOADING_MESSAGES.length]);
      msgIndex++;
    }, 600);

    // Mock: random picsum image — swap for real API
    const seed = Math.floor(Math.random() * 99999);
    const delay = 2800 + Math.random() * 1400;

    setTimeout(() => {
      clearInterval(interval);
      resolve({
        id:     uid('img'),
        url:    `https://picsum.photos/seed/${seed}/1024/1024`,
        prompt,
        model:  settings.model || 'FLUX.1 Pro',
        seed,
        time:   'à l\'instant',
      });
    }, delay);
  });
}

/**
 * Returns a randomly selected prompt from the bank.
 * @returns {string}
 */
export function getRandomPrompt() {
  return randomPick(RANDOM_PROMPTS);
}

/**
 * Appends quality/style suffixes to enhance a prompt.
 * @param {string} prompt
 * @returns {string}
 */
export function improvePrompt(prompt) {
  if (!prompt.trim()) return prompt;
  const suffix = randomPick(IMPROVEMENT_SUFFIXES);
  // Avoid duplicate suffixes
  return prompt.trimEnd().replace(/,\s*$/, '') + suffix;
}
