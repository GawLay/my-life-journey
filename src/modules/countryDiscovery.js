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
  { x: '51vw', y: '130vh', w: '24vw', r: '-1.6deg', d: -.18, z: 3 },
  { x: '7vw', y: '160vh', w: '28vw', r: '1.1deg', d: .2, z: 4 },
  { x: '70vw', y: '184vh', w: '22vw', r: '2.3deg', d: -.24, z: 2 },
  { x: '36vw', y: '220vh', w: '30vw', r: '-.8deg', d: .16, z: 3 },
  { x: '5vw', y: '255vh', w: '22vw', r: '1.9deg', d: -.12, z: 4 },
];

function photoSurface(memory, eager = false) {
  if (memory.src) {
    if (memory.type === 'video') {
      return `<video class="memory-photo__surface" src="${memory.src}" poster="${memory.poster || ''}" aria-label="${memory.alt}" muted loop playsinline preload="${eager ? 'metadata' : 'none'}" data-auto-play style="object-position:${memory.position || 'center'}"></video>`;
    }
    return `<img class="memory-photo__surface" src="${memory.src}" alt="${memory.alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" style="object-position:${memory.position || 'center'}" />`;
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
        ${photoSurface(memory, scene === 'orbit')}
        <figcaption><span>${String(memory.index).padStart(2, '0')}</span><b>${memory.city}<i>${memory.moment}</i></b></figcaption>
        <em aria-hidden="true">VIEW</em>
      </figure>
    </button>`;
}

function renderScene(memories, layouts, scene) {
  return memories.map((memory, index) => photoMarkup(memory, layouts[index], scene)).join('');
}

function collectionPhotoMarkup(memory, group) {
  const [colorA, colorB, colorC] = memory.palette;
  return `
    <button class="memory-photo memory-photo--collection memory-photo--${memory.aspect}" type="button" data-memory="${memory.id}" data-depth="0" data-scene="${group}"
      aria-label="View ${memory.city}, ${memory.moment}"
      style="--photo-a:${colorA};--photo-b:${colorB};--photo-c:${colorC}">
      <figure class="memory-photo__frame">
        ${photoSurface(memory)}
        <figcaption><span>${String(memory.index).padStart(2, '0')}</span><b>${memory.city}<i>${memory.moment}</i></b></figcaption>
        <em aria-hidden="true">VIEW</em>
      </figure>
    </button>`;
}

function renderDiscoveryGroups(place, memories) {
  return (place.discoveryGroups || []).map((group, index) => {
    const groupMemories = memories.filter((memory) => memory.group === group.id);
    if (!groupMemories.length) return '';
    return `
      <section class="memory-group memory-group--${index % 2 ? 'dark' : 'light'}" aria-labelledby="memory-group-${group.id}">
        <header class="memory-group__heading">
          <span>SCENE ${String(index + 4).padStart(2, '0')} / ${group.eyebrow}</span>
          <h2 id="memory-group-${group.id}">${group.title}</h2>
          <p>${group.copy}</p>
        </header>
        <div class="memory-group__grid">${groupMemories.map((memory) => collectionPhotoMarkup(memory, group.id)).join('')}</div>
      </section>`;
  }).join('');
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
  let storyCoverPreload = null;

  function killSceneAnimations() {
    sceneAnimations.forEach((animation) => {
      animation.scrollTrigger?.kill();
      animation.kill?.();
    });
    sceneAnimations = [];
  }

  function renderCountry(place) {
    const placeIndex = places.findIndex((item) => item.id === place.id);
    const discoveryMemories = place.memories.filter((memory) => memory.discovery);
    const orbitMemories = discoveryMemories.slice(0, orbitLayouts.length);
    const featureMemories = discoveryMemories.slice(orbitLayouts.length, orbitLayouts.length + featureLayouts.length);
    const archiveLimit = place.discoveryGroups?.length ? 4 : archiveLayouts.length;
    const archiveStart = orbitLayouts.length + featureLayouts.length;
    const archiveMemories = discoveryMemories.slice(archiveStart, archiveStart + archiveLimit);
    const groupedMemories = place.discoveryGroups?.length ? discoveryMemories.slice(archiveStart + archiveLimit) : [];
    const archiveHeight = 185 + Math.max(0, archiveMemories.length - 4) * 31;
    const cityList = place.cities.split(' / ').map((city) => city.trim());

    if (place.deepDive?.cover?.src) {
      storyCoverPreload = new Image();
      storyCoverPreload.src = place.deepDive.cover.src;
    }

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
            <b>${String(place.photos).padStart(2, '0')} PHOTOS${place.videos ? `&nbsp;&nbsp;&nbsp;${String(place.videos).padStart(2, '0')} FILMS` : ''}&nbsp;&nbsp;&nbsp;${String(place.stories).padStart(2, '0')} STORIES</b>
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

      <section class="memory-scene memory-scene--archive" aria-labelledby="archive-scene-title" style="--archive-height:${archiveHeight}svh">
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

      ${renderDiscoveryGroups(place, groupedMemories)}

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
      const group = photo.closest('.memory-group');
      if (scene || group) {
        const reveal = gsap.from(photo, {
          autoAlpha: 0,
          y: 55,
          scale: .95,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: photo, start: 'top 88%', once: true },
        });
        sceneAnimations.push(reveal);
        if (scene) {
          const parallax = gsap.fromTo(photo,
            { yPercent: depth * -24 },
            { yPercent: depth * 24, ease: 'none', scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
          sceneAnimations.push(parallax);
        }
      } else if (!mobileLayout) {
        const orbitParallax = gsap.to(photo, {
          yPercent: depth * 40,
          ease: 'none',
          scrollTrigger: { trigger: '.country-discovery .discovery-hero', start: 'top top', end: 'bottom bottom', scrub: 1.2 },
        });
        sceneAnimations.push(orbitParallax);
      }
    });

    root.querySelectorAll('.memory-scene__heading, .memory-group__heading').forEach((heading) => {
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

  let mediaObserver = null;
  function setupMediaPlayback() {
    mediaObserver?.disconnect();
    mediaObserver = null;
    const videos = [...root.querySelectorAll('video[data-auto-play]')];
    if (reduced || !videos.length) return;
    mediaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    }, { rootMargin: '20% 0px', threshold: .12 });
    videos.forEach((video) => mediaObserver.observe(video));
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

  function enter(place, { instant = false, reveal = false, earthReturn = false } = {}) {
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
    globe.focus(place.id, {
      center: earthReturn,
      immediate: earthReturn,
      speed: instant || reduced ? 1 : .075,
    });

    const titleItems = root.querySelectorAll('.discovery-hero__title > *');
    const meta = root.querySelector('.discovery-hero__meta');
    const photos = root.querySelectorAll('.discovery-orbit .memory-photo');
    const scrollCue = root.querySelector('.discovery-scroll');
    photos.forEach((photo) => {
      const image = photo.querySelector('img');
      if (image?.decode) image.decode().catch(() => {});
    });
    gsap.set(header, { autoAlpha: 0 });
    gsap.set(titleItems, { y: 28, autoAlpha: 0 });
    gsap.set(meta, { y: 16, autoAlpha: 0 });
    gsap.set(photos, { y: 14, scale: .985, autoAlpha: 0, force3D: true });
    gsap.set(scrollCue, { autoAlpha: 0 });
    gsap.set(root, { autoAlpha: 1 });

    setupMediaPlayback();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    if (instant || reduced) {
      gsap.set(worldTargets, { autoAlpha: 0 });
      gsap.set(globeMount, { xPercent: 0, yPercent: 0, scale: discoveryScale, autoAlpha: 1 });
      gsap.set(header, { autoAlpha: 1 });
      gsap.set(titleItems, { y: 0, autoAlpha: 1 });
      gsap.set(meta, { y: 0, autoAlpha: 1 });
      gsap.set(photos, { y: 0, scale: 1, autoAlpha: 1 });
      gsap.set(scrollCue, { autoAlpha: 1 });
      document.body.classList.remove('is-changing-view');
      changing = false;
      setupScrollMotion();
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }

    if (reveal && earthReturn) {
      // The destination starts under the departing cover with the globe already
      // close enough to fill the viewport. As the cover clears, pull the camera
      // back to the familiar Discovery composition and let the interface return.
      const globeSize = globeMount.clientWidth || Math.max(window.innerWidth, window.innerHeight);
      const returnScale = Math.hypot(window.innerWidth, window.innerHeight) / globeSize * 1.08;
      gsap.set(worldTargets, { autoAlpha: 0 });
      gsap.set(globeMount, { xPercent: 0, yPercent: 0, scale: returnScale, autoAlpha: 1 });
      globe.camera.position.z = 1.45;
      gsap.timeline({
        onComplete: () => {
          document.body.classList.remove('is-changing-view');
          changing = false;
          setupScrollMotion();
          ScrollTrigger.refresh();
        },
      })
        .to(globeMount, { scale: discoveryScale, duration: 2.3, ease: 'power2.inOut' }, 0)
        .to(globe.camera.position, { z: globe.baseCameraZ, duration: 2.3, ease: 'power2.inOut' }, 0)
        .add(() => globe.focus(place.id, { speed: .025 }), .28)
        .to(header, { autoAlpha: 1, duration: .5, ease: 'power2.out' }, .62)
        .to(titleItems, { y: 0, autoAlpha: 1, stagger: .07, duration: .72, ease: 'power3.out' }, .68)
        .to(meta, { y: 0, autoAlpha: 1, duration: .62, ease: 'power3.out' }, .82)
        .add(() => globe.focus(place.id, { immediate: true }), 2.3)
        // Let the globe finish returning to its Discovery composition before the
        // orbit photos unfold. Running both at once made the rotation feel jittery.
        .to(photos, { y: 0, scale: 1, autoAlpha: 1, stagger: .07, duration: .62, ease: 'power3.out', force3D: true }, 2.38)
        .to(scrollCue, { autoAlpha: 1, duration: .4, ease: 'power2.out' }, 2.62);
      return;
    }

    if (reveal) {
      // Landing straight in discovery from a Deep Dive page: the world chrome is
      // hidden and the globe pre-framed instantly, then the hero settles in while
      // world.js irises the entry cover open over the top — no jarring pop-in.
      gsap.set(worldTargets, { autoAlpha: 0 });
      gsap.set(globeMount, { xPercent: 0, yPercent: 0, scale: discoveryScale, autoAlpha: 1 });
      gsap.timeline({
        delay: .3,
        onComplete: () => {
          document.body.classList.remove('is-changing-view');
          changing = false;
          setupScrollMotion();
          ScrollTrigger.refresh();
        },
      })
        .to(header, { autoAlpha: 1, duration: .5, ease: 'power2.out' }, 0)
        .to(titleItems, { y: 0, autoAlpha: 1, stagger: .08, duration: .7, ease: 'power3.out' }, .08)
        .to(meta, { y: 0, autoAlpha: 1, duration: .6, ease: 'power3.out' }, .24)
        .to(photos, { y: 0, scale: 1, autoAlpha: 1, stagger: .07, duration: .62, ease: 'power3.out', force3D: true }, .28)
        .to(scrollCue, { autoAlpha: 1, duration: .45, ease: 'power2.out' }, .6);
      return;
    }

    gsap.timeline({
      onComplete: () => {
        document.body.classList.remove('is-changing-view');
        changing = false;
        setupScrollMotion();
        ScrollTrigger.refresh();
      },
    })
      .to(worldTargets, { y: -12, autoAlpha: 0, stagger: .025, duration: .42, ease: 'power2.out' }, 0)
      .to(globeMount, { xPercent: 0, yPercent: 0, scale: discoveryScale, autoAlpha: 1, duration: 1.05, ease: 'power3.inOut' }, .05)
      .to(header, { autoAlpha: 1, duration: .48, ease: 'power2.out' }, .42)
      .to(titleItems, { y: 0, autoAlpha: 1, stagger: .075, duration: .65, ease: 'power3.out' }, .56)
      .to(meta, { y: 0, autoAlpha: 1, duration: .58, ease: 'power3.out' }, .7)
      .to(photos, { y: 0, scale: 1, autoAlpha: 1, stagger: .07, duration: .62, ease: 'power3.out', force3D: true }, .72)
      .to(scrollCue, { autoAlpha: 1, duration: .4, ease: 'power2.out' }, 1.02);
  }

  function closeViewer({ instant = false } = {}) {
    if (viewer.hidden) return;
    const finish = () => {
      const video = viewer.querySelector('video');
      if (video) video.pause();
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
      mediaObserver?.disconnect();
      mediaObserver = null;
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
    surface.replaceChildren();
    const viewerImage = memory.type === 'video' ? memory.poster : memory.src;
    surface.style.backgroundImage = viewerImage
      ? `url("${viewerImage}")`
      : 'linear-gradient(135deg, var(--photo-a), var(--photo-b) 52%, var(--photo-c))';
    surface.style.backgroundPosition = memory.position || 'center';
    if (memory.type === 'video' && memory.src) {
      const video = document.createElement('video');
      video.className = 'memory-viewer__video';
      video.src = memory.src;
      video.poster = memory.poster || '';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', memory.alt);
      video.style.objectPosition = memory.position || 'center';
      surface.appendChild(video);
      if (!reduced) video.play().catch(() => {});
    }
    document.getElementById('memory-viewer-index').textContent = String(memory.index).padStart(2, '0');
    document.getElementById('memory-viewer-title').textContent = memory.city;
    document.getElementById('memory-viewer-note').textContent = memory.moment;
    viewer.hidden = false;
    document.body.classList.add('has-memory-open');
    if (!reduced) gsap.fromTo(viewer, { autoAlpha: 0 }, { autoAlpha: 1, duration: .45, ease: 'power2.out' });
    viewer.querySelector('.memory-viewer__close').focus();
  }

  function buildArrivalCover(place, cover) {
    // The warm surface the country page opens under, same palette / photo, so the
    // globe descent, this cover and the deep-dive hero read as one continuous surface.
    const transition = document.createElement('div');
    transition.className = 'deep-dive-transition';
    transition.innerHTML = `
      <div class="deep-dive-transition__surface" aria-hidden="true"></div>
      <div class="deep-dive-transition__atmosphere" aria-hidden="true"></div>
      <div class="deep-dive-transition__speed" aria-hidden="true"></div>
      <div class="deep-dive-transition__copy">
        <span>DEEP DIVE / ${place.country.toUpperCase()}</span>
        <strong>${place.country}</strong>
      </div>
      <div class="deep-dive-transition__hud" aria-hidden="true">
        <span>${place.coordinates}</span>
        <b>ALT 12.8K KM</b>
      </div>`;
    transition.querySelector('.deep-dive-transition__surface').style.setProperty('--transition-image', cover.src
      ? `url("${cover.src}")`
      : `linear-gradient(135deg, ${cover.palette[0]}, ${cover.palette[1]} 52%, ${cover.palette[2]})`);
    transition.style.setProperty('--transition-position', cover.position || 'center');
    transition.style.setProperty('--transition-color', cover.palette[0]);
    document.body.appendChild(transition);
    gsap.set(transition.querySelector('.deep-dive-transition__surface'), { autoAlpha: 0, scale: 1.24, filter: 'blur(18px)' });
    gsap.set(transition.querySelectorAll('.deep-dive-transition__copy > *'), { autoAlpha: 0, y: 24 });
    gsap.set(transition.querySelector('.deep-dive-transition__hud'), { autoAlpha: 0 });
    return transition;
  }

  // The surrounding interface gently releases the globe: opaque scenes clear to
  // uncover it, headings drift and stretch (echoing the liquid-warp vocabulary),
  // supporting content and the orbit photographs flow softly outward. Everything
  // dissolves with small timing differences; nothing is thrown off-screen.
  function dissolveDiscoveryUI(timeline) {
    const titleItems = root.querySelectorAll('.discovery-hero__title > *');
    const meta = root.querySelector('.discovery-hero__meta');
    const scrollCue = root.querySelector('.discovery-scroll');
    const scenes = root.querySelectorAll('.memory-scene, .memory-group');
    const finaleCopy = root.querySelectorAll('.discovery-finale__copy > *');

    if (scenes.length) timeline.to(scenes, { autoAlpha: 0, duration: .5, ease: 'power2.out' }, 0);
    timeline.to(header, { autoAlpha: 0, y: -22, duration: .55, ease: 'power2.out' }, 0);
    if (titleItems.length) timeline.to(titleItems, { autoAlpha: 0, y: -26, scaleY: 1.06, skewX: 3, transformOrigin: '0% 50%', stagger: .05, duration: .7, ease: 'power2.out' }, 0);
    if (meta) timeline.to(meta, { autoAlpha: 0, x: 34, duration: .6, ease: 'power2.out' }, .05);
    if (scrollCue) timeline.to(scrollCue, { autoAlpha: 0, duration: .4, ease: 'power1.out' }, 0);
    if (finaleCopy.length) timeline.to(finaleCopy, { autoAlpha: 0, y: 26, stagger: .05, duration: .6, ease: 'power2.out' }, 0);

    root.querySelectorAll('.discovery-orbit .memory-photo').forEach((photo, index) => {
      const rect = photo.getBoundingClientRect();
      const nx = (rect.left + rect.width / 2) / window.innerWidth - .5;
      const ny = (rect.top + rect.height / 2) / window.innerHeight - .5;
      timeline.to(photo, { autoAlpha: 0, x: `+=${nx * 90}`, y: `+=${ny * 90}`, scale: .9, duration: .75, ease: 'power2.out' }, index * .04);
    });
  }

  // One continuous descent shared by both deep-dive triggers: Discovery releases the
  // globe, the globe finds the country and the camera travels into it, then Earth
  // dissolves into the arrival cover and the deep-dive page takes over. The globe
  // itself is the bridge between the two pages, not a page-swap dressed up.
  function enterDeepDive(link) {
    if (storyTransitioning || !selectedPlace) return;
    storyTransitioning = true;
    const place = selectedPlace;
    const cover = place.deepDive?.cover || place.memories[7] || place.memories[0];
    const navigate = () => window.location.assign(link.href);

    // Hand the warm destination cover to the country page so it paints a matching
    // surface before first paint (see the motion-system seamless hand-off rules).
    try {
      sessionStorage.setItem('paz-country-handoff', JSON.stringify({
        id: place.id,
        country: place.country,
        palette: cover.palette,
        image: cover.src || '',
        position: cover.position || 'center',
        direction: 'forward',
      }));
    } catch { /* storage can be unavailable */ }

    closeViewer({ instant: true });
    killSceneAnimations();
    globe.autoRotate = false;

    if (reduced) {
      // Simplified path: the interface softly clears, the globe snaps its focus onto
      // the country, and a short cover carries us in — no extended camera descent.
      document.body.classList.add('is-changing-view');
      globe.focus(place.id, { center: true, immediate: true });
      const staticCover = buildArrivalCover(place, cover);
      const staticSurface = staticCover.querySelector('.deep-dive-transition__surface');
      const staticCopy = staticCover.querySelectorAll('.deep-dive-transition__copy > *');
      gsap.timeline({ onComplete: navigate })
        .to([header, root], { autoAlpha: 0, duration: .3, ease: 'power1.out' }, 0)
        .to(staticSurface, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .35, ease: 'power1.out' }, .18)
        .to(staticCopy, { autoAlpha: 1, y: 0, stagger: .05, duration: .3, ease: 'power2.out' }, .3);
      return;
    }

    // Keep Discovery mounted and freeze the page — the globe carries us in, so the
    // scene must not unmount and the descent must not scroll out from under itself.
    document.documentElement.classList.add('is-descending');
    document.body.classList.add('is-descending', 'is-changing-view');
    // Begin almost at rest, then gather rotational speed before the camera commits.
    // A constant fast slerp made the first beat snap even though the later dive felt
    // right; easing focusSpeed keeps the country search calm without slowing the trip.
    globe.focus(place.id, { center: true, speed: .006 });

    // Cover the viewport's diagonal so the square globe canvas fills the frame with no
    // dark corners as Earth grows (the sphere already overflows the canvas at this dolly).
    const globeSize = globeMount.clientWidth || Math.max(window.innerWidth, window.innerHeight);
    const coverScale = Math.hypot(window.innerWidth, window.innerHeight) / globeSize * 1.08;
    const transition = buildArrivalCover(place, cover);
    const surface = transition.querySelector('.deep-dive-transition__surface');
    const atmosphere = transition.querySelector('.deep-dive-transition__atmosphere');
    const speed = transition.querySelector('.deep-dive-transition__speed');
    const copy = transition.querySelectorAll('.deep-dive-transition__copy > *');
    const hud = transition.querySelector('.deep-dive-transition__hud');
    const altitude = hud.querySelector('b');
    const flight = { altitude: 12800 };

    const tl = gsap.timeline({ onComplete: navigate });
    // Discovery releases the globe (overlaps every stage below).
    dissolveDiscoveryUI(tl);
    tl
      .to(globe, { focusSpeed: .055, duration: .72, ease: 'power2.in' }, 0)
      // The globe simultaneously becomes dominant: recentre and steady it.
      .to(globeMount, { xPercent: 0, yPercent: 0, opacity: 1, duration: .6, ease: 'power2.out' }, 0)
      // The approach accelerates: a calm release, then the camera commits and rushes
      // into the surface (power3.in) rather than coasting, travel, not a slow preset.
      .to(globeMount, { scale: coverScale, duration: 1.58, ease: 'power3.in' }, .28)
      .to(globe.camera.position, { z: 1.45, duration: 1.58, ease: 'power3.in' }, .28)
      .to(flight, {
        altitude: 3,
        duration: 1.58,
        ease: 'power3.in',
        onUpdate: () => {
          const value = Math.round(flight.altitude);
          altitude.textContent = value > 999 ? `ALT ${(value / 1000).toFixed(1)}K KM` : `ALT ${value} KM`;
        },
      }, .28)
      .to(hud, { autoAlpha: 1, duration: .35, ease: 'power2.out' }, .38)
      .fromTo(atmosphere, { autoAlpha: 0, scale: .72 }, { autoAlpha: .78, scale: 1.22, duration: .82, ease: 'power2.inOut' }, .74)
      .fromTo(speed, { autoAlpha: 0, scaleX: .82 }, { autoAlpha: .34, scaleX: 1.18, duration: .55, ease: 'power2.in' }, .92)
      // Surface detail replaces vector detail across the full frame. There is no
      // circular mask: blur resolves as the cover photo takes over the camera.
      .to(surface, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .78, ease: 'power2.out' }, 1.36)
      .to(globeMount, { autoAlpha: 0, duration: .38, ease: 'power2.in' }, 1.52)
      .to([atmosphere, speed, hud], { autoAlpha: 0, duration: .38, ease: 'power2.out' }, 1.64)
      .to(copy, { autoAlpha: 1, y: 0, stagger: .06, duration: .48, ease: 'power3.out' }, 1.74);
  }

  // Undo a frozen mid-descent DOM (bfcache restore) so the back button lands on a
  // clean discovery view rather than a giant globe under a half-faded interface.
  function restoreFromDescent() {
    storyTransitioning = false;
    const transition = document.querySelector('.deep-dive-transition');
    gsap.killTweensOf([globe, globeMount, globe.camera.position]);
    globe.autoRotate = false;
    const photos = [...root.querySelectorAll('.discovery-orbit .memory-photo')];
    const revealTargets = [
      header,
      ...root.querySelectorAll('.discovery-hero__title > *, .discovery-hero__meta, .discovery-scroll, .memory-scene, .memory-group, .discovery-finale__copy > *'),
    ];
    const allRevealTargets = [...revealTargets, ...photos];

    if (reduced || !transition) {
      transition?.remove();
      globe.camera.position.z = globe.baseCameraZ;
      gsap.set(globeMount, { xPercent: 0, yPercent: 0, scale: discoveryScale, autoAlpha: 1, clearProps: 'opacity' });
      gsap.set([header, root, ...allRevealTargets], { clearProps: 'opacity,visibility,transform' });
      document.documentElement.classList.remove('is-descending');
      document.body.classList.remove('is-descending', 'is-changing-view');
      if (selectedPlace) globe.focus(selectedPlace.id, { immediate: true });
      setupScrollMotion();
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }

    // Browser Back may restore the exact final frame from the forward descent.
    // Use that retained photo cover as the first frame, then reverse the camera.
    const globeSize = globeMount.clientWidth || Math.max(window.innerWidth, window.innerHeight);
    const returnScale = Math.hypot(window.innerWidth, window.innerHeight) / globeSize * 1.08;
    gsap.set(globeMount, { xPercent: 0, yPercent: 0, scale: returnScale, autoAlpha: 1 });
    globe.camera.position.z = 1.45;
    if (selectedPlace) globe.focus(selectedPlace.id, { center: true, immediate: true });
    gsap.timeline({
      onComplete: () => {
        transition.remove();
        gsap.set([header, root, ...allRevealTargets], { clearProps: 'opacity,visibility,transform' });
        document.documentElement.classList.remove('is-descending');
        document.body.classList.remove('is-descending', 'is-changing-view');
        setupScrollMotion();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      },
    })
      .to(transition.querySelectorAll('.deep-dive-transition__copy > *'), { autoAlpha: 0, y: 16, duration: .28, ease: 'power2.in' }, 0)
      .to(transition, { autoAlpha: 0, duration: .55, ease: 'power2.inOut' }, .08)
      .to(globeMount, { scale: discoveryScale, duration: 2.3, ease: 'power2.inOut' }, .18)
      .to(globe.camera.position, { z: globe.baseCameraZ, duration: 2.3, ease: 'power2.inOut' }, .18)
      .add(() => {
        if (selectedPlace) globe.focus(selectedPlace.id, { speed: .025 });
      }, .46)
      .to(revealTargets, { autoAlpha: 1, stagger: .02, duration: .62, ease: 'power3.out' }, .72)
      .add(() => {
        if (selectedPlace) globe.focus(selectedPlace.id, { immediate: true });
      }, 2.48)
      .to(photos, { x: 0, y: 0, scale: 1, autoAlpha: 1, stagger: .07, duration: .62, ease: 'power3.out', force3D: true }, 2.56);
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
      enterDeepDive(deepLink);
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
    enterDeepDive(deepHeaderLink);
  });
  viewer.querySelector('.memory-viewer__close').addEventListener('click', () => closeViewer());
  viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !viewer.hidden) closeViewer(); });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted || viewMode !== 'countryDiscovery') return;
    restoreFromDescent();
  });

  return {
    enter,
    leave,
    get viewMode() { return viewMode; },
    get selectedCountry() { return selectedPlace; },
  };
}
