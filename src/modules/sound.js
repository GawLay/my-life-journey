import Ambient from '../audio/Ambient.js';
import { setWaveText } from './headerWave.js';

const SOUND_PREFERENCE_KEY = 'paz-lofi-enabled';

function getPreference() {
  try {
    const value = localStorage.getItem(SOUND_PREFERENCE_KEY);
    return value === null ? true : value === 'true';
  } catch (_) {
    return true;
  }
}

function savePreference(enabled) {
  try { localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled)); } catch (_) { /* storage is optional */ }
}

export function initSound() {
  const btn = document.querySelector('.nav__sound');
  if (!btn) return;

  const ambient = new Ambient();
  const label = btn.querySelector('.nav__sound-label');
  let busy = false;
  let preferred = getPreference();

  const updateUI = (on) => {
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Turn off the lo-fi soundscape' : 'Turn on the lo-fi soundscape');
    if (label) setWaveText(label, on ? 'Lo-fi on' : 'Lo-fi off');
  };

  updateUI(preferred);

  // Browsers only allow Web Audio to begin from a trusted interaction. The
  // preference is nevertheless on by default, so the lo-fi bed starts with the
  // visitor's first interaction and returns on subsequent site pages.
  const beginOnFirstGesture = () => {
    window.setTimeout(() => {
      if (getPreference()) ambient.setEnabled(true);
    }, 0);
  };
  window.addEventListener('pointerdown', beginOnFirstGesture, { once: true, capture: true });
  window.addEventListener('keydown', beginOnFirstGesture, { once: true, capture: true });

  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      preferred = !preferred;
      savePreference(preferred);
      const on = await ambient.setEnabled(preferred);
      updateUI(on);
    } catch (e) {
      /* audio not available */
    }
    busy = false;
  });
}
