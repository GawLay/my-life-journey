import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { places } from './data/places.js';
import { initSound } from './modules/sound.js';
import { initLiquidTrail } from './modules/liquidTrail.js';
import { initHeaderWave } from './modules/headerWave.js';

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(window.location.search);
const place = places.find((item) => item.id === params.get('place')) || places.find((item) => item.id === 'japan') || places[0];
const fromDiscovery = params.get('from') === 'discovery';
const index = places.findIndex((item) => item.id === place.id);
const next = places[(index + 1) % places.length];
const cities = place.cities.split(' / ').map((city) => city.trim());
const palettes = [
  ['#ad563b', '#d8a266', '#435d58'],
  ['#a94834', '#cf9462', '#52635a'],
  ['#b86643', '#dbc192', '#3e5d5c'],
  ['#b54e34', '#d8a15f', '#475d57'],
  ['#a44935', '#cf9b67', '#4a5f5b'],
];
const [accent, warm, cool] = palettes[index] || palettes[0];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let storedHandoff = null;
try {
  const candidate = JSON.parse(sessionStorage.getItem('paz-country-handoff'));
  if (candidate?.id === place.id) storedHandoff = candidate;
} catch { /* storage can be unavailable */ }
const fallbackHandoff = place.memories[7] || place.memories[0];
const handoffPalette = storedHandoff?.palette || fallbackHandoff.palette;

document.title = `${place.country} — World Journal / Phyo Aung Zaw`;
document.body.style.setProperty('--country-accent', accent);
document.body.style.setProperty('--country-warm', warm);
document.body.style.setProperty('--country-cool', cool);
document.documentElement.style.setProperty('--handoff-a', handoffPalette[0]);
document.documentElement.style.setProperty('--handoff-b', handoffPalette[1]);
document.documentElement.style.setProperty('--handoff-c', handoffPalette[2]);
if (storedHandoff?.image) document.documentElement.style.setProperty('--handoff-image', `url("${storedHandoff.image}")`);
document.getElementById('country-entry-name').textContent = place.country;
document.getElementById('country-entry-label').textContent = place.country.toUpperCase();
document.getElementById('country-header-label').textContent = `${place.country.toUpperCase()} / ${place.year}`;
document.getElementById('country-back-discovery').href = `./world.html?view=discovery&place=${encodeURIComponent(place.id)}`;
document.getElementById('country-back-world').href = `./world.html?focus=${encodeURIComponent(place.id)}`;

const content = document.getElementById('country-content');
content.innerHTML = `
  <section class="country-hero">
    <div class="country-hero__photo journal-photo journal-photo--hero" role="img" aria-label="Placeholder for a hero photograph from ${place.country}">
      <span>PHOTOGRAPH / PLACEHOLDER</span><b>${cities[0]} · ARRIVAL</b>
    </div>
    <div class="country-hero__copy">
      <span>${String(index + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}</span>
      <h1>${place.country}</h1>
      <p>${place.year}</p>
    </div>
    <div class="country-hero__route"><span>${place.coordinates}</span><b>${place.cities}</b></div>
  </section>

  <section class="country-intro">
    <p class="country-intro__label">A PERSONAL FIELD NOTE</p>
    <blockquote>“${place.note}”</blockquote>
    <dl>
      <div><dt>CHAPTER</dt><dd>${String(index + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}</dd></div>
      <div><dt>PHOTOGRAPHS</dt><dd>${String(place.photos).padStart(2, '0')}</dd></div>
      <div><dt>STORIES</dt><dd>${String(place.stories).padStart(2, '0')}</dd></div>
      <div><dt>COORDINATES</dt><dd>${place.coordinates}</dd></div>
    </dl>
  </section>

  <section class="photo-story">
    <article class="photo-chapter photo-chapter--wide">
      <header><span>01 / ${cities[0]}</span><time>${place.year}</time></header>
      <div class="journal-photo journal-photo--wide" role="img" aria-label="Placeholder for a wide photograph from ${cities[0]}"><span>PHOTOGRAPH / PLACEHOLDER</span><b>BLUE HOUR / ${cities[0]}</b></div>
      <p>The first walk without a destination. Light changing on unfamiliar streets; the city beginning to explain itself.</p>
    </article>

    <article class="photo-chapter photo-chapter--split">
      <div class="journal-photo journal-photo--portrait" role="img" aria-label="Placeholder for a portrait photograph from ${cities[1] || cities[0]}"><span>PHOTOGRAPH / PLACEHOLDER</span><b>${cities[1] || cities[0]} / 06:42</b></div>
      <div class="photo-chapter__text"><span>02 / MORNING</span><h2>The hour before<br /><em>everything opens.</em></h2><p>Small rituals carry the shape of a place: shutters rising, breakfast behind a curtain, bicycles against old walls.</p></div>
    </article>

    <article class="photo-chapter photo-chapter--diptych">
      <div class="journal-photo journal-photo--detail" role="img" aria-label="Placeholder for an architectural detail"><span>03 / DETAIL</span><b>TEXTURE / LIGHT</b></div>
      <div class="journal-photo journal-photo--street" role="img" aria-label="Placeholder for a street photograph"><span>04 / STREET</span><b>${cities[2] || cities[0]} / AFTER RAIN</b></div>
      <p>Not the landmark—the view beside it. Not the itinerary—the weather that changed it.</p>
    </article>

    <article class="photo-chapter photo-chapter--closing">
      <p class="photo-chapter__coordinates">${place.coordinates}</p>
      <div class="journal-photo journal-photo--panorama" role="img" aria-label="Placeholder for a panoramic closing photograph"><span>05 / DEPARTURE</span><b>${place.country.toUpperCase()} / FIELD NOTES</b></div>
      <blockquote>Some memories return as images. The lasting ones come back as sound, weather and pace.</blockquote>
    </article>
  </section>

  <footer class="country-footer">
    <a href="./world.html?focus=${encodeURIComponent(place.id)}" data-return-label="THE WORLD"><span>Return to</span><b>The world</b></a>
    <a href="./country.html?place=${next.id}" data-country-link><span>Next chapter</span><b>${next.country} ↗</b></a>
  </footer>`;

function setupMotion() {
  if (reduced) {
    document.getElementById('country-entry').remove();
    return;
  }

  if (fromDiscovery) {
    const entryElement = document.getElementById('country-entry');
    gsap.timeline({
      onComplete: () => {
        gsap.set(entryElement, { clipPath: 'circle(0% at 50% 50%)', clearProps: 'opacity,visibility' });
      },
    })
      .fromTo('.country-hero__photo', { scale: 1.025 }, { scale: 1, duration: 1.05, ease: 'power3.out' }, 0)
      .to(entryElement, { autoAlpha: 0, duration: .62, ease: 'power2.inOut' }, .08)
      .from('.country-hero__copy > *', { y: 35, autoAlpha: 0, stagger: .09, duration: .82, ease: 'power3.out' }, .5)
      .from('.country-hero__route', { autoAlpha: 0, duration: .7 }, .66);
  } else {
    gsap.timeline()
      .to('#country-entry', { clipPath: 'circle(0% at 50% 50%)', duration: 1.05, ease: 'power3.inOut' }, .18)
      .from('.country-hero__photo', { scale: 1.12, duration: 1.35, ease: 'power3.out' }, .32)
      .from('.country-hero__copy > *', { y: 45, autoAlpha: 0, stagger: .1, duration: .9, ease: 'power3.out' }, .58)
      .from('.country-hero__route', { autoAlpha: 0, duration: .8 }, .85);
  }

  gsap.to('.country-hero__photo', {
    scale: 1.08,
    yPercent: 7,
    ease: 'none',
    scrollTrigger: { trigger: '.country-hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });

  document.querySelectorAll('.photo-chapter').forEach((chapter) => {
    const photos = chapter.querySelectorAll('.journal-photo');
    gsap.from(photos, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.2,
      stagger: .12,
      ease: 'power3.out',
      scrollTrigger: { trigger: chapter, start: 'top 78%' },
    });
    gsap.from(chapter.querySelectorAll('h2, p, blockquote'), {
      y: 35,
      autoAlpha: 0,
      duration: .95,
      stagger: .08,
      ease: 'power3.out',
      scrollTrigger: { trigger: chapter, start: 'top 72%' },
    });
  });

  document.querySelectorAll('[data-country-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const entry = document.getElementById('country-entry');
      gsap.set(entry, { autoAlpha: 1, clipPath: 'circle(0% at 50% 50%)' });
      entry.querySelector('strong').textContent = next.country;
      entry.querySelector('span').textContent = `DEEP DIVE / ${next.country.toUpperCase()}`;
      gsap.to(entry, { clipPath: 'circle(150% at 50% 50%)', duration: 1, ease: 'power3.inOut', onComplete: () => { window.location.href = link.href; } });
    });
  });
}

function setupReturnNavigation() {
  document.querySelectorAll('[data-return-label]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const entry = document.getElementById('country-entry');
      if (reduced || !entry) {
        window.location.assign(link.href);
        return;
      }
      entry.querySelector('strong').textContent = link.dataset.returnLabel;
      entry.querySelector('span').textContent = 'RETURN TO';
      gsap.set(entry, { autoAlpha: 1 });
      gsap.fromTo(entry,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(150% at 50% 50%)', duration: .85, ease: 'power3.inOut', onComplete: () => window.location.assign(link.href) });
    });
  });
}

initHeaderWave();
initSound();
initLiquidTrail();
setupMotion();
setupReturnNavigation();
requestAnimationFrame(() => ScrollTrigger.refresh());

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  gsap.killTweensOf('#country-entry');
  document.querySelector('#country-entry span').textContent = `DEEP DIVE / ${place.country.toUpperCase()}`;
  document.querySelector('#country-entry strong').textContent = place.country;
  gsap.set('#country-entry', { clipPath: 'circle(0% at 50% 50%)', clearProps: 'opacity,visibility' });
});
