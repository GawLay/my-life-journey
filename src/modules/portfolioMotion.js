import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Portfolio signature: an interactive recreation of the résumé app in one phone.
// A recreated extended FAB (and a page-step rail) navigate between the real
// screens; each change plays the app's own circular reveal (clip-path circle —
// the same primitive this site uses between pages). A persistent blurred
// backdrop spotlights the sharp phone; the experience list opens a role detail.
export function initPortfolioMotion() {
  const stage = document.querySelector('[data-pf-stage]');
  if (!stage) return;

  const screens = {};
  stage.querySelectorAll('[data-screen]').forEach((el) => (screens[el.dataset.screen] = el));
  const fab = stage.querySelector('[data-pf-fab]');
  const toggle = stage.querySelector('[data-pf-toggle]');
  const bar = stage.querySelector('[data-pf-bar]');
  const backdrop = stage.querySelector('[data-pf-backdrop]');
  const hotspot = stage.querySelector('[data-pf-open-detail]');
  const back = stage.querySelector('[data-pf-back]');
  const fly = stage.querySelector('[data-pf-fly]');
  const stepEls = [...stage.querySelectorAll('[data-pf-step]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(location.search).has('static');

  const ORIGIN = '85% 90%';
  const clip = (el, r) => { const v = `circle(${r}% at ${ORIGIN})`; el.style.clipPath = v; el.style.webkitClipPath = v; };
  const setActive = (name) => {
    const key = name === 'expdetail' ? 'explist' : name;
    stepEls.forEach((b) => b.classList.toggle('is-on', b.dataset.pfStep === key));
  };
  const setBackdrop = (name) => { if (backdrop && screens[name]) backdrop.src = screens[name].src; };
  const updateChrome = () => {
    if (hotspot) hotspot.hidden = current !== 'explist';
    if (back) back.hidden = current !== 'expdetail';
  };

  let current = 'home', busy = false;
  Object.entries(screens).forEach(([n, el]) => clip(el, n === 'home' ? 150 : 0));
  setActive('home'); updateChrome();

  const openBar = () => { fab.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); };
  const closeBar = () => { fab.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };

  // list → detail uses a shared-element card morph, like the real app
  const SRC = { x: 4.5, y: 40, w: 91, h: 19 };   // role card in the list
  const DST = { x: 3.5, y: 17.5, w: 93, h: 19 };  // role card in the detail header
  function sharedToDetail() {
    busy = true;
    current = 'expdetail'; closeBar(); setActive('expdetail'); setBackdrop('expdetail'); updateChrome();
    const det = screens.expdetail, list = screens.explist, scr = det.parentElement;
    const rect = scr.getBoundingClientRect();
    Object.values(screens).forEach((s) => (s.style.zIndex = '1'));
    det.style.zIndex = '2'; clip(det, 150); gsap.set(det, { autoAlpha: 0 });
    fly.style.left = DST.x + '%'; fly.style.top = DST.y + '%'; fly.style.width = DST.w + '%'; fly.style.height = DST.h + '%';
    fly.hidden = false;
    const tx = (SRC.x - DST.x) / 100 * rect.width, ty = (SRC.y - DST.y) / 100 * rect.height;
    gsap.set(fly, { transformOrigin: 'top left', x: tx, y: ty, scaleX: SRC.w / DST.w, scaleY: SRC.h / DST.h, autoAlpha: 1 });
    gsap.timeline({ onComplete: () => { fly.hidden = true; gsap.set(det, { clearProps: 'opacity,visibility' }); clip(list, 0); busy = false; } })
      .to(fly, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.62, ease: 'power3.inOut' }, 0)
      .to(det, { autoAlpha: 1, duration: 0.34, ease: 'power2.out' }, 0.34)
      .to(fly, { autoAlpha: 0, duration: 0.22, ease: 'power2.out' }, 0.52);
  }

  function go(target) {
    if (target === current || busy || !screens[target]) return;
    if (target === 'expdetail' && current === 'explist' && fly && !reduced) { sharedToDetail(); return; }
    const nxt = screens[target], prev = current;
    current = target; closeBar(); setActive(target); setBackdrop(target);
    // keep the screen z-index bounded (1–2) so it never climbs over the FAB (z-5)
    Object.values(screens).forEach((s) => (s.style.zIndex = '1'));
    nxt.style.zIndex = '2';
    if (reduced) { clip(nxt, 150); clip(screens[prev], 0); updateChrome(); return; }
    busy = true;
    const p = { r: 0 };
    clip(nxt, 0);
    gsap.to(p, {
      r: 150, duration: 0.72, ease: 'power3.inOut',
      onUpdate: () => clip(nxt, p.r),
      onComplete: () => { clip(screens[prev], 0); busy = false; updateChrome(); },
    });
  }

  toggle.addEventListener('click', () => (fab.classList.contains('is-open') ? closeBar() : openBar()));
  bar.querySelectorAll('[data-pf-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.pfGo)));
  stepEls.forEach((b) => b.addEventListener('click', () => go(b.dataset.pfStep)));
  if (hotspot) hotspot.addEventListener('click', () => go('expdetail'));
  if (back) back.addEventListener('click', () => go('explist'));

  if (reduced) return;
  // Invite interaction: open the menu once when it scrolls into view.
  ScrollTrigger.create({ trigger: stage, start: 'top 66%', once: true, onEnter: () => gsap.delayedCall(0.5, openBar) });
}
