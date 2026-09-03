import gsap from 'gsap';
import Globe from './gl/Globe.js';
import { places } from './data/places.js';
import { initSound } from './modules/sound.js';
import { initLiquidTrail } from './modules/liquidTrail.js';
import { initHeaderWave } from './modules/headerWave.js';
import { initCountryDiscovery } from './modules/countryDiscovery.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(window.location.search);
const requestedDiscovery = params.get('view') === 'discovery' || window.history.state?.pazView === 'countryDiscovery';
const requestedId = params.get('place') || window.history.state?.place || params.get('focus');
const requestedPlace = places.find((place) => place.id === requestedId);
const mount = document.getElementById('world-globe');
const nav = document.getElementById('world-countries');
let activeFocus = requestedPlace?.id || 'vietnam';
let returningToWork = false;
let discovery;

const globe = new Globe(mount, {
  places,
  reduced,
  onSelect: (id) => {
    const place = places.find((item) => item.id === id);
    if (place && discovery?.viewMode === 'world') {
      activeFocus = place.id;
      discovery.enter(place);
    }
  },
});

discovery = initCountryDiscovery({ globe, globeMount: mount, places, reduced });

nav.innerHTML = places.map((place, index) => `
  <button class="world-country" type="button" data-place="${place.id}">
    <span>${String(index + 1).padStart(2, '0')}</span><b>${place.country}</b>
  </button>`).join('');

nav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-place]');
  if (!button || discovery.viewMode !== 'world') return;
  const place = places.find((item) => item.id === button.dataset.place);
  if (!place) return;
  activeFocus = place.id;
  discovery.enter(place);
});

function animateWorldEntrance() {
  if (reduced) {
    document.querySelector('.world-entry').remove();
    return;
  }
  gsap.timeline()
    .to('.world-entry', { clipPath: 'circle(0% at 50% 50%)', duration: 1.15, ease: 'power3.inOut' }, 0)
    .from('.world__globe', { scale: .72, autoAlpha: 0, duration: 1.25, ease: 'power3.out' }, .35)
    .from('.world__intro > *', { y: 24, autoAlpha: 0, stagger: .09, duration: .8, ease: 'power3.out' }, .55)
    .fromTo('.world-memory',
      { scale: .84, opacity: 0, visibility: 'hidden' },
      { scale: 1, opacity: 1, visibility: 'visible', stagger: .08, duration: .9, ease: 'power3.out' },
      .75)
    .from('.world__countries', { yPercent: 100, duration: .8, ease: 'power3.out' }, .8);
}

// Rebuild the exact warm cover the Deep Dive page departs under (same palette /
// photo), so the two page-covers read as one continuous surface across the load.
function discoveryCoverBackground(place) {
  let palette = place.memories[7]?.palette || place.memories[0]?.palette;
  let image = null;
  const handoff = window.__PAZ_COUNTRY_HANDOFF__;
  if (handoff?.id === place.id) {
    palette = handoff.palette || palette;
    image = handoff.image || null;
  }
  if (image) return `url("${image}") center / cover no-repeat`;
  if (palette?.length === 3) return `linear-gradient(135deg, ${palette[0]}, ${palette[1]} 52%, ${palette[2]}) center / cover no-repeat`;
  return '';
}

function revealIntoDiscovery(place) {
  const entry = document.querySelector('.world-entry');
  if (reduced || !entry) {
    gsap.set('.world-entry', { clipPath: 'circle(0% at 50% 50%)' });
    discovery.enter(place, { instant: true });
    return;
  }
  // The Deep Dive page hands off under a warm place-cover; match it and keep it in
  // place, build the discovery view behind it, then iris the cover open to reveal it.
  entry.style.background = discoveryCoverBackground(place);
  discovery.enter(place, { reveal: true });
  // Leave the inline circle(0%) in place on completion — the CSS default for
  // .world-entry is circle(150%) (covering), so clearing props would re-cover it.
  gsap.fromTo(entry,
    { clipPath: 'circle(150% at 50% 50%)' },
    {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 1.05,
      ease: 'power3.inOut',
      onComplete: () => document.documentElement.classList.remove('is-discovery-entry'),
    });
}

function setupSceneParallax() {
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
  const memories = [...document.querySelectorAll('.world-memory')];
  const amounts = [-18, 13, 20, -14];
  const movers = memories.map((memory, index) => ({
    x: gsap.quickTo(memory, 'x', { duration: 1.6 + index * .18, ease: 'power3.out' }),
    y: gsap.quickTo(memory, 'y', { duration: 1.6 + index * .18, ease: 'power3.out' }),
    amount: amounts[index],
  }));
  window.addEventListener('pointermove', (event) => {
    if (discovery.viewMode !== 'world') return;
    const nx = event.clientX / window.innerWidth - .5;
    const ny = event.clientY / window.innerHeight - .5;
    movers.forEach((mover) => {
      mover.x(nx * mover.amount);
      mover.y(ny * mover.amount);
    });
  }, { passive: true });
}

function setupBackToWork() {
  const back = document.querySelector('.world-header__back');
  if (!back || reduced) return;
  back.addEventListener('click', (event) => {
    event.preventDefault();
    if (returningToWork || discovery.viewMode !== 'world') return;
    returningToWork = true;
    document.body.classList.add('is-returning');
    // Tell the Work page to open under a matching charcoal cover so the hand-off
    // stays seamless instead of hard-cutting from dark overlay to the lit page.
    try { sessionStorage.setItem('paz-entry', 'work'); } catch { /* storage can be unavailable */ }
    const entry = document.querySelector('.world-entry');
    document.documentElement.classList.remove('is-discovery-entry');
    entry.style.background = '';   // back to the charcoal CSS default for this cover
    entry.querySelector('.world-entry__default').textContent = 'RETURN TO WORK';
    gsap.fromTo(entry,
      { clipPath: 'circle(0% at 50% 50%)' },
      {
        clipPath: 'circle(150% at 50% 50%)',
        duration: .85,
        ease: 'power3.inOut',
        onComplete: () => window.location.assign(back.href),
      });
  });
}

function restoreWorldState() {
  returningToWork = false;
  document.body.classList.remove('is-returning');
  if (discovery.viewMode !== 'world') return;
  gsap.set(mount, { clearProps: 'transform,opacity,visibility' });
  const entry = document.querySelector('.world-entry');
  if (entry) entry.style.background = '';
  document.documentElement.classList.remove('is-discovery-entry');
  gsap.set('.world-entry', { clipPath: 'circle(0% at 50% 50%)' });
  globe.autoRotate = true;
  globe.focus(activeFocus);
}

initHeaderWave();
initSound();
initLiquidTrail({ dark: true });
setupSceneParallax();
setupBackToWork();

if (reduced) globe.ready.finally(() => globe.render());
else gsap.ticker.add(() => globe.render());

if (requestedDiscovery && requestedPlace) {
  revealIntoDiscovery(requestedPlace);
} else {
  globe.ready.then(() => globe.focus(activeFocus));
  animateWorldEntrance();
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) restoreWorldState();
});
