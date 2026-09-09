import { projects } from '../data/projects.js';
import { screenSVG } from './appScreens.js';

function projectVisual(project) {
  const screen = project.image
    ? `<img src="${project.image}" alt="${project.title} interface" loading="lazy" />`
    : screenSVG(project.screen, project.tint);

  return `
    <a class="project__visual" href="${project.href}" style="--surface:${project.surface}" data-caption="PROJECT VIEW / ${project.year}" aria-label="Explore ${project.title}">
      <span class="project__orbit" aria-hidden="true"></span>
      <span class="project__phone"><span class="project__screen">${screen}</span></span>
    </a>`;
}

function projectCard(project) {
  const total = String(projects.length).padStart(2, '0');
  return `
    <article class="project project--${project.layout}" data-project>
      <div class="project__content">
        <span class="project__index">${project.index} / ${total}</span>
        <p class="project__eyebrow">${project.eyebrow}</p>
        <h3 class="project__title">${project.title}</h3>
        <p class="project__subtitle">${project.subtitle}</p>
        <p class="project__description">${project.description}</p>
        <div class="project__meta"><span>${project.tags.join(' / ')}</span><span>${project.year}</span></div>
        <a class="project__link" href="${project.href}">Explore project ↗</a>
      </div>
      ${projectVisual(project)}
    </article>`;
}

export function renderWork() {
  const mount = document.getElementById('work-list');
  if (mount) mount.innerHTML = projects.map(projectCard).join('');
}
