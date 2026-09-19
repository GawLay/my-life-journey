import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { renderWork } from './modules/work.js';
import { initSound } from './modules/sound.js';
import { initLiquidWarp } from './modules/liquidWarp.js';
import { initHeaderWave, setWaveText } from './modules/headerWave.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || new URLSearchParams(window.location.search).has('static');
// Set by index.html's head script when we arrive back from "Explore my world":
// the page paints under a charcoal cover that we iris open on load.
const entering = !reduced && document.documentElement.classList.contains('is-entering');
const waveEntering = !reduced && document.documentElement.classList.contains('is-wave-entering');
document.documentElement.classList.add('js');

renderWork();
if (waveEntering) document.querySelectorAll('[data-hero-line]').forEach((line) => {
  setWaveText(line);
  line.classList.remove('wave-text');
  line.classList.add('wave-arrival');
});
if (waveEntering) initHeaderWave();
if (waveEntering) window.__PAZ_WAVE_CONTENT_READY__?.();

function setupHeader() {
  const header = document.getElementById('site-header');
  const hero = document.querySelector('.hero');
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    header?.classList.toggle('on-dark', hero.getBoundingClientRect().bottom > header.offsetHeight);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

function setupMotion() {
  if (reduced) {
    gsap.set('[data-reveal], [data-hero-line], .project__content, .project__visual', { autoAlpha: 1 });
    return;
  }

  const ease = 'power3.out';
  // When returning under the cover, hold the hero a beat so it reveals as the iris opens.
  if (waveEntering) {
    gsap.set('[data-hero-line], .hero [data-reveal]', { autoAlpha: 1, y: 0 });
    gsap.set('.hero__footer > *', { clipPath: 'inset(0 0 0% 0)' });
  } else {
    gsap.timeline({ defaults: { ease }, delay: entering ? .22 : 0 })
      .fromTo('[data-hero-line]', { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 1.25, stagger: 0.16 }, 0.15)
      .fromTo('.hero [data-reveal]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.45)
      .fromTo('.hero__footer > *', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, stagger: 0.08 }, 0.55);
  }

  gsap.to('.hero__title > span:first-child', {
    xPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
  });
  gsap.to('.hero__title > span:last-child', {
    xPercent: 7,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
  });
  gsap.to('.hero__liquid', {
    scale: 1.12,
    yPercent: 7,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });

  document.querySelectorAll('.chapter-intro').forEach((section) => {
    gsap.from(section.querySelectorAll('.chapter-intro__index, .chapter-intro__title, .chapter-intro__side'), {
      autoAlpha: 0,
      y: 34,
      duration: 1.05,
      stagger: 0.1,
      ease,
      scrollTrigger: { trigger: section, start: 'top 74%' },
    });
  });

  document.querySelectorAll('[data-project]').forEach((project) => {
    const content = project.querySelector('.project__content');
    const visual = project.querySelector('.project__visual');
    gsap.set(content, { autoAlpha: 0, y: 28 });
    gsap.set(visual, { autoAlpha: 0, clipPath: 'inset(9% 0 9% 0)' });
    gsap.timeline({ scrollTrigger: { trigger: project, start: 'top 70%' } })
      .to(visual, { autoAlpha: 1, clipPath: 'inset(0% 0 0% 0)', duration: 1.15, ease }, 0)
      .to(content, { autoAlpha: 1, y: 0, duration: 1, ease }, 0.18);

    gsap.fromTo(project.querySelector('.project__phone'),
      { yPercent: 5 },
      { yPercent: -5, ease: 'none', scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: 1 } }
    );
  });

  gsap.from('.world-invite h2', {
    autoAlpha: 0,
    y: 70,
    duration: 1.3,
    ease,
    scrollTrigger: { trigger: '.world-invite', start: 'top 68%' },
  });
  gsap.to('.world-invite__orb', {
    rotation: 24,
    scale: 1.18,
    ease: 'none',
    scrollTrigger: { trigger: '.world-invite', start: 'top bottom', end: 'bottom top', scrub: 1 },
  });
}

function setupLiquidPointer() {
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
  const hero = document.querySelector('.hero');
  const one = document.querySelector('.liquid-orb--one');
  const two = document.querySelector('.liquid-orb--two');
  const three = document.querySelector('.liquid-orb--three');
  const sheen = document.querySelector('.liquid-sheen');
  if (!hero || !one || !two || !three || !sheen) return;

  const movers = [
    { x: gsap.quickTo(one, 'x', { duration: 1.8, ease: 'power3.out' }), y: gsap.quickTo(one, 'y', { duration: 1.8, ease: 'power3.out' }), amount: -42 },
    { x: gsap.quickTo(two, 'x', { duration: 2.1, ease: 'power3.out' }), y: gsap.quickTo(two, 'y', { duration: 2.1, ease: 'power3.out' }), amount: 34 },
    { x: gsap.quickTo(three, 'x', { duration: 2.4, ease: 'power3.out' }), y: gsap.quickTo(three, 'y', { duration: 2.4, ease: 'power3.out' }), amount: 24 },
    { x: gsap.quickTo(sheen, 'x', { duration: 1.4, ease: 'power2.out' }), y: gsap.quickTo(sheen, 'y', { duration: 1.4, ease: 'power2.out' }), amount: 55 },
  ];
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    movers.forEach((mover) => { mover.x(nx * mover.amount); mover.y(ny * mover.amount); });
  }, { passive: true });
}

function playEntryReveal() {
  const cover = document.querySelector('.work-entry');
  if (!entering || !cover) {
    document.documentElement.classList.remove('is-entering');
    return;
  }
  gsap.fromTo(cover,
    { clipPath: 'circle(150% at 50% 50%)' },
    {
      clipPath: 'circle(0% at 50% 50%)',
      duration: .95,
      ease: 'power3.inOut',
      onComplete: () => {
        document.documentElement.classList.remove('is-entering');
        gsap.set(cover, { clearProps: 'clipPath' });
      },
    });
}

function setupWorldLinks() {
  const clearTransition = () => {
    document.querySelectorAll('.world-page-transition').forEach((overlay) => overlay.remove());
  };
  clearTransition();
  window.addEventListener('pageshow', clearTransition);

  if (reduced) return;
  document.querySelectorAll('a[href$="world.html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (window.__PAZ_WAVE_LINK__?.(link.href)) return;
      event.preventDefault();
      if (document.querySelector('.world-page-transition')) return;
      const overlay = document.createElement('div');
      overlay.className = 'world-page-transition';
      overlay.innerHTML = '<span>EXPLORE MY WORLD</span><i></i>';
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('is-active'));
      window.setTimeout(() => { window.location.assign(link.href); }, 950);
    });
  });
}

// Leaving to a project detail page: iris the charcoal cover shut from the tapped
// card, then navigate. The project page paints under a matching cover and irises
// it open — one continuous charcoal hand-off (see project.js).
function setupProjectLinks() {
  if (reduced) return;
  const cover = document.querySelector('.work-entry');
  if (!cover) return;
  let leaving = false;
  document.querySelectorAll('a[href*="project.html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || leaving) return;
      if (window.__PAZ_WAVE_LINK__?.(link.href)) return;
      event.preventDefault();
      leaving = true;
      try { sessionStorage.setItem('paz-entry', 'project'); } catch { /* storage unavailable */ }
      gsap.fromTo(cover,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(150% at 50% 50%)', duration: 0.72, ease: 'power3.inOut', onComplete: () => window.location.assign(link.href) });
    });
  });
}

async function boot() {
  try { await document.fonts.ready; } catch (_) { /* font loading is non-critical */ }
  initHeaderWave();
  setupHeader();
  setupMotion();
  playEntryReveal();
  setupLiquidPointer();
  initLiquidWarp();
  initSound();
  setupWorldLinks();
  setupProjectLinks();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

// Reset the cover if the page is restored from the back/forward cache.
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  document.documentElement.classList.remove('is-entering');
  const cover = document.querySelector('.work-entry');
  if (cover) gsap.set(cover, { clearProps: 'clipPath' });
});

boot();
