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
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');
let storedHandoff = null;
try {
  const candidate = JSON.parse(sessionStorage.getItem('paz-country-handoff'));
  if (candidate?.id === place.id) storedHandoff = candidate;
} catch { /* storage can be unavailable */ }
const deepDive = place.deepDive || {};
const fallbackHandoff = deepDive.cover || place.memories[7] || place.memories[0];
const handoffPalette = storedHandoff?.palette || fallbackHandoff.palette;
const handoffImage = storedHandoff?.image || fallbackHandoff.src;
const handoffPosition = storedHandoff?.position || fallbackHandoff.position || 'center';
const fallbackStoryMemories = [place.memories[3], place.memories[4], place.memories[10], place.memories[2], place.memories[14]];
const storyPhotos = Array.from({ length: 5 }, (_, photoIndex) => deepDive.photos?.[photoIndex] || fallbackStoryMemories[photoIndex]);

function journalPhoto(photo, modifier, topLabel, bottomLabel, { eager = false } = {}) {
  const extraClass = modifier === 'hero' ? ' country-hero__photo' : '';
  const aspectClass = modifier === 'tile' ? ` journal-photo--tile-${photo?.aspect || 'landscape'}` : '';
  const media = photo?.src
    ? photo.type === 'video'
      ? `<video class="journal-photo__image" src="${photo.src}" poster="${photo.poster || ''}" aria-label="${photo.alt}" muted loop playsinline preload="none" data-story-video style="object-position:${photo.position || 'center'}"></video>`
      : `<img class="journal-photo__image" src="${photo.src}" alt="${photo.alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" style="object-position:${photo.position || 'center'}" />`
    : '';
  const accessibility = photo?.src ? '' : `role="img" aria-label="Photograph placeholder for ${place.country}"`;
  return `<div class="journal-photo journal-photo--${modifier}${extraClass}${aspectClass}" ${accessibility}>
    ${media}<span>${topLabel}</span><b>${bottomLabel}</b>
  </div>`;
}

// A deep dive can supply an authored `deepDive.chapters` arc with stills or
// short films. Countries without one keep the original five-photo fallback.
// Both feed the same four layout kinds below.
const defaultChapters = [
  { kind: 'wide', role: 'OPENING', eyebrow: storyPhotos[0]?.city || cities[0], photo: storyPhotos[0],
    copy: deepDive.opening || 'The first walk without a destination. Light changing on unfamiliar streets; the city beginning to explain itself.' },
  { kind: 'split', role: 'MORNING', eyebrow: `${storyPhotos[1]?.city || cities[1] || cities[0]} · MORNING`, photo: storyPhotos[1],
    title: deepDive.portraitTitle || 'The hour before<br /><em>everything opens.</em>',
    copy: deepDive.portraitCopy || 'Small rituals carry the shape of a place: shutters rising, breakfast behind a curtain, bicycles against old walls.' },
  { kind: 'diptych', detailRole: 'DETAIL', streetRole: 'STREET', detail: storyPhotos[2], street: storyPhotos[3],
    copy: deepDive.diptychCopy || 'Not the landmark—the view beside it. Not the itinerary—the weather that changed it.' },
  { kind: 'closing', role: 'DEPARTURE', photo: storyPhotos[4],
    copy: deepDive.closingCopy || 'Some memories return as images. The lasting ones come back as sound, weather and pace.' },
];
const chapters = deepDive.chapters?.length ? deepDive.chapters : defaultChapters;

let photoPlate = 0;
const plateLabel = (role) => `${String(++photoPlate).padStart(2, '0')} / ${role}`;
const photoSub = (photo, fallback) => {
  const moment = photo?.moment || fallback;
  return photo?.city ? `${photo.city} / ${moment}` : moment;
};

function storyChapter(chapter) {
  switch (chapter.kind) {
    case 'collection':
      return `
    <article class="photo-chapter photo-chapter--collection">
      <header><span>${chapter.eyebrow || chapter.role}</span><time>${chapter.role || place.year}</time></header>
      <div class="photo-collection__intro"><h2>${chapter.title || ''}</h2><p>${chapter.copy || ''}</p></div>
      <div class="photo-collection">
        ${(chapter.media || []).map((photo) => journalPhoto(photo, 'tile', plateLabel(photo.type === 'video' ? 'MOVING IMAGE' : 'PHOTOGRAPH'), photoSub(photo, chapter.role || 'FIELD NOTE'))).join('')}
      </div>
    </article>`;
    case 'split':
      return `
    <article class="photo-chapter photo-chapter--split">
      ${journalPhoto(chapter.photo, 'portrait', plateLabel(chapter.role || 'MORNING'), photoSub(chapter.photo, 'MORNING'))}
      <div class="photo-chapter__text"><span>${chapter.eyebrow || photoSub(chapter.photo, chapter.role || 'MORNING')}</span><h2>${chapter.title || ''}</h2><p>${chapter.copy || ''}</p></div>
    </article>`;
    case 'diptych':
      return `
    <article class="photo-chapter photo-chapter--diptych">
      ${journalPhoto(chapter.detail, 'detail', plateLabel(chapter.detailRole || 'DETAIL'), photoSub(chapter.detail, 'TEXTURE'))}
      ${journalPhoto(chapter.street, 'street', plateLabel(chapter.streetRole || 'STREET'), photoSub(chapter.street, 'AFTER RAIN'))}
      <p>${chapter.copy || ''}</p>
    </article>`;
    case 'closing':
      return `
    <article class="photo-chapter photo-chapter--closing">
      <p class="photo-chapter__coordinates">${chapter.eyebrow || place.coordinates}</p>
      ${journalPhoto(chapter.photo, 'panorama', plateLabel(chapter.role || 'DEPARTURE'), photoSub(chapter.photo, 'FIELD NOTES'))}
      <blockquote>${chapter.copy || ''}</blockquote>
    </article>`;
    default:
      return `
    <article class="photo-chapter photo-chapter--wide">
      <header><span>${chapter.eyebrow || photoSub(chapter.photo, chapter.role || 'OPENING')}</span><time>${chapter.time || place.year}</time></header>
      ${journalPhoto(chapter.photo, 'wide', plateLabel(chapter.role || 'OPENING'), photoSub(chapter.photo, 'BLUE HOUR'))}
      <p>${chapter.copy || ''}</p>
    </article>`;
  }
}

document.title = `${place.country} — World Journal / Phyo Aung Zaw`;
document.body.style.setProperty('--country-accent', accent);
document.body.style.setProperty('--country-warm', warm);
document.body.style.setProperty('--country-cool', cool);
document.documentElement.style.setProperty('--handoff-a', handoffPalette[0]);
document.documentElement.style.setProperty('--handoff-b', handoffPalette[1]);
document.documentElement.style.setProperty('--handoff-c', handoffPalette[2]);
document.documentElement.style.setProperty('--handoff-position', handoffPosition);
if (handoffImage) document.documentElement.style.setProperty('--handoff-image', `url("${handoffImage}")`);
document.getElementById('country-entry-name').textContent = place.country;
document.getElementById('country-entry-label').textContent = place.country.toUpperCase();
document.getElementById('country-header-label').textContent = `${place.country.toUpperCase()} / ${place.year}`;
document.getElementById('country-back-discovery').href = `./world.html?view=discovery&place=${encodeURIComponent(place.id)}`;
document.getElementById('country-back-world').href = `./world.html?focus=${encodeURIComponent(place.id)}`;

const content = document.getElementById('country-content');
content.innerHTML = `
  <section class="country-hero">
    ${journalPhoto(fallbackHandoff, 'hero', 'PHOTOGRAPH / COVER', `${fallbackHandoff.city || cities[0]} · ${fallbackHandoff.moment || 'ARRIVAL'}`, { eager: true })}
    <div class="country-hero__copy">
      <span>${String(index + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}</span>
      <h1>${place.country}</h1>
      <p>${place.year}</p>
    </div>
    <div class="country-hero__route"><span>${place.coordinates}</span><b>${place.cities}</b></div>
  </section>

  <section class="country-intro">
    <p class="country-intro__label">A PERSONAL FIELD NOTE</p>
    <blockquote>“${deepDive.intro || place.note}”</blockquote>
    <dl style="--country-stat-count:${place.videos ? 5 : 4}">
      <div><dt>CHAPTER</dt><dd>${String(index + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}</dd></div>
      <div><dt>PHOTOGRAPHS</dt><dd>${String(place.photos).padStart(2, '0')}</dd></div>
      ${place.videos ? `<div><dt>SHORT FILMS</dt><dd>${String(place.videos).padStart(2, '0')}</dd></div>` : ''}
      <div><dt>STORIES</dt><dd>${String(place.stories).padStart(2, '0')}</dd></div>
      <div><dt>COORDINATES</dt><dd>${place.coordinates}</dd></div>
    </dl>
  </section>

  <section class="photo-story">
    ${chapters.map(storyChapter).join('')}
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
    // Photos settle in with a soft fade and a gentle scale — no upward wipe.
    if (chapter.classList.contains('photo-chapter--collection')) {
      photos.forEach((photo) => gsap.from(photo, {
        autoAlpha: 0,
        scale: .96,
        duration: 1.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: photo, start: 'top 86%', once: true },
      }));
    } else {
      gsap.from(photos, {
        autoAlpha: 0,
        scale: .96,
        duration: 1.2,
        stagger: .12,
        ease: 'power2.out',
        scrollTrigger: { trigger: chapter, start: 'top 78%' },
      });
    }
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

function setupStoryMedia() {
  const videos = [...document.querySelectorAll('video[data-story-video]')];
  if (reduced || !videos.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, { rootMargin: '15% 0px', threshold: .18 });
  videos.forEach((video) => observer.observe(video));
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
setupStoryMedia();
setupReturnNavigation();
requestAnimationFrame(() => ScrollTrigger.refresh());

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  gsap.killTweensOf('#country-entry');
  document.querySelector('#country-entry span').textContent = `DEEP DIVE / ${place.country.toUpperCase()}`;
  document.querySelector('#country-entry strong').textContent = place.country;
  gsap.set('#country-entry', { clipPath: 'circle(0% at 50% 50%)', clearProps: 'opacity,visibility' });
});
