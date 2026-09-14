import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Globe from './gl/Globe.js';
import { places } from './data/places.js';
import { initLiquidTrail } from './modules/liquidTrail.js';
import { initHeaderWave } from './modules/headerWave.js';

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(window.location.search);
const place = places.find((item) => item.id === params.get('place')) || places.find((item) => item.id === 'vietnam') || places[0];
const placeIndex = places.findIndex((item) => item.id === place.id);
const fromWorld = params.get('from') === 'world';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileLayout = window.matchMedia('(max-width: 900px)').matches;
const content = document.getElementById('discovery-content');
const entry = document.getElementById('discovery-entry');
const viewer = document.getElementById('memory-viewer');

const orbitLayouts = [
  { x: '-3vw', y: '20vh', w: '24vw', r: '-2deg', d: -.28, z: 6 },
  { x: '76vw', y: '15vh', w: '24vw', r: '2deg', d: -.14, z: 5 },
  { x: '7vw', y: '68vh', w: '18vw', r: '2.5deg', d: .18, z: 7 },
  { x: '40vw', y: '7vh', w: '20vw', r: '.6deg', d: -.08, z: 1 },
  { x: '65vw', y: '67vh', w: '25vw', r: '-1.4deg', d: .24, z: 7 },
  { x: '88vw', y: '73vh', w: '16vw', r: '2deg', d: .34, z: 4 },
  { x: '34vw', y: '76vh', w: '21vw', r: '-1deg', d: .12, z: 6 },
];

const featureLayouts = [
  { x: '23vw', y: '23vh', w: '54vw', r: '-.6deg', d: -.08, z: 2, feature: true },
  { x: '3vw', y: '8vh', w: '20vw', r: '-2.4deg', d: .2, z: 4 },
  { x: '74vw', y: '4vh', w: '20vw', r: '2.2deg', d: -.18, z: 1 },
  { x: '5vw', y: '85vh', w: '24vw', r: '1.3deg', d: .28, z: 4 },
];

const archiveLayouts = [
  { x: '6vw', y: '18vh', w: '31vw', r: '-1.4deg', d: -.15, z: 2 },
  { x: '61vw', y: '8vh', w: '19vw', r: '2.1deg', d: .18, z: 4 },
  { x: '69vw', y: '74vh', w: '28vw', r: '-1.1deg', d: -.22, z: 2 },
  { x: '23vw', y: '98vh', w: '23vw', r: '1.8deg', d: .3, z: 4 },
];

function photoSurface(memory) {
  if (memory.src) {
    return `<img class="memory-photo__surface" src="${memory.src}" alt="${memory.alt}" loading="lazy" decoding="async" />`;
  }
  return '<span class="memory-photo__surface memory-photo__placeholder" aria-hidden="true"></span>';
}

function photoMarkup(memory, layout, scene) {
  const [colorA, colorB, colorC] = memory.palette;
  const classes = [
    'memory-photo',
    `memory-photo--${memory.aspect}`,
    layout.feature ? 'memory-photo--feature' : '',
  ].filter(Boolean).join(' ');
  return `
    <button class="${classes}" type="button" data-memory="${memory.id}" data-depth="${layout.d}" data-scene="${scene}"
      aria-label="View ${memory.city}, ${memory.moment}"
      style="--photo-left:${layout.x};--photo-top:${layout.y};--photo-width:${layout.w};--photo-rotation:${layout.r};--photo-z:${layout.z};--photo-a:${colorA};--photo-b:${colorB};--photo-c:${colorC}">
      <figure class="memory-photo__frame">
        ${photoSurface(memory)}
        <figcaption><span>${String(memory.index).padStart(2, '0')}</span><b>${memory.city}<i>${memory.moment}</i></b></figcaption>
        <em aria-hidden="true">VIEW</em>
      </figure>
    </button>`;
}

function renderScene(memories, layouts, scene) {
  return memories.map((memory, index) => photoMarkup(memory, layouts[index], scene)).join('');
}

const orbitMemories = place.memories.slice(0, orbitLayouts.length);
const featureMemories = place.memories.slice(orbitLayouts.length, orbitLayouts.length + featureLayouts.length);
const archiveMemories = place.memories.slice(orbitLayouts.length + featureLayouts.length, orbitLayouts.length + featureLayouts.length + archiveLayouts.length);
const cityList = place.cities.split(' / ').map((city) => city.trim());

document.title = `${place.country} Discovery · Explore My World / Phyo Aung Zaw`;
document.body.style.setProperty('--discovery-accent', place.memories[0].palette[2]);
document.body.style.setProperty('--discovery-warm', place.memories[1].palette[1]);
document.body.style.setProperty('--discovery-cool', place.memories[2].palette[0]);
document.getElementById('discovery-entry-name').textContent = place.country;
document.getElementById('discovery-entry-index').textContent = `${String(placeIndex + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}`;
document.getElementById('discovery-header-label').textContent = `${place.country.toUpperCase()} / DISCOVERY`;
document.getElementById('discovery-back').href = `./world.html?focus=${encodeURIComponent(place.id)}`;
document.getElementById('discovery-deep-link').href = `./country.html?place=${encodeURIComponent(place.id)}&from=discovery`;
document.getElementById('discovery-deep-link').querySelector('[data-wave]').textContent = `${place.country} / Deep dive ↗`;

content.innerHTML = `
  <section class="discovery-hero" aria-labelledby="discovery-title">
    <div class="discovery-hero__sticky">
      <div class="discovery-globe discovery-globe--hero" id="discovery-globe" role="application" aria-label="Highlighted globe focused on ${place.country}"></div>
      <div class="discovery-hero__title">
        <span>${String(placeIndex + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}</span>
        <h1 id="discovery-title">${place.country}</h1>
        <p>${place.year}</p>
      </div>
      <div class="discovery-hero__meta">
        <span>${place.cities}</span>
        <b>${String(place.photos).padStart(2, '0')} PHOTOS&nbsp;&nbsp;&nbsp;${String(place.stories).padStart(2, '0')} STORIES</b>
      </div>
      <div class="discovery-orbit" aria-label="First memories from ${place.country}">
        ${renderScene(orbitMemories, orbitLayouts, 'orbit')}
      </div>
      <p class="discovery-scroll"><span>SCROLL THROUGH THE MEMORY</span><i></i></p>
    </div>
  </section>

  <section class="memory-scene memory-scene--feature" aria-labelledby="feature-scene-title">
    <header class="memory-scene__heading">
      <span>SCENE 02 / THE PACE OF A PLACE</span>
      <h2 id="feature-scene-title">What did it<br /><em>feel like?</em></h2>
      <p>${place.note}</p>
    </header>
    <div class="memory-scene__canvas">
      ${renderScene(featureMemories, featureLayouts, 'feature')}
      <p class="memory-scene__aside">${place.coordinates}<br />${cityList.join(' · ')}</p>
    </div>
  </section>

  <section class="memory-scene memory-scene--archive" aria-labelledby="archive-scene-title">
    <div class="memory-scene__watermark" aria-hidden="true">${place.country}</div>
    <header class="memory-scene__heading">
      <span>SCENE 03 / SMALL EVIDENCE</span>
      <h2 id="archive-scene-title">A place returns<br /><em>in fragments.</em></h2>
      <p>Light, weather, movement: the images that stay after the itinerary disappears.</p>
    </header>
    <div class="memory-scene__canvas memory-scene__canvas--archive">
      ${renderScene(archiveMemories, archiveLayouts, 'archive')}
    </div>
  </section>

  <section class="discovery-finale" aria-labelledby="deep-dive-title">
    <div class="discovery-finale__globe" id="discovery-globe-return" aria-hidden="true"></div>
    <div class="discovery-finale__copy">
      <span>READY TO GO DEEPER?</span>
      <h2 id="deep-dive-title">${place.country}</h2>
      <p>A STORY IN ${String(place.stories).padStart(2, '0')} CHAPTERS</p>
      <a class="deep-dive-link" href="./country.html?place=${encodeURIComponent(place.id)}&from=discovery">
        <small>ENTER THE FULL FIELD NOTE</small>
        <strong>Deep dive <i>↗</i></strong>
      </a>
      <a class="discovery-finale__back" href="./world.html?focus=${encodeURIComponent(place.id)}">← BACK TO WORLD</a>
    </div>
  </section>`;

initHeaderWave();
initLiquidTrail({ dark: true });

const globeMount = document.getElementById('discovery-globe');
const returnMount = document.getElementById('discovery-globe-return');
const primaryGlobe = new Globe(globeMount, { places, reduced, autoRotate: false });
const returnGlobe = new Globe(returnMount, { places, reduced, autoRotate: false });
let returnGlobeVisible = false;

// The World page already performs the country-focus rotation. When this page
// is the next step in that flow, begin at the final orientation immediately so
// the same globe appears to carry across the navigation instead of turning twice.
if (fromWorld) primaryGlobe.focus(place.id, { immediate: true });
else primaryGlobe.ready.then(() => primaryGlobe.focus(place.id));
returnGlobe.focus(place.id, { immediate: true });

if (!reduced) {
  gsap.ticker.add(() => {
    primaryGlobe.render();
    if (returnGlobeVisible) returnGlobe.render();
  });
  const returnObserver = new IntersectionObserver(([entryState]) => {
    returnGlobeVisible = entryState.isIntersecting;
  }, { rootMargin: '25%' });
  returnObserver.observe(returnMount);
} else {
  Promise.all([primaryGlobe.ready, returnGlobe.ready]).then(() => {
    primaryGlobe.render();
    returnGlobe.render();
  });
}

function setupMotion() {
  if (reduced) {
    entry.remove();
    return;
  }

  if (fromWorld) {
    gsap.timeline({ onComplete: () => document.documentElement.classList.remove('from-world') })
      .set(globeMount, { scale: 1, autoAlpha: 1 }, 0)
      .to(entry, { autoAlpha: 0, duration: .24, ease: 'power2.out', onComplete: () => entry.remove() }, .05)
      .to('.discovery-hero__title', { opacity: 1, duration: .28, ease: 'power2.out' }, .22)
      .to('.discovery-header', { opacity: 1, duration: .55, ease: 'power2.out' }, .18)
      .to('.discovery-hero__meta', { opacity: 1, duration: .55, ease: 'power2.out' }, .28)
      .to('.discovery-orbit .memory-photo', { opacity: 1, stagger: .055, duration: .62, ease: 'power3.out' }, .25)
      .to('.discovery-scroll', { opacity: 1, duration: .5, ease: 'power2.out' }, .55);
  } else {
    gsap.timeline()
      .to(entry, { clipPath: 'circle(0% at 50% 50%)', duration: .85, ease: 'power3.inOut' }, .12)
      .from(globeMount, { scale: 1.18, autoAlpha: 0, duration: 1.1, ease: 'power3.out' }, .28)
      .from('.discovery-hero__title > *', { y: 38, autoAlpha: 0, stagger: .09, duration: .85, ease: 'power3.out' }, .5)
      .from('.discovery-hero__meta', { y: 20, autoAlpha: 0, duration: .8, ease: 'power3.out' }, .68)
      .from('.discovery-orbit .memory-photo', { scale: .88, autoAlpha: 0, stagger: .07, duration: .8, ease: 'power3.out' }, .66);
  }

  if (!mobileLayout) {
    gsap.timeline({
      scrollTrigger: { trigger: '.discovery-hero', start: 'top top', end: 'bottom bottom', scrub: 1.1 },
    })
      .to(globeMount, { xPercent: -17, scale: .82, opacity: .72, ease: 'none' }, 0)
      .to('.discovery-hero__title', { xPercent: -7, yPercent: -28, opacity: .34, ease: 'none' }, 0)
      .to('.discovery-hero__meta', { yPercent: 35, opacity: .28, ease: 'none' }, 0)
      .to('.discovery-scroll', { opacity: 0, ease: 'none' }, 0);
  }

  document.querySelectorAll('.memory-photo').forEach((photo) => {
    const depth = Number(photo.dataset.depth || 0);
    const scene = photo.closest('.memory-scene');
    if (scene) {
      gsap.from(photo, {
        autoAlpha: 0,
        y: 55,
        scale: .95,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: photo, start: 'top 88%', once: true },
      });
      gsap.fromTo(photo,
        { yPercent: depth * -24 },
        { yPercent: depth * 24, ease: 'none', scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    } else if (!mobileLayout) {
      gsap.to(photo, {
        yPercent: depth * 40,
        ease: 'none',
        scrollTrigger: { trigger: '.discovery-hero', start: 'top top', end: 'bottom bottom', scrub: 1.2 },
      });
    }
  });

  document.querySelectorAll('.memory-scene__heading').forEach((heading) => {
    gsap.from(heading.children, {
      y: 42,
      autoAlpha: 0,
      stagger: .1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 76%', once: true },
    });
  });

  gsap.from('.discovery-finale__copy > *', {
    y: 45,
    autoAlpha: 0,
    stagger: .11,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.discovery-finale', start: 'top 58%', once: true },
  });
  gsap.from(returnMount, {
    scale: .7,
    autoAlpha: 0,
    duration: 1.4,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.discovery-finale', start: 'top 62%', once: true },
  });
}

function openViewer(memory) {
  const [colorA, colorB, colorC] = memory.palette;
  const surface = document.getElementById('memory-viewer-surface');
  surface.style.setProperty('--photo-a', colorA);
  surface.style.setProperty('--photo-b', colorB);
  surface.style.setProperty('--photo-c', colorC);
  surface.style.backgroundImage = memory.src
    ? `url("${memory.src}")`
    : 'linear-gradient(135deg, var(--photo-a), var(--photo-b) 52%, var(--photo-c))';
  document.getElementById('memory-viewer-index').textContent = String(memory.index).padStart(2, '0');
  document.getElementById('memory-viewer-title').textContent = memory.city;
  document.getElementById('memory-viewer-note').textContent = memory.moment;
  viewer.hidden = false;
  document.body.classList.add('has-memory-open');
  if (!reduced) gsap.fromTo(viewer, { autoAlpha: 0 }, { autoAlpha: 1, duration: .45, ease: 'power2.out' });
  viewer.querySelector('.memory-viewer__close').focus();
}

function closeViewer() {
  const finish = () => {
    viewer.hidden = true;
    document.body.classList.remove('has-memory-open');
  };
  if (reduced) finish();
  else gsap.to(viewer, { autoAlpha: 0, duration: .35, ease: 'power2.in', onComplete: finish });
}

document.addEventListener('click', (event) => {
  const photo = event.target.closest('[data-memory]');
  if (photo) {
    const memory = place.memories.find((item) => item.id === photo.dataset.memory);
    if (memory) openViewer(memory);
  }
});
viewer.querySelector('.memory-viewer__close').addEventListener('click', closeViewer);
viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !viewer.hidden) closeViewer(); });

function transitionToWorld(link) {
  if (reduced) {
    window.location.assign(link.href);
    return;
  }
  entry.querySelector('strong').textContent = 'THE WORLD';
  entry.querySelector('span').textContent = `${String(placeIndex + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}`;
  gsap.fromTo(entry,
    { clipPath: 'circle(0% at 50% 50%)' },
    { clipPath: 'circle(150% at 50% 50%)', duration: .85, ease: 'power3.inOut', onComplete: () => window.location.assign(link.href) });
}

document.querySelectorAll('a[href*="world.html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    transitionToWorld(link);
  });
});

let storyTransitioning = false;

function visiblePhotoSource() {
  const viewportCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  return [...document.querySelectorAll('.memory-photo')]
    .map((photo) => ({ photo, rect: photo.getBoundingClientRect() }))
    .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth)
    .sort((a, b) => {
      const distanceA = Math.hypot(a.rect.left + a.rect.width / 2 - viewportCenter.x, a.rect.top + a.rect.height / 2 - viewportCenter.y);
      const distanceB = Math.hypot(b.rect.left + b.rect.width / 2 - viewportCenter.x, b.rect.top + b.rect.height / 2 - viewportCenter.y);
      return distanceA - distanceB;
    })[0];
}

function transitionToStory(link) {
  if (storyTransitioning) return;
  storyTransitioning = true;
  if (reduced) {
    window.location.assign(link.href);
    return;
  }

  const visibleSource = visiblePhotoSource();
  const sourcePhoto = visibleSource?.photo;
  const sourceFrame = visibleSource?.rect || link.getBoundingClientRect();
  const sourceMemory = place.memories.find((memory) => memory.id === sourcePhoto?.dataset.memory)
    || featureMemories[0]
    || place.memories[0];
  const [colorA, colorB, colorC] = sourceMemory.palette;
  try {
    sessionStorage.setItem('paz-country-handoff', JSON.stringify({
      id: place.id,
      country: place.country,
      palette: sourceMemory.palette,
      image: sourceMemory.src || '',
    }));
  } catch { /* storage can be unavailable */ }

  const transition = document.createElement('div');
  transition.className = 'deep-dive-transition';
  transition.innerHTML = `<span>DEEP DIVE / ${place.country.toUpperCase()}</span><strong>${place.country}</strong>`;
  transition.style.setProperty('--transition-image', sourceMemory.src
    ? `url("${sourceMemory.src}")`
    : `linear-gradient(135deg, ${colorA}, ${colorB} 52%, ${colorC})`);
  document.body.appendChild(transition);
  gsap.set(transition, {
    left: sourceFrame.left,
    top: sourceFrame.top,
    width: Math.max(sourceFrame.width, 2),
    height: Math.max(sourceFrame.height, 2),
    borderRadius: 2,
  });
  gsap.set(transition.children, { autoAlpha: 0, y: 16 });
  gsap.timeline({ onComplete: () => window.location.assign(link.href) })
    .to(['.discovery-header', '.discovery-finale__copy', '.discovery-hero__title', '.discovery-hero__meta'], {
      autoAlpha: 0,
      duration: .36,
      ease: 'power2.out',
    }, 0)
    .to(transition, {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: .82,
      ease: 'power3.inOut',
    }, 0)
    .to(transition.children, { autoAlpha: 1, y: 0, stagger: .06, duration: .42, ease: 'power3.out' }, .4);
}

document.querySelectorAll('a[href*="country.html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    transitionToStory(link);
  });
});

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  storyTransitioning = false;
  document.querySelectorAll('.deep-dive-transition').forEach((transition) => transition.remove());
  gsap.set(entry, { clipPath: 'circle(0% at 50% 50%)' });
  document.body.classList.remove('has-memory-open');
  viewer.hidden = true;
});

setupMotion();
requestAnimationFrame(() => ScrollTrigger.refresh());
