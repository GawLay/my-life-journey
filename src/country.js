import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { places } from './data/places.js';
import { initSound } from './modules/sound.js';
import { initLiquidWarp } from './modules/liquidWarp.js';
import { initHeaderWave } from './modules/headerWave.js';

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(window.location.search);
const place = places.find((item) => item.id === params.get('place')) || places.find((item) => item.id === 'vietnam') || places[0];
const fromDiscovery = params.get('from') === 'discovery';
const chapterEntering = document.documentElement.classList.contains('is-chapter-entry');
const index = places.findIndex((item) => item.id === place.id);
const next = places[(index + 1) % places.length];
const cities = place.cities.split(' / ').map((city) => city.trim());
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
    copy: deepDive.diptychCopy || 'Not the landmark, the view beside it. Not the itinerary, the weather that changed it.' },
  { kind: 'closing', role: 'DEPARTURE', photo: storyPhotos[4],
    copy: deepDive.closingCopy || 'Some memories return as images. The lasting ones come back as sound, weather and pace.' },
];
const chapters = deepDive.chapters?.length ? deepDive.chapters : defaultChapters;

let photoPlate = 0;
let chapterTransitioning = false;
const plateLabel = (role) => `${String(++photoPlate).padStart(2, '0')} / ${role}`;
const photoSub = (photo, fallback) => {
  const moment = photo?.moment || fallback;
  return photo?.city ? `${photo.city} / ${moment}` : moment;
};

function storyCopy(chapter) {
  const paragraphs = chapter.paragraphs || (chapter.copy ? [chapter.copy] : []);
  return `<div class="story-copy">${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>`;
}

function storyNote(chapter) {
  return `<div class="photo-chapter__note">${chapter.quote ? `<blockquote>${chapter.quote}</blockquote>` : ''}${storyCopy(chapter)}</div>`;
}

function storyChapter(chapter) {
  switch (chapter.kind) {
    case 'collection':
      return `
    <article class="photo-chapter photo-chapter--collection">
      <header><span>${chapter.eyebrow || chapter.role}</span><time>${chapter.role || place.year}</time></header>
      <div class="photo-collection__intro"><h2>${chapter.title || ''}</h2>${storyCopy(chapter)}</div>
      <div class="photo-collection">
        ${(chapter.media || []).map((photo) => journalPhoto(photo, 'tile', plateLabel(photo.type === 'video' ? 'MOVING IMAGE' : 'PHOTOGRAPH'), photoSub(photo, chapter.role || 'FIELD NOTE'))).join('')}
      </div>
    </article>`;
    case 'split':
      return `
    <article class="photo-chapter photo-chapter--split">
      ${journalPhoto(chapter.photo, 'portrait', plateLabel(chapter.role || 'MORNING'), photoSub(chapter.photo, 'MORNING'))}
      <div class="photo-chapter__text"><span>${chapter.eyebrow || photoSub(chapter.photo, chapter.role || 'MORNING')}</span><h2>${chapter.title || ''}</h2>${storyCopy(chapter)}</div>
    </article>`;
    case 'diptych':
      return `
    <article class="photo-chapter photo-chapter--diptych">
      ${journalPhoto(chapter.detail, 'detail', plateLabel(chapter.detailRole || 'DETAIL'), photoSub(chapter.detail, 'TEXTURE'))}
      ${journalPhoto(chapter.street, 'street', plateLabel(chapter.streetRole || 'STREET'), photoSub(chapter.street, 'AFTER RAIN'))}
      ${storyNote(chapter)}
    </article>`;
    case 'closing':
      return `
    <article class="photo-chapter photo-chapter--closing">
      <p class="photo-chapter__coordinates">${chapter.eyebrow || place.coordinates}</p>
      ${journalPhoto(chapter.photo, 'panorama', plateLabel(chapter.role || 'DEPARTURE'), photoSub(chapter.photo, 'FIELD NOTES'))}
      ${storyNote(chapter)}
    </article>`;
    default:
      return `
    <article class="photo-chapter photo-chapter--wide">
      <header><span>${chapter.eyebrow || photoSub(chapter.photo, chapter.role || 'OPENING')}</span><time>${chapter.time || place.year}</time></header>
      ${journalPhoto(chapter.photo, 'wide', plateLabel(chapter.role || 'OPENING'), photoSub(chapter.photo, 'BLUE HOUR'))}
      ${storyCopy(chapter)}
    </article>`;
  }
}

document.title = `${place.country} · World Journal / My Life Journey`;
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
    <div class="country-intro__text">
      <blockquote>“${deepDive.intro || place.note}”</blockquote>
      ${(deepDive.introParagraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join('')}
    </div>
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
    const entryName = document.getElementById('country-entry-name');
    const heroTitle = document.querySelector('.country-hero__copy h1');
    const start = entryName.getBoundingClientRect();
    const end = heroTitle.getBoundingClientRect();
    const startType = getComputedStyle(entryName);
    const endType = getComputedStyle(heroTitle);
    const sharedTitle = entryName.cloneNode(true);
    sharedTitle.removeAttribute('id');
    sharedTitle.className = 'country-shared-title';
    sharedTitle.setAttribute('aria-hidden', 'true');
    document.body.appendChild(sharedTitle);
    gsap.set(entryElement, { clipPath: 'inset(0)' });
    gsap.set(sharedTitle, {
      autoRound: false,
      left: start.left, top: start.top, width: start.width, height: start.height,
      fontFamily: startType.fontFamily, fontSize: startType.fontSize,
      fontWeight: startType.fontWeight, lineHeight: startType.lineHeight,
      letterSpacing: startType.letterSpacing, textAlign: endType.textAlign,
    });
    gsap.set(entryName, { autoAlpha: 0 });
    gsap.set(heroTitle, { opacity: 0 });
    gsap.timeline({
      onComplete: () => {
        gsap.set(heroTitle, { clearProps: 'opacity' });
        sharedTitle.remove();
        gsap.set(entryElement, { autoAlpha: 0, scale: 1, filter: 'none', clipPath: 'inset(0)' });
      },
    })
      .fromTo('.country-hero__photo', { scale: 1.08, filter: 'blur(8px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.08, ease: 'power3.out' }, 0)
      .to(entryElement, { autoAlpha: 0, scale: .97, filter: 'blur(8px)', duration: .62, ease: 'power2.inOut' }, .08)
      .to(sharedTitle, {
        autoRound: false,
        left: end.left, top: end.top, width: end.width, height: end.height,
        fontSize: endType.fontSize, lineHeight: endType.lineHeight,
        letterSpacing: endType.letterSpacing,
        duration: 1.08, ease: 'power3.inOut',
      }, .18)
      .from('.country-hero__copy > span, .country-hero__copy > p', { y: 35, autoAlpha: 0, stagger: .09, duration: .82, ease: 'power3.out' }, .5)
      .from('.country-hero__route', { autoAlpha: 0, duration: .7 }, .66);
  } else {
    // A Next Chapter hand-off arrives with its title already visible. Ordinary
    // visits introduce the name before the same charcoal cover irises open.
    const entrance = gsap.timeline();
    if (!chapterEntering) {
      entrance
        .from('#country-entry span', { autoAlpha: 0, y: 12, duration: .7, ease: 'power3.out' }, 0)
        .from('#country-entry strong', { autoAlpha: 0, scale: .9, duration: 1, ease: 'power3.out' }, .05);
    }
    const revealAt = chapterEntering ? 0 : .95;
    entrance
      .to('#country-entry', { clipPath: 'circle(0% at 50% 50%)', duration: 1.05, ease: 'power3.inOut' }, revealAt)
      .from('.country-hero__photo', { scale: 1.12, duration: 1.35, ease: 'power3.out' }, revealAt + .15)
      .from('.country-hero__copy > *', { y: 45, autoAlpha: 0, stagger: .1, duration: .9, ease: 'power3.out' }, revealAt + .4)
      .from('.country-hero__route', { autoAlpha: 0, duration: .8 }, revealAt + .65);
  }

  // Ease the fixed top bar in as the cover clears, rather than letting it snap to
  // full opacity while the rest of the hero is still settling.
  gsap.from('.country-header', {
    autoAlpha: 0,
    y: -18,
    duration: .9,
    ease: 'power3.out',
    delay: fromDiscovery ? .55 : chapterEntering ? .2 : 1.15,
  });

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
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (chapterTransitioning) return;
      chapterTransitioning = true;
      const target = new URL(link.href);
      try {
        sessionStorage.setItem('paz-chapter-entry', JSON.stringify({
          target: target.pathname + target.search,
          country: next.country,
        }));
      } catch { /* navigation still works without storage */ }
      const entry = document.getElementById('country-entry');
      // Match the arriving page's charcoal cover, even after a photo hand-off.
      entry.classList.remove('is-earth-return');
      entry.style.background = 'var(--charcoal)';
      gsap.set(entry, { autoAlpha: 1, scale: 1, filter: 'none', clipPath: 'circle(0% at 50% 50%)' });
      entry.querySelector('strong').textContent = next.country;
      entry.querySelector('span').textContent = `DEEP DIVE / ${next.country.toUpperCase()}`;
      gsap.set(entry.querySelectorAll('span, strong'), { autoAlpha: 1, y: 0, scale: 1 });
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
      const returningToDiscovery = link.href.includes('view=discovery');
      // Returning to the discovery view: hand the same photo cover (palette + photo)
      // to world.html so it paints a matching cover before first paint. The incoming
      // globe then pulls back from the surface to reverse the forward camera move.
      if (returningToDiscovery) {
        try {
          sessionStorage.setItem('paz-country-handoff', JSON.stringify({
            id: place.id,
            country: place.country,
            palette: handoffPalette,
            image: handoffImage || '',
            position: handoffPosition,
            direction: 'return',
          }));
        } catch { /* storage can be unavailable */ }
        entry.classList.add('is-earth-return');
        entry.querySelector('strong').textContent = 'DISCOVERY';
        entry.querySelector('span').textContent = 'RETURN TO';
        gsap.set(entry.querySelectorAll('span, strong'), { autoAlpha: 1, y: 0 });
        gsap.timeline({ onComplete: () => window.location.assign(link.href) })
          .to('.country-header', { autoAlpha: 0, y: -16, duration: .4, ease: 'power2.out' }, 0)
          .fromTo(entry,
            { autoAlpha: 0, scale: 1.08, filter: 'blur(8px)' },
            { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .78, ease: 'power3.out' }, .06);
        return;
      }
      entry.classList.remove('is-earth-return');
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
initLiquidWarp();
if (chapterEntering && !reduced) {
  const cover = document.querySelector('.country-hero__photo img');
  Promise.all([document.fonts.ready, cover?.decode().catch(() => {})]).then(setupMotion);
} else if (fromDiscovery && !reduced) document.fonts.ready.then(setupMotion);
else setupMotion();
setupStoryMedia();
setupReturnNavigation();
requestAnimationFrame(() => ScrollTrigger.refresh());

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  chapterTransitioning = false;
  gsap.killTweensOf('#country-entry');
  const entry = document.querySelector('#country-entry');
  if (!entry) return;
  entry.classList.remove('is-earth-return');
  entry.style.background = '';
  entry.querySelector('span').textContent = `DEEP DIVE / ${place.country.toUpperCase()}`;
  entry.querySelector('strong').textContent = place.country;
  gsap.set(entry, {
    autoAlpha: 0,
    scale: 1,
    filter: 'none',
    clipPath: fromDiscovery ? 'inset(0)' : 'circle(0% at 50% 50%)',
  });
  gsap.set('.country-header', { clearProps: 'opacity,visibility,transform' });
});
