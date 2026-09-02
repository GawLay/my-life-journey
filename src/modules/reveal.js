import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitChars, splitWords, splitLines } from './split.js';

/**
 * Sets up all scroll-driven reveals + returns a `playIntro()` for the hero,
 * which is triggered once the preloader lifts.
 */
export function setupReveals({ reduced }) {
  if (reduced) return { playIntro() {} };

  const EXPO = 'expo.out';

  /* ---------------- HERO (played after preloader) ---------------- */
  const heroEyebrow = document.querySelector('.hero__eyebrow');
  const heroFolio = document.querySelector('.hero__folio');
  const heroChars = [];
  document.querySelectorAll('.hero__title .line').forEach((line) => {
    heroChars.push(...splitChars(line));
  });
  const heroLede = document.querySelector('.hero__lede');
  const ledeLines = heroLede ? splitLines(heroLede) : [];
  const heroScroll = document.querySelector('.hero__scroll');
  const heroCanvas = document.getElementById('hero-canvas');

  gsap.set(heroChars, { yPercent: 118 });
  gsap.set(ledeLines, { yPercent: 110 });
  gsap.set([heroEyebrow, heroFolio, heroScroll], { autoAlpha: 0, y: 20 });
  gsap.set(heroCanvas, { autoAlpha: 0 });

  function playIntro() {
    const tl = gsap.timeline({ defaults: { ease: EXPO } });
    tl.to(heroCanvas, { autoAlpha: 1, duration: 1.6, ease: 'power2.out' }, 0)
      .to([heroEyebrow, heroFolio], { autoAlpha: 1, y: 0, duration: 1 }, 0.15)
      .to(heroChars, { yPercent: 0, duration: 1.25, stagger: 0.035 }, 0.2)
      .to(ledeLines, { yPercent: 0, duration: 1, stagger: 0.08 }, 0.7)
      .to(heroScroll, { autoAlpha: 1, y: 0, duration: 1 }, 0.9);
    return tl;
  }

  /* ---------------- Section titles (mask reveal) ---------------- */
  document.querySelectorAll('[data-reveal="mask"]').forEach((el) => {
    const type = el.dataset.split;
    let targets;
    if (type === 'lines') {
      targets = splitLines(el);
    } else {
      targets = splitWords(el);
      el.style.overflow = 'hidden';
    }
    gsap.set(targets, { yPercent: type === 'lines' ? 110 : 118 });
    gsap.to(targets, {
      yPercent: 0,
      duration: 1.1,
      ease: EXPO,
      stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  /* ---------------- Fade-ups (skip hero, handled above) --------- */
  document.querySelectorAll('[data-reveal="fade"]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.set(el, { autoAlpha: 0, y: 24 });
    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  /* ---------------- Capability rows ---------------------------- */
  const rows = gsap.utils.toArray('[data-reveal="row"]');
  gsap.set(rows, { autoAlpha: 0, y: 30 });
  ScrollTrigger.batch(rows, {
    start: 'top 90%',
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
      }),
  });

  /* ---------------- Projects ----------------------------------- */
  document.querySelectorAll('[data-project]').forEach((card) => {
    const stage = card.querySelector('.project__stage');
    const glow = card.querySelector('.project__glow');
    const titleSpan = card.querySelector('.project__title span');
    const meta = card.querySelector('.project__meta');
    const chars = titleSpan ? splitChars(titleSpan) : [];

    gsap.set(stage, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(glow, { scale: 1.25 });
    gsap.set(chars, { yPercent: 110 });
    gsap.set(meta, { autoAlpha: 0 });

    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%' } });
    tl.to(stage, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EXPO }, 0)
      .to(glow, { scale: 1, duration: 1.5, ease: EXPO }, 0)
      .to(chars, { yPercent: 0, duration: 0.9, ease: EXPO, stagger: 0.02 }, 0.3)
      .to(meta, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0.45);
  });

  /* ---------------- Contact headline --------------------------- */
  const contactChars = [];
  document.querySelectorAll('.contact__big .line').forEach((line) => {
    contactChars.push(...splitChars(line));
  });
  gsap.set(contactChars, { yPercent: 118 });
  gsap.to(contactChars, {
    yPercent: 0,
    duration: 1.15,
    ease: EXPO,
    stagger: 0.03,
    scrollTrigger: { trigger: '.contact', start: 'top 60%' },
  });

  /* ---------------- Counters ----------------------------------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = Math.round(obj.v)),
        }),
    });
  });

  /* ---------------- Marquee parallax --------------------------- */
  const track = document.getElementById('marquee-track');
  if (track) {
    gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.marquee',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }

  return { playIntro };
}
