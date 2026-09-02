import Ambient from '../audio/Ambient.js';
import { setWaveText } from './headerWave.js';

export function initSound() {
  const btn = document.querySelector('.nav__sound');
  if (!btn) return;

  const ambient = new Ambient();
  const label = btn.querySelector('.nav__sound-label');
  let busy = false;

  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      const on = await ambient.toggle();
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Turn off the lo-fi soundscape' : 'Turn on the lo-fi soundscape');
      if (label) setWaveText(label, on ? 'Lo-fi on' : 'Lo-fi off');
    } catch (e) {
      /* audio not available */
    }
    busy = false;
  });
}
