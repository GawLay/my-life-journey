import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, projectDetails } from './data/projects.js';
import { initHeaderWave } from './modules/headerWave.js';
import { initLiquidWarp } from './modules/liquidWarp.js';
import { initSound } from './modules/sound.js';
import { initAetherWeather } from './modules/aetherWeather.js';

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(window.location.search);
const project = projects.find((item) => item.id === params.get('project')) || projects[0];
const detail = projectDetails[project.id];
const currentIndex = projects.findIndex((item) => item.id === project.id);
const next = projects[(currentIndex + 1) % projects.length];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');

const AETHER_INITIAL = 'rain';

const phoneFrame = (media, className = '') => `
  <div class="device ${className}">
    <span class="device__speaker" aria-hidden="true"></span>
    <div class="device__screen">${media}</div>
  </div>`;

const maybe = (html) => html || '';

// ---- Per-project showcase visuals -------------------------------------------

const WX_ICONS = {
  sunny: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4"/></svg>',
  cloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.8 3.8 0 0 1 17.5 18Z"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.8 3.8 0 0 1 17.5 15Z"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 14a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.8 3.8 0 0 1 17.5 14Z"/><path d="M9 18h.01M12 20h.01M15 18h.01"/></svg>',
  storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 14a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.8 3.8 0 0 1 17.5 14Z"/><path d="M12 15l-2 3.5h3L11 22"/></svg>',
  night: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A7.5 7.5 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z"/></svg>',
};

function weatherSwitcher() {
  const states = [['sunny', 'Sunny'], ['cloudy', 'Cloudy'], ['rain', 'Rain'], ['snow', 'Snow'], ['storm', 'Storm'], ['night', 'Night']];
  return `
    <div class="aether-switch" data-aether-switch role="group" aria-label="Aether weather scene">
      <span class="aether-switch__live" aria-hidden="true">SCENE</span>
      ${states.map(([id, name]) => `
        <button type="button" data-weather="${id}" aria-pressed="${id === AETHER_INITIAL}">
          <span class="aether-switch__ic" aria-hidden="true">${WX_ICONS[id]}</span><b>${name}</b>
        </button>`).join('')}
    </div>`;
}

function weatherVisual() {
  return `
    <div class="aether-showcase">
      <div class="aether-showcase__copy">
        <span>LIVE SCENE / <b data-aether-scene-label>RAIN</b></span>
        <p>Real Android capture, held inside the same weather the page is showing. Try another scene — the whole screen changes with it.</p>
      </div>
      ${phoneFrame(`<img src="./images/projects/aether/rain.png" alt="Aether Android app in the rain scene" data-aether-screen />`, 'device--weather')}
      <p class="aether-showcase__hint" aria-hidden="true">CURRENT / <span data-aether-readout>Rain</span></p>
    </div>`;
}

function portfolioVisual() {
  return `
    <div class="portfolio-stage">
      <div class="portfolio-stage__caption"><span>01 / PROFILE</span><p>A personal introduction that opens into the work.</p></div>
      ${phoneFrame('<img src="./images/projects/portfolio/home.png" alt="Portfolio Android app home screen" />', 'device--portfolio-home')}
      ${phoneFrame('<video src="./images/projects/portfolio/transition.mp4" poster="./images/projects/portfolio/experience.png" aria-label="Recorded Portfolio app section transition" muted loop playsinline autoplay></video>', 'device--portfolio-motion')}
      <p class="portfolio-stage__motion-label">02 / TRANSITION<br /><span>REAL EMULATOR RECORDING</span></p>
    </div>`;
}

function networkVisual() {
  return `
    <div class="system-stage system-stage--network">
      <div class="network-map" aria-label="Diagram of the TrueMoney Agent service network">
        <span class="network-map__ring network-map__ring--one"></span><span class="network-map__ring network-map__ring--two"></span>
        <div class="network-map__core"><small>AGENT APP</small><strong>23K</strong><span>LOCAL AGENTS</span></div>
        <i style="--x:15%;--y:23%">REMIT</i><i style="--x:76%;--y:18%">TOP UP</i><i style="--x:82%;--y:69%">BILL PAY</i><i style="--x:14%;--y:75%">CASH</i>
      </div>
      <p class="system-stage__key">PUBLIC PRODUCT FOOTPRINT <span>TRANSACTIONS / CUSTOMERS / SERVICES</span></p>
    </div>`;
}

function layersVisual() {
  return `
    <div class="system-stage system-stage--layers">
      <div class="architecture-stack" aria-label="Diagram of the MAB Mobile engineering layers">
        <div><span>04</span><b>TRUSTED INTERFACE</b><i>CLEAR TRANSACTION STATES</i></div>
        <div><span>03</span><b>DOMAIN</b><i>USE CASES / BUSINESS RULES</i></div>
        <div><span>02</span><b>REPOSITORY</b><i>TESTABLE DATA BOUNDARIES</i></div>
        <div><span>01</span><b>SECURE NETWORK</b><i>HARDENED TRANSPORT</i></div>
      </div>
      <p class="system-stage__key">ENGINEERING VIEW <span>MAINTAINABILITY BUILDS PRODUCT CONFIDENCE</span></p>
    </div>`;
}

function journeyVisual() {
  const steps = ['Browse', 'Order', 'Preparing', 'Pickup', 'Delivering', 'Delivered'];
  return `
    <div class="system-stage system-stage--journey">
      <div class="journey-map" aria-label="Diagram of the Beehive order journey">
        ${steps.map((s, i) => `<div class="journey-node"><span>0${i + 1}</span><b>${s}</b></div>`).join('<i class="journey-link" aria-hidden="true"></i>')}
      </div>
      <p class="system-stage__key">ORDER LIFECYCLE <span>CUSTOMER / BIKER — ONE ECOSYSTEM</span></p>
    </div>`;
}

function projectVisual() {
  if (detail.visual === 'weather') return weatherVisual();
  if (detail.visual === 'portfolio') return portfolioVisual();
  if (detail.visual === 'network') return networkVisual();
  if (detail.visual === 'layers') return layersVisual();
  return journeyVisual();
}

// ---- Section builders -------------------------------------------------------

const heroSection = () => `
  <section class="case-hero" aria-labelledby="case-title">
    <div class="case-hero__wash" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="case-hero__meta">
      <span>${project.eyebrow}</span><span>${detail.period}</span><span>${detail.location}</span>
    </div>
    <div class="case-hero__title">
      <p>${detail.role}</p>
      <h1 id="case-title">${project.title}</h1>
      <em>${project.subtitle}</em>
    </div>
    <a class="case-hero__scroll" href="#overview"><span>CASE STUDY / ${project.index}</span><b>SCROLL TO EXPLORE ↓</b></a>
  </section>`;

const overviewSection = () => `
  <section class="case-overview" id="overview">
    <p class="case-label">01 / CONTEXT</p>
    <div class="case-overview__copy"><h2>${detail.intro}</h2></div>
    <dl class="case-facts">
      ${detail.facts.map(([value, label]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}
    </dl>
  </section>`;

const showcaseSection = () => `
  <section class="case-showcase">
    <header><span>02 / PRODUCT VIEW</span><p>${detail.mediaNote}</p></header>
    ${projectVisual()}
  </section>`;

const flowsSection = () => maybe(detail.flows && `
  <section class="case-flows">
    <div class="case-flows__head"><p class="case-label">03 / PRODUCT FLOWS</p><h2>${detail.flowsTitle || 'What it does.'}</h2></div>
    <div class="case-flows__rows">
      ${detail.flows.map(([num, title, copy]) => `<article><span>${num}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}
    </div>
  </section>`);

const statementSection = () => `
  <section class="case-statement">
    <p>${detail.flows ? '04' : '03'} / PRINCIPLE</p>
    <blockquote>${detail.statement}</blockquote>
  </section>`;

const contributionSection = () => `
  <section class="case-contribution">
    <div class="case-contribution__head"><p>${detail.flows ? '05' : '04'} / CONTRIBUTION</p><h2>The work<br /><em>behind the screen.</em></h2></div>
    <div class="case-contribution__rows">
      ${detail.contributions.map(([number, title, copy]) => `<article><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}
    </div>
    ${detail.links.length ? `<div class="case-links">${detail.links.map(([label, href]) => `<a href="${href}" target="_blank" rel="noreferrer">${label} <span>↗</span></a>`).join('')}</div>` : ''}
  </section>`;

const techSection = () => maybe(detail.tech && `
  <section class="case-tech">
    <div class="case-tech__head"><p class="case-label">06 / TECHNICAL HIGHLIGHTS</p></div>
    <div class="case-tech__grid">
      ${detail.tech.map(([label, copy]) => `<article><h3>${label}</h3><p>${copy}</p></article>`).join('')}
    </div>
  </section>`);

const outcomeSection = () => maybe(detail.outcome && `
  <section class="case-outcome">
    <p class="case-label">07 / WHAT I LEARNED</p>
    <div class="case-outcome__copy"><h2>${detail.outcome.lead}</h2><p>${detail.outcome.copy}</p></div>
  </section>`);

const navFooter = () => `
  <a class="next-project" href="${next.href}">
    <span>NEXT PROJECT / ${next.index}</span><h2>${next.title}</h2><b>CONTINUE ↗</b>
  </a>
  <footer class="project-footer"><span>PHYO AUNG ZAW © 2026</span><a href="mailto:phyoaz14@gmail.com">PHYOAZ14@GMAIL.COM ↗</a></footer>`;

function render() {
  document.title = `${project.title} — Phyo Aung Zaw`;
  document.body.dataset.project = project.id;
  document.getElementById('project-header-index').textContent = `${project.index} / ${String(projects.length).padStart(2, '0')}`;
  document.getElementById('project-header-name').textContent = project.title;

  document.getElementById('project-content').innerHTML = [
    heroSection(), overviewSection(), showcaseSection(), flowsSection(),
    statementSection(), contributionSection(), techSection(), outcomeSection(),
    navFooter(),
    project.id === 'aether' ? weatherSwitcher() : '',
  ].join('');
}

function setupMotion() {
  if (reduced) return;
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.case-hero__meta span', { autoAlpha: 0, y: 15, duration: .8, stagger: .08 }, .15)
    .from('.case-hero__title > *', { autoAlpha: 0, y: 46, duration: 1.15, stagger: .12 }, .28)
    .from('.case-hero__scroll', { autoAlpha: 0, y: 16, duration: .8 }, .72);
  gsap.to('.case-hero__wash i:first-child', { xPercent: 12, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  document.querySelectorAll('.case-overview__copy, .case-facts, .case-showcase > header, .case-showcase > :last-child, .case-flows__head, .case-statement blockquote, .case-contribution__head, .case-tech__head, .case-outcome__copy').forEach((element) => {
    gsap.from(element, { autoAlpha: 0, y: 42, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 82%' } });
  });
  document.querySelectorAll('.case-contribution__rows article, .case-flows__rows article, .case-tech__grid article').forEach((element, index) => {
    gsap.from(element, { autoAlpha: 0, y: 30, duration: .9, delay: (index % 3) * .06, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%' } });
  });
}

function setupNavigation() {
  const transition = document.querySelector('.project-transition');
  document.querySelectorAll('a[href^="./"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (reduced || event.metaKey || event.ctrlKey) return;
      event.preventDefault();
      transition.classList.add('is-active');
      window.setTimeout(() => window.location.assign(link.href), 650);
    });
  });
  window.addEventListener('pageshow', () => transition.classList.remove('is-active'));
}

async function boot() {
  render();
  try { await document.fonts.ready; } catch (_) { /* non-critical */ }
  initHeaderWave();
  initSound();
  if (project.id === 'aether') initAetherWeather(AETHER_INITIAL);
  setupMotion();
  setupNavigation();
  initLiquidWarp();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

boot();
