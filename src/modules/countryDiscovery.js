import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setWaveText } from './headerWave.js';

gsap.registerPlugin(ScrollTrigger);

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
  const classes = ['memory-photo', `memory-photo--${memory.aspect}`, layout.feature ? 'memory-photo--feature' : ''].filter(Boolean).join(' ');
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

function updateWave(element, label) {
  if (!element) return;
  element.removeAttribute('aria-label');
  setWaveText(element, label);
}

export function initCountryDiscovery({ globe, globeMount, places, reduced = false }) {
  const root = document.getElementById('country-discovery');
  const content = document.getElementById('country-discovery-content');
  const header = document.getElementById('world-discovery-header');
  const backButton = document.getElementById('discovery-back');
  const headerLabel = document.getElementById('discovery-header-label');
  const deepHeaderLink = document.getElementById('discovery-deep-link');
  const viewer = document.getElementById('memory-viewer');
  const worldTargets = document.querySelectorAll('.world-header, .world__intro, .world-memory, .world__countries, .world__instruction');
  const mobileLayout = window.matchMedia('(max-width: 900px)').matches;
  const discoveryScale = window.matchMedia('(max-width: 800px)').matches ? 1.07 : 1.22;
  let viewMode = 'world';
  let selectedPlace = null;
  let changing = false;
  let storyTransitioning = false;
  let sceneAnimations = [];

  function killSceneAnimations() {
    sceneAnimations.forEach((animation) => {
      animation.scrollTrigger?.kill();
      animation.kill?.();
    });
    sceneAnimations = [];
  }

  function renderCountry(place) {
    const placeIndex = places.findIndex((item) => item.id === place.id);
    const orbitMemories = place.memories.slice(0, orbitLayouts.length);
    const featureMemories = place.memories.slice(orbitLayouts.length, orbitLayouts.length + featureLayouts.length);
    const archiveMemories = place.memories.slice(orbitLayouts.length + featureLayouts.length, orbitLayouts.length + featureLayouts.length + archiveLayouts.length);
    const cityList = place.cities.split(' / ').map((city) => city.trim());

    document.body.style.setProperty('--discovery-accent', place.memories[0].palette[2]);
    document.body.style.setProperty('--discovery-warm', place.memories[1].palette[1]);
    document.body.style.setProperty('--discovery-cool', place.memories[2].palette[0]);
    headerLabel.dataset.waveReady = '';
    deepHeaderLink.querySelector('[data-wave]').dataset.waveReady = '';
    updateWave(headerLabel, `${place.country.toUpperCase()} / DISCOVERY`);
    updateWave(deepHeaderLink.querySelector('[data-wave]'), `${place.country} / Deep dive ↗`);
    deepHeaderLink.href = `./country.html?place=${encodeURIComponent(place.id)}&from=discovery`;

    content.innerHTML = `
      <section class="discovery-hero" aria-labelledby="discovery-title">
        <div class="discovery-hero__sticky">
          <div class="shared-globe-hero-spacer" aria-hidden="true"></div>
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
          <p class="memory-scene__aside">${place.coordinates}<br />${cityList.join(' — ')}</p>
        </div>
      </section>

      <section class="memory-scene memory-scene--archive" aria-labelledby="archive-scene-title">
        <div class="memory-scene__watermark" aria-hidden="true">${place.country}</div>
        <header class="memory-scene__heading">
          <span>SCENE 03 / SMALL EVIDENCE</span>
          <h2 id="archive-scene-title">A place returns<br /><em>in fragments.</em></h2>
          <p>Light, weather, movement—the images that stay after the itinerary disappears.</p>
        </header>
        <div class="memory-scene__canvas memory-scene__canvas--archive">
          ${renderScene(archiveMemories, archiveLayouts, 'archive')}
        </div>
      </section>

      <section class="discovery-finale" aria-labelledby="deep-dive-title">
        <div class="shared-globe-spacer" aria-hidden="true"></div>
        <div class="discovery-finale__copy">
          <span>READY TO GO DEEPER?</span>
          <h2 id="deep-dive-title">${place.country}</h2>
          <p>A STORY IN ${String(place.stories).padStart(2, '0')} CHAPTERS</p>
          <a class="deep-dive-link" href="./country.html?place=${encodeURIComponent(place.id)}&from=discovery">
            <small>ENTER THE FULL FIELD NOTE</small>
            <strong>Deep dive <i>↗</i></strong>
          </a>
          <button class="discovery-finale__back" type="button" data-back-world>← BACK TO WORLD</button>
        </div>
      </section>`;

    return { orbitMemories, featureMemories, archiveMemories };
  }

  function setupScrollMotion() {
    killSceneAnimations();
    if (reduced) return;

    if (!mobileLayout) {
      const heroGlobe = gsap.timeline({
        scrollTrigger: { trigger: '.country-discovery .discovery-hero', start: 'top top', end: 'bottom bottom', scrub: 1.1 },
      })
        .to(globeMount, { xPercent: -17, scale: .98, opacity: .72, ease: 'none' }, 0)
        .to('.country-discovery .discovery-hero__title', { xPercent: -7, yPercent: -28, opacity: .34, ease: 'none' }, 0)
        .to('.country-discovery .discovery-hero__meta', { yPercent: 35, opacity: .28, ease: 'none' }, 0)
        .to('.country-discovery .discovery-scroll', { opacity: 0, ease: 'none' }, 0);
      sceneAnimations.push(heroGlobe);
    }

    root.querySelectorAll('.memory-photo').forEach((photo) => {
      const depth = Number(photo.dataset.depth || 0);
      const scene = photo.closest('.memory-scene');
      if (scene) {
        const reveal = gsap.from(photo, {
          autoAlpha: 0,
          y: 55,
          scale: .95,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: photo, start: 'top 88%', once: true },
        });
        const parallax = gsap.fromTo(photo,
          { yPercent: depth * -24 },
          { yPercent: depth * 24, ease: 'none', scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
        sceneAnimations.push(reveal, parallax);
      } else if (!mobileLayout) {
        const orbitParallax = gsap.to(photo, {
          yPercent: depth * 40,
          ease: 'none',
          scrollTrigger: { trigger: '.country-discovery .discovery-hero', start: 'top top', end: 'bottom bottom', scrub: 1.2 },
        });
        sceneAnimations.push(orbitParallax);
      }
    });

    root.querySelectorAll('.memory-scene__heading').forEach((heading) => {
      sceneAnimations.push(gsap.from(heading.children, {
        y: 42,
        autoAlpha: 0,
        stagger: .1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 76%', once: true },
      }));
    });

    sceneAnimations.push(gsap.from('.country-discovery .discovery-finale__copy > *', {
      y: 45,
      autoAlpha: 0,
      stagger: .11,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.country-discovery .discovery-finale', start: 'top 58%', once: true },
    }));

    const finaleTrigger = ScrollTrigger.create({
      trigger: '.country-discovery .discovery-finale',
      start: 'top 72%',
      onEnter: () => gsap.to(globeMount, { xPercent: -23, scale: 1.08, opacity: .88, duration: 1.1, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to(globeMount, { xPercent: -17, scale: .98, opacity: .72, duration: .8, ease: 'power3.out' }),
    });
    sceneAnimations.push(finaleTrigger);
  }

  function setWorldInteractive(enabled) {
    const worldHeader = document.querySelector('.world-header');
    const countryNav = document.querySelector('.world__countries');
    if (worldHeader) worldHeader.inert = !enabled;
    if (countryNav) countryNav.inert = !enabled;
  }

  function rememberView(mode, place = selectedPlace) {
    const currentState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
    if (mode === 'countryDiscovery') {
      window.history.replaceState({ ...currentState, pazView: mode, place: place?.id || null }, '', window.location.href);
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('place');
    window.history.replaceState({ ...currentState, pazView: 'world', place: place?.id || null }, '', url);
  }

  function enter(place, { instant = false } = {}) {
    if (!place || changing || (viewMode === 'countryDiscovery' && selectedPlace?.id === place.id)) return;
    changing = true;
    selectedPlace = place;
    viewMode = 'countryDiscovery';
    rememberView('countryDiscovery', place);
    renderCountry(place);
    window.scrollTo(0, 0);
    root.setAttribute('aria-hidden', 'false');
    header.setAttribute('aria-hidden', 'false');
    setWorldInteractive(false);
    document.documentElement.classList.add('is-discovery');
    document.body.classList.add('is-discovery', 'is-changing-view');
    globe.autoRotate = false;
    globe.focus(place.id, { speed: instant || reduced ? 1 : .075 });

    const titleItems = root.querySelectorAll('.discovery-hero__title > *');
    const meta = root.querySelector('.discovery-hero__meta');
    const photos = root.querySelectorAll('.discovery-orbit .memory-photo');
    const scrollCue = root.querySelector('.discovery-scroll');
    gsap.set(header, { autoAlpha: 0 });
    gsap.set(titleItems, { y: 28, autoAlpha: 0 });
    gsap.set(meta, { y: 16, autoAlpha: 0 });
    gsap.set(photos, { scale: .92, autoAlpha: 0 });
    gsap.set(scrollCue, { autoAlpha: 0 });
    gsap.set(root, { autoAlpha: 1 });

    setupScrollMotion();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    if (instant || reduced) {
      gsap.set(worldTargets, { autoAlpha: 0 });
      gsap.set(globeMount, { xPercent: 0, yPercent: 0, scale: discoveryScale, autoAlpha: 1 });
      gsap.set(header, { autoAlpha: 1 });
      gsap.set(titleItems, { y: 0, autoAlpha: 1 });
      gsap.set(meta, { y: 0, autoAlpha: 1 });
      gsap.set(photos, { scale: 1, autoAlpha: 1 });
      gsap.set(scrollCue, { autoAlpha: 1 });
      document.body.classList.remove('is-changing-view');
      changing = false;
      return;
    }

    gsap.timeline({
      onComplete: () => {
        document.body.classList.remove('is-changing-view');
        changing = false;
      },
    })
      .to(worldTargets, { y: -12, autoAlpha: 0, stagger: .025, duration: .42, ease: 'power2.out' }, 0)
      .to(globeMount, { xPercent: 0, yPercent: 0, scale: discoveryScale, autoAlpha: 1, duration: 1.05, ease: 'power3.inOut' }, .05)
      .to(header, { autoAlpha: 1, duration: .48, ease: 'power2.out' }, .42)
      .to(titleItems, { y: 0, autoAlpha: 1, stagger: .075, duration: .65, ease: 'power3.out' }, .56)
      .to(meta, { y: 0, autoAlpha: 1, duration: .58, ease: 'power3.out' }, .7)
      .to(photos, { scale: 1, autoAlpha: 1, stagger: .055, duration: .62, ease: 'power3.out' }, .72)
      .to(scrollCue, { autoAlpha: 1, duration: .4, ease: 'power2.out' }, 1.02);
  }

  function closeViewer({ instant = false } = {}) {
    if (viewer.hidden) return;
    const finish = () => {
      viewer.hidden = true;
      document.body.classList.remove('has-memory-open');
    };
    if (instant || reduced) finish();
    else gsap.to(viewer, { autoAlpha: 0, duration: .35, ease: 'power2.in', onComplete: finish });
  }

  function leave() {
    if (viewMode !== 'countryDiscovery' || changing) return;
    changing = true;
    closeViewer({ instant: true });
    document.body.classList.add('is-changing-view');

    const finish = () => {
      killSceneAnimations();
      root.setAttribute('aria-hidden', 'true');
      header.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-discovery');
      document.body.classList.remove('is-discovery', 'is-changing-view');
      setWorldInteractive(true);
      globe.setActive(null);
      globe.autoRotate = true;
      gsap.set(root, { clearProps: 'opacity,visibility' });
      gsap.set(header, { clearProps: 'opacity,visibility,transform' });
      gsap.set(worldTargets, { clearProps: 'opacity,visibility,transform' });
      gsap.set(globeMount, { clearProps: 'transform,opacity,visibility' });
      viewMode = 'world';
      rememberView('world');
      changing = false;
    };

    if (reduced) {
      window.scrollTo(0, 0);
      finish();
      return;
    }

    gsap.timeline({ onComplete: finish })
      .to([header, root], { autoAlpha: 0, duration: .34, ease: 'power2.out' }, 0)
      .add(() => {
        killSceneAnimations();
        window.scrollTo(0, 0);
        globe.setActive(null);
      }, .35)
      .to(globeMount, { xPercent: 0, yPercent: 0, scale: 1, autoAlpha: 1, duration: .82, ease: 'power3.inOut' }, .36)
      .to(worldTargets, { y: 0, autoAlpha: 1, stagger: .025, duration: .55, ease: 'power3.out' }, .57);
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

  function visiblePhotoSource() {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return [...root.querySelectorAll('.memory-photo')]
      .map((photo) => ({ photo, rect: photo.getBoundingClientRect() }))
      .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth)
      .sort((a, b) => {
        const distanceA = Math.hypot(a.rect.left + a.rect.width / 2 - center.x, a.rect.top + a.rect.height / 2 - center.y);
        const distanceB = Math.hypot(b.rect.left + b.rect.width / 2 - center.x, b.rect.top + b.rect.height / 2 - center.y);
        return distanceA - distanceB;
      })[0];
  }

  function transitionToStory(link) {
    if (storyTransitioning || !selectedPlace) return;
    storyTransitioning = true;
    if (reduced) {
      window.location.assign(link.href);
      return;
    }

    const visibleSource = visiblePhotoSource();
    const sourcePhoto = visibleSource?.photo;
    const sourceFrame = sourcePhoto?.querySelector('.memory-photo__surface')?.getBoundingClientRect()
      || visibleSource?.rect
      || link.getBoundingClientRect();
    const sourceMemory = selectedPlace.memories.find((memory) => memory.id === sourcePhoto?.dataset.memory)
      || selectedPlace.memories[orbitLayouts.length]
      || selectedPlace.memories[0];
    const [colorA, colorB, colorC] = sourceMemory.palette;
    try {
      sessionStorage.setItem('paz-country-handoff', JSON.stringify({
        id: selectedPlace.id,
        country: selectedPlace.country,
        palette: sourceMemory.palette,
        image: sourceMemory.src || '',
      }));
    } catch { /* storage can be unavailable */ }

    const transition = document.createElement('div');
    transition.className = 'deep-dive-transition';
    transition.innerHTML = `<span>DEEP DIVE / ${selectedPlace.country.toUpperCase()}</span><strong>${selectedPlace.country}</strong>`;
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
    const outgoingUi = [header, ...root.querySelectorAll('.discovery-finale__copy, .discovery-hero__title, .discovery-hero__meta')];
    gsap.timeline({ onComplete: () => window.location.assign(link.href) })
      .to(outgoingUi, {
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

  backButton.addEventListener('click', leave);
  root.addEventListener('click', (event) => {
    const back = event.target.closest('[data-back-world]');
    if (back) {
      leave();
      return;
    }
    const deepLink = event.target.closest('a[href*="country.html"]');
    if (deepLink) {
      event.preventDefault();
      transitionToStory(deepLink);
      return;
    }
    const photo = event.target.closest('[data-memory]');
    if (photo && selectedPlace) {
      const memory = selectedPlace.memories.find((item) => item.id === photo.dataset.memory);
      if (memory) openViewer(memory);
    }
  });
  deepHeaderLink.addEventListener('click', (event) => {
    event.preventDefault();
    transitionToStory(deepHeaderLink);
  });
  viewer.querySelector('.memory-viewer__close').addEventListener('click', () => closeViewer());
  viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !viewer.hidden) closeViewer(); });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted || viewMode !== 'countryDiscovery') return;
    storyTransitioning = false;
    document.querySelectorAll('.deep-dive-transition').forEach((transition) => transition.remove());
    const restoredUi = [header, ...root.querySelectorAll('.discovery-finale__copy, .discovery-hero__title, .discovery-hero__meta')];
    gsap.set(restoredUi, { clearProps: 'opacity,visibility,transform' });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  return {
    enter,
    leave,
    get viewMode() { return viewMode; },
    get selectedCountry() { return selectedPlace; },
  };
}
