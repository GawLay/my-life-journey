import { places } from '../data/places.js';
import Globe from '../gl/Globe.js';

function cityList(place) {
  return place.cities.split(' / ').map((city) => city.trim());
}

function updateJournal(place) {
  const index = places.findIndex((item) => item.id === place.id) + 1;
  const cities = cityList(place);
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('journal-index', `${String(index).padStart(2, '0')} / ${String(places.length).padStart(2, '0')} · ${place.country.toUpperCase()}`);
  const title = document.getElementById('journal-title');
  if (title) title.innerHTML = `${place.country}<br /><em>${place.year}</em>`;
  setText('journal-when', place.year === 'NOW' ? 'CURRENT CHAPTER' : place.year);
  setText('journal-route', place.cities);
  setText('journal-coordinates', place.coordinates.replace(' / ', '\n'));
  setText('journal-photo-one', `${cities[0]} · BLUE HOUR`);
  setText('journal-city-one', `01 / ${cities[0]}`);
  setText('journal-memory', `“${place.note}”`);
  setText('journal-photo-two', `${cities[1] || cities[0]} · 06:42`);
  setText('journal-location-note', place.coordinates);
  setText('journal-city-three', `${cities[2] || cities[1] || cities[0]}\nFIELD NOTES`);
  setText('journal-photo-three', `${cities[2] || cities[0]} · AFTER RAIN`);
}

export function initStory({ reduced = false } = {}) {
  const mount = document.getElementById('story-globe');
  const panel = document.getElementById('story-panel');
  const nav = document.getElementById('story-nav');
  const stage = document.getElementById('atlas-stage');
  if (!mount || !panel || !nav || !stage) return null;

  let current = null;
  let enteringTimer = 0;
  let globe;

  const renderOverview = () => {
    panel.innerHTML = `
      <span class="atlas-overview__index">WORLD / 05 CHAPTERS</span>
      <h4 class="atlas-overview__title">Choose a<br />country.</h4>
      <p class="atlas-overview__copy">The warm regions are places that became part of the story. Select one to bring its photographs and details into view.</p>`;
  };

  const updateFragments = (place) => {
    const labels = stage.querySelectorAll('.atlas-fragment b');
    const cities = cityList(place);
    const values = [
      `${place.country.toUpperCase()} / ${place.year}`,
      `${cities[0]} / FIELD NOTE`,
      `${cities[1] || cities[0]} / AFTER RAIN`,
      `${cities[2] || cities[0]} / BLUE HOUR`,
    ];
    labels.forEach((label, index) => { label.textContent = values[index]; });
    stage.classList.remove('has-country');
    requestAnimationFrame(() => stage.classList.add('has-country'));
  };

  const clearSelection = () => {
    current = null;
    stage.classList.remove('has-country');
    nav.querySelectorAll('[data-place]').forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
    globe?.setActive(null);
    renderOverview();
  };

  const renderPanel = (place) => {
    const index = places.findIndex((item) => item.id === place.id) + 1;
    panel.innerHTML = `
      <span class="country-detail__count">${String(index).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}</span>
      <h4 class="country-detail__name">${place.country}</h4>
      <span class="country-detail__year">${place.year}</span>
      <p class="country-detail__cities">${place.cities}</p>
      <p class="country-detail__note">${place.note}</p>
      <div class="country-detail__stats"><span>${String(place.photos).padStart(2, '0')} PHOTOS</span><span>${String(place.stories).padStart(2, '0')} STORIES</span></div>
      <div class="country-detail__actions"><button class="country-detail__explore" type="button">Explore chapter ↗</button><button class="country-detail__back" type="button">Back to world</button></div>`;

    panel.querySelector('.country-detail__explore')?.addEventListener('click', () => {
      updateJournal(place);
      stage.classList.add('is-entering');
      clearTimeout(enteringTimer);
      enteringTimer = window.setTimeout(() => {
        document.getElementById('journal')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        window.setTimeout(() => stage.classList.remove('is-entering'), reduced ? 0 : 900);
      }, reduced ? 0 : 650);
    });
    panel.querySelector('.country-detail__back')?.addEventListener('click', clearSelection);
  };

  const select = (id, shouldFocus = true) => {
    const place = places.find((item) => item.id === id);
    if (!place) return;
    current = place;
    renderPanel(place);
    updateFragments(place);
    nav.querySelectorAll('[data-place]').forEach((button) => {
      const active = button.dataset.place === id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (shouldFocus) globe?.focus(id);
    else globe?.setActive(place.iso);
  };

  nav.innerHTML = places.map((place, index) => `
    <button class="atlas__country" type="button" data-place="${place.id}" aria-pressed="false">
      <span>${String(index + 1).padStart(2, '0')} / ${place.year}</span><b>${place.country}</b>
    </button>`).join('');
  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-place]');
    if (button) select(button.dataset.place, true);
  });

  globe = new Globe(mount, {
    places,
    reduced,
    onSelect: (id) => select(id, true),
  });

  renderOverview();
  updateJournal(places.find((place) => place.id === 'japan') || places[0]);
  return { globe, mount, getCurrent: () => current };
}
