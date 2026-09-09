import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, projectDetails } from './data/projects.js';
import { initHeaderWave } from './modules/headerWave.js';
import { initLiquidWarp } from './modules/liquidWarp.js';
import { initSound } from './modules/sound.js';

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(window.location.search);
const project = projects.find((item) => item.id === params.get('project')) || projects[0];
const detail = projectDetails[project.id];
const currentIndex = projects.findIndex((item) => item.id === project.id);
const next = projects[(currentIndex + 1) % projects.length];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');

const phoneFrame = (media, className = '') => `
  <div class="device ${className}">
    <span class="device__speaker" aria-hidden="true"></span>
    <div class="device__screen">${media}</div>
  </div>`;

function weatherVisual() {
  const states = [
    ['clear', 'Clear', './images/projects/aether/home.png'],
    ['rain', 'Rain', './images/projects/aether/rain.png'],
    ['snow', 'Snow', './images/projects/aether/snow.png'],
    ['starry', 'Starry', './images/projects/aether/starry.png'],
  ];
  return `
    <div class="weather-stage is-rain" data-weather-stage>
      <div class="weather-atmosphere" aria-hidden="true" data-weather-atmosphere></div>
      <div class="weather-stage__copy"><span>LIVE SCENE / <b data-weather-label>RAIN</b></span><p>Real app capture<br />with a responsive atmosphere.</p></div>
      ${phoneFrame('<img src="./images/projects/aether/rain.png" alt="Aether Android app showing the rainy weather scene" data-weather-screen />', 'device--weather')}
      <div class="weather-picker" role="group" aria-label="Aether weather scene">
        ${states.map(([id, label, src]) => `<button type="button" data-weather="${id}" data-src="${src}" aria-pressed="${id === 'rain'}"><i aria-hidden="true"></i>${label}</button>`).join('')}
      </div>
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

function hierarchyVisual() {
  return `
    <div class="system-stage system-stage--hierarchy">
      <div class="kpi-map" aria-label="Diagram of the Tiger KPI organisation hierarchy">
        <div class="kpi-node kpi-node--root"><span>ORGANISATION</span><b>84.2</b><i>ROLLED-UP SCORE</i></div>
        <div class="kpi-branches" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="kpi-teams">
          <div><span>PRODUCT</span><b>91</b><i>APPROVED</i></div>
          <div><span>OPERATIONS</span><b>82</b><i>IN REVIEW</i></div>
          <div><span>DELIVERY</span><b>79</b><i>LOCKED</i></div>
        </div>
        <div class="kpi-pulse" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      </div>
      <p class="system-stage__key">SYSTEM MAP <span>HIERARCHY / APPROVALS / LIVE RECALCULATION</span></p>
    </div>`;
}

function projectVisual() {
  if (detail.visual === 'weather') return weatherVisual();
  if (detail.visual === 'portfolio') return portfolioVisual();
  if (detail.visual === 'network') return networkVisual();
  if (detail.visual === 'layers') return layersVisual();
  return hierarchyVisual();
}

function render() {
  document.title = `${project.title} — Phyo Aung Zaw`;
  document.body.dataset.project = project.id;
  document.getElementById('project-header-index').textContent = `${project.index} / ${String(projects.length).padStart(2, '0')}`;
  document.getElementById('project-header-name').textContent = project.title;

  document.getElementById('project-content').innerHTML = `
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
    </section>

    <section class="case-overview" id="overview">
      <p class="case-label">01 / CONTEXT</p>
      <div class="case-overview__copy"><h2>${detail.intro}</h2></div>
      <dl class="case-facts">
        ${detail.facts.map(([value, label]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}
      </dl>
    </section>

    <section class="case-showcase">
      <header><span>02 / PRODUCT VIEW</span><p>${detail.mediaNote}</p></header>
      ${projectVisual()}
    </section>

    <section class="case-statement">
      <p>03 / PRINCIPLE</p>
      <blockquote>${detail.statement}</blockquote>
    </section>

    <section class="case-contribution">
      <div class="case-contribution__head"><p>04 / CONTRIBUTION</p><h2>The work<br /><em>behind the screen.</em></h2></div>
      <div class="case-contribution__rows">
        ${detail.contributions.map(([number, title, copy]) => `<article><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}
      </div>
      ${detail.links.length ? `<div class="case-links">${detail.links.map(([label, href]) => `<a href="${href}" target="_blank" rel="noreferrer">${label} <span>↗</span></a>`).join('')}</div>` : ''}
    </section>

    <a class="next-project" href="${next.href}">
      <span>NEXT PROJECT / ${next.index}</span><h2>${next.title}</h2><b>CONTINUE ↗</b>
    </a>
    <footer class="project-footer"><span>PHYO AUNG ZAW © 2026</span><a href="mailto:phyoaz14@gmail.com">PHYOAZ14@GMAIL.COM ↗</a></footer>`;
}

function populateAtmosphere(stage, state) {
  const atmosphere = stage.querySelector('[data-weather-atmosphere]');
  if (!atmosphere) return;
  atmosphere.textContent = '';
  if (state === 'clear') return;
  const amount = state === 'starry' ? 52 : 42;
  for (let index = 0; index < amount; index += 1) {
    const particle = document.createElement('i');
    particle.style.setProperty('--x', `${(index * 37 + 11) % 101}%`);
    particle.style.setProperty('--y', `${(index * 53 + 7) % 96}%`);
    particle.style.setProperty('--delay', `${-((index * 0.17) % 3.4)}s`);
    particle.style.setProperty('--duration', `${1.15 + (index % 7) * 0.16}s`);
    particle.style.setProperty('--size', `${2 + (index % 5)}px`);
    atmosphere.appendChild(particle);
  }
}

function setupWeather() {
  const stage = document.querySelector('[data-weather-stage]');
  if (!stage) return;
  const screen = stage.querySelector('[data-weather-screen]');
  const label = stage.querySelector('[data-weather-label]');
  const setState = (button) => {
    const state = button.dataset.weather;
    stage.className = `weather-stage is-${state}`;
    screen.src = button.dataset.src;
    screen.alt = `Aether Android app showing the ${button.textContent.trim().toLowerCase()} weather scene`;
    label.textContent = button.textContent.trim().toUpperCase();
    stage.querySelectorAll('[data-weather]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    if (!reduced) populateAtmosphere(stage, state);
  };
  stage.querySelectorAll('[data-weather]').forEach((button) => button.addEventListener('click', () => setState(button)));
  if (!reduced) populateAtmosphere(stage, 'rain');
}

function setupMotion() {
  if (reduced) return;
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.case-hero__meta span', { autoAlpha: 0, y: 15, duration: .8, stagger: .08 }, .15)
    .from('.case-hero__title > *', { autoAlpha: 0, y: 46, duration: 1.15, stagger: .12 }, .28)
    .from('.case-hero__scroll', { autoAlpha: 0, y: 16, duration: .8 }, .72);
  gsap.to('.case-hero__wash i:first-child', { xPercent: 12, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  document.querySelectorAll('.case-overview__copy, .case-facts, .case-showcase > header, .case-showcase > :last-child, .case-statement blockquote, .case-contribution__head').forEach((element) => {
    gsap.from(element, { autoAlpha: 0, y: 42, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 82%' } });
  });
  document.querySelectorAll('.case-contribution__rows article').forEach((element, index) => {
    gsap.from(element, { autoAlpha: 0, y: 30, duration: .9, delay: index * .06, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%' } });
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
  setupWeather();
  setupMotion();
  setupNavigation();
  initLiquidWarp();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

boot();
