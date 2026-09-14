import Ambient from '../audio/Ambient.js';
import { setWaveText } from './headerWave.js';

const SOUND_PREFERENCE_KEY = 'paz-lofi-enabled';
const SOUND_PLAYED_KEY = 'paz-lofi-was-playing';

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

function wasPlaying() {
  try { return sessionStorage.getItem(SOUND_PLAYED_KEY) === 'true'; } catch (_) { return false; }
}

function rememberPlaying(playing) {
  try {
    if (playing) sessionStorage.setItem(SOUND_PLAYED_KEY, 'true');
    else sessionStorage.removeItem(SOUND_PLAYED_KEY);
  } catch (_) { /* storage is optional */ }
}

export function initSound() {
  const btn = document.querySelector('.nav__sound');
  if (!btn) return;

  const ambient = new Ambient();
  const label = btn.querySelector('.nav__sound-label');
  let preferred = getPreference();
  let request = 0;

  const updateUI = (on) => {
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Turn off the lo-fi soundscape' : 'Turn on the lo-fi soundscape');
    btn.dataset.audioState = on ? 'playing' : 'paused';
    if (label) setWaveText(label, on ? 'Lo-fi on' : 'Lo-fi off');
  };

  updateUI(false);

  ambient.onStateChange = (playing) => updateUI(playing);

  const setPlaying = async (enabled) => {
    const currentRequest = ++request;
    try {
      const playing = await ambient.setEnabled(enabled);
      if (currentRequest !== request) return playing;
      if (playing) rememberPlaying(true);
      else if (!enabled) rememberPlaying(false);
      updateUI(playing);
      return playing;
    } catch (_) {
      if (currentRequest === request) updateUI(false);
      return false;
    }
  };

  // Browsers only allow Web Audio to begin from a trusted interaction. The
  // preference is nevertheless on by default, so the lo-fi bed starts with the
  // visitor's first interaction and returns on subsequent site pages.
  const resumePreferred = (event) => {
    if (event.target instanceof Element && event.target.closest('.nav__sound')) return;
    if (!preferred || ambient.isPlaying) return;
    setPlaying(true);
  };
  window.addEventListener('pointerdown', resumePreferred, { capture: true });
  window.addEventListener('keydown', resumePreferred, { capture: true });

  // Every full page navigation creates a new AudioContext. Resume a previously
  // running session immediately when allowed, with the gesture listeners above
  // as the browser-policy fallback.
  if (preferred && wasPlaying()) setPlaying(true);

  btn.addEventListener('click', async () => {
    const shouldEnable = btn.getAttribute('aria-pressed') !== 'true';
    preferred = shouldEnable;
    savePreference(preferred);
    await setPlaying(shouldEnable);
  });

  return ambient;
}
