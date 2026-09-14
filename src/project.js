import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, projectDetails } from './data/projects.js';
import { initHeaderWave } from './modules/headerWave.js';
import { initLiquidWarp } from './modules/liquidWarp.js';
import { initSound } from './modules/sound.js';
import { initAetherWeather } from './modules/aetherWeather.js';
import { initPortfolioMotion } from './modules/portfolioMotion.js';
import { initTruemoneyNetwork } from './modules/truemoneyMotion.js';
import { initBeehiveJourney } from './modules/beehiveMotion.js';

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(window.location.search);
const project = projects.find((item) => item.id === params.get('project')) || projects[0];
const detail = projectDetails[project.id];
const currentIndex = projects.findIndex((item) => item.id === project.id);
const next = projects[(currentIndex + 1) % projects.length];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');

const AETHER_INITIAL = 'rain';
// Set by project.html's head script when arriving from the work list or a sibling
// project: the page paints under the charcoal cover, which we iris open on load.
const projectEntering = !reduced && document.documentElement.classList.contains('is-project-entering');

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
        <p>Real Android capture, held inside the same weather the page is showing. Try another scene. The whole screen changes with it.</p>
      </div>
      ${phoneFrame(`<img src="./images/projects/aether/rain.png" alt="Aether Android app in the rain scene" data-aether-screen />`, 'device--weather')}
      <p class="aether-showcase__hint" aria-hidden="true">CURRENT / <span data-aether-readout>Rain</span></p>
    </div>`;
}

const PF_ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/></svg>',
  skill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l2.3 5.6L20 9l-4.4 3.9L17 19l-5-3.4L7 19l1.4-6.1L3 9l5.7-.4z"/></svg>',
  explist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5h8v2"/></svg>',
  resume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
};

function portfolioVisual() {
  const nav = [['home', 'Home'], ['skill', 'Skill'], ['explist', 'Experience'], ['resume', 'Resume']];
  const steps = [['home', 'Home'], ['skill', 'Skill'], ['explist', 'Experience'], ['resume', 'Résumé']];
  const file = { home: 'about', skill: 'skill', explist: 'experience', expdetail: 'experience-detail', resume: 'resume' };
  const screen = (id, alt) => `<img class="pf-scr" data-screen="${id}" src="./images/projects/portfolio/${file[id]}.png" alt="Portfolio app: ${alt}" />`;
  return `
    <div class="pf-stage" data-pf-stage>
      <img class="pf-backdrop" data-pf-backdrop src="./images/projects/portfolio/about.png" alt="" aria-hidden="true" />
      <div class="pf-side">
        <div class="pf-intro">
          <span>02 / EXPLORE THE APP</span>
          <p>The résumé app moves like a product. Open the menu and step between its pages: each change plays the app’s own circular reveal, the same clip-path motion this site uses between its own pages.</p>
        </div>
        <div class="pf-steps" data-pf-steps role="group" aria-label="App pages">${steps.map(([id, label]) => `<button type="button" data-pf-step="${id}">${label}</button>`).join('<i aria-hidden="true"></i>')}</div>
        <p class="pf-tag">RECREATED FROM THE REAL APP</p>
      </div>
      <div class="device device--pf" data-pf-phone>
        <span class="device__speaker" aria-hidden="true"></span>
        <div class="device__screen">
          ${screen('home', 'home card')}
          ${screen('skill', 'skills grid')}
          ${screen('explist', 'experience list')}
          ${screen('expdetail', 'experience detail')}
          ${screen('resume', 'résumé detail')}
          <button class="pf-hotspot" type="button" data-pf-open-detail hidden>View role →</button>
          <button class="pf-back" type="button" data-pf-back hidden>← Experiences</button>
          <div class="pf-flycard" data-pf-fly hidden style="background-image:url('./images/projects/portfolio/role-card.png')"></div>
          <div class="pf-fab" data-pf-fab>
            <nav class="pf-fab__bar" data-pf-bar aria-label="App sections">
              ${nav.map(([id, label]) => `<button type="button" data-pf-go="${id}">${PF_ICONS[id]}<b>${label}</b></button>`).join('')}
            </nav>
            <button class="pf-fab__toggle" type="button" data-pf-toggle aria-expanded="false" aria-label="Open sections menu"><span></span></button>
          </div>
        </div>
      </div>
    </div>`;
}

// No private screens to show, so the system is the hero: transactions stream
// from the 23K-agent core out along four service spokes; selecting one traces
// its path. Pulses + selection live in modules/truemoneyMotion.js.
const TM_SERVICES = [
  ['remit', 'Remittance', 'Domestic transfers moved agent-to-agent across the country.', 15, 23],
  ['topup', 'Mobile top-up', 'Airtime and data for every operator, settled at the counter.', 76, 18],
  ['billpay', 'Bill payment', 'Utilities and everyday services paid in one place.', 82, 69],
  ['cash', 'Cash in / out', 'The counter that turns digital value into cash and back.', 14, 75],
];

function networkVisual() {
  const first = TM_SERVICES[0];
  const spokes = TM_SERVICES.map(([id, , , x, y]) => `<line class="tm-spoke" data-spoke="${id}" x1="50" y1="50" x2="${x}" y2="${y}" />`).join('');
  const nodes = TM_SERVICES.map(([id, name, desc, x, y]) => `
        <button type="button" class="tm-node" data-tm-node="${id}" data-name="${name}" data-desc="${desc}" style="--x:${x}%;--y:${y}%" aria-pressed="false">
          <span class="tm-node__dot" aria-hidden="true"></span><b>${name}</b>
        </button>`).join('');
  return `
    <div class="system-stage system-stage--network">
      <div class="tm-network" data-tm-network role="group" aria-label="Live diagram of the TrueMoney agent service network">
        <svg class="tm-wires" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <circle class="tm-wires__ring" cx="50" cy="50" r="45" />
          <circle class="tm-wires__ring" cx="50" cy="50" r="29" />
          <g class="tm-spokes">${spokes}</g>
          <g class="tm-pulses" data-tm-pulses></g>
        </svg>
        <div class="tm-core"><small>AGENT APP</small><strong>23K</strong><span>LOCAL AGENTS</span></div>
        ${nodes}
      </div>
      <div class="tm-readout" data-tm-readout aria-live="polite">
        <span>SERVICE / <b data-tm-index>01</b></span>
        <h3 data-tm-name>${first[1]}</h3>
        <p data-tm-desc>${first[2]}</p>
      </div>
      <p class="system-stage__key">LIVE SERVICE NETWORK <span>23,000 AGENTS · NATIONWIDE</span></p>
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

// Beehive — one order, two apps. An order token hops the honeycomb from browse
// to doorstep; the traveled path lights up and a readout names who is acting at
// each stage (customer / shop / biker). Motion + selection: modules/beehiveMotion.js
const BEE_ICONS = {
  browse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 8h12l-1 11H7z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
  order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 3h10v18l-2.5-1.6L12 21l-2.5-1.6L7 21z"/><path d="M10 8h4M10 12h4"/></svg>',
  preparing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 8l8-4 8 4-8 4z"/><path d="M4 8v8l8 4 8-4V8"/><path d="M12 12v8"/></svg>',
  pickup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="6" y="9" width="12" height="10" rx="1"/><path d="M12 9V4M9 6.5 12 4l3 2.5"/></svg>',
  delivering: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="7" cy="17" r="2.2"/><circle cx="17" cy="17" r="2.2"/><path d="M9 17h6l1.5-6H13l-1-3H8"/></svg>',
  delivered: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.4 12.4l2.6 2.6 4.6-5"/></svg>',
};
// id, name, role, description, x%, y% (a gentle honeycomb zigzag)
const BEE_STAGES = [
  ['browse', 'Browse', 'customer', 'The customer explores products, food and shops and fills a cart.', 8, 34],
  ['order', 'Order', 'customer', 'Checkout places the order: one id both apps now follow.', 24.8, 64],
  ['preparing', 'Preparing', 'shop', 'The shop confirms and prepares the items while a rider is found.', 41.6, 34],
  ['pickup', 'Pickup', 'biker', 'A biker accepts the job and collects the order from the shop.', 58.4, 64],
  ['delivering', 'Delivering', 'biker', 'The biker rides out; live status and location stream to the customer.', 75.2, 34],
  ['delivered', 'Delivered', 'customer', 'Handed over at the door, and the order closes on both sides at once.', 92, 64],
];

function journeyVisual() {
  const first = BEE_STAGES[0];
  const links = BEE_STAGES.slice(1).map(([, , , , x, y], i) => {
    const [, , , , px, py] = BEE_STAGES[i];
    return `<line class="bee-link" data-link="${i}" x1="${px}" y1="${py}" x2="${x}" y2="${y}" />`;
  }).join('');
  const hexes = BEE_STAGES.map(([id, name, role, desc, x, y], i) => `
        <button type="button" class="bee-hex is-${role}" data-bee-stage="${id}" data-name="${name}" data-role="${role}" data-desc="${desc}" style="--x:${x}%;--y:${y}%" aria-pressed="false">
          <span class="bee-hex__cell"><span class="bee-hex__ic">${BEE_ICONS[id]}</span><em>0${i + 1}</em></span>
          <b class="bee-hex__label">${name}</b>
        </button>`).join('');
  return `
    <div class="system-stage system-stage--journey">
      <div class="bee-journey" data-bee-journey role="group" aria-label="Interactive Beehive order journey">
        <svg class="bee-track" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g class="bee-track__links">${links}</g>
        </svg>
        <span class="bee-token" data-bee-token aria-hidden="true"></span>
        ${hexes}
      </div>
      <div class="bee-readout" data-bee-readout aria-live="polite">
        <span>STAGE / <b data-bee-index>01</b> · <i data-bee-role>${first[2]}</i></span>
        <h3 data-bee-name>${first[1]}</h3>
        <p data-bee-desc>${first[3]}</p>
      </div>
      <p class="system-stage__key">ONE ORDER · TWO APPS <span>CUSTOMER → SHOP → BIKER → DOOR</span></p>
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
  document.title = `${project.title} · Phyo Aung Zaw`;
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
  // when arriving under the cover, hold the hero a beat so it reveals as the iris opens
  gsap.timeline({ defaults: { ease: 'power3.out' }, delay: projectEntering ? .32 : 0 })
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
      // hand the incoming page a matching cover to iris open (work list vs. sibling project)
      try { sessionStorage.setItem('paz-entry', link.getAttribute('href').includes('index.html') ? 'work' : 'project'); } catch { /* storage unavailable */ }
      transition.classList.add('is-active');
      window.setTimeout(() => window.location.assign(link.href), 650);
    });
  });
  window.addEventListener('pageshow', () => transition.classList.remove('is-active'));
}

// Iris the charcoal cover open once the page has painted underneath it.
function revealFromCover() {
  const root = document.documentElement;
  if (!projectEntering) { root.classList.remove('is-project-entering'); return; }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-project-entering')));
}

async function boot() {
  render();
  try { await document.fonts.ready; } catch (_) { /* non-critical */ }
  initHeaderWave();
  const ambient = initSound();
  if (project.id === 'aether') initAetherWeather(AETHER_INITIAL, ambient);
  if (project.id === 'portfolio') initPortfolioMotion();
  if (project.id === 'truemoney') initTruemoneyNetwork();
  if (project.id === 'beehive') initBeehiveJourney();
  setupMotion();
  setupNavigation();
  revealFromCover();
  initLiquidWarp();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

boot();
