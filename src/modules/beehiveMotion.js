import gsap from 'gsap';

// Beehive signature: one order, two apps. The order travels the honeycomb from
// browse to doorstep — and it *becomes* what it is at each phase: a shopping cart
// while the customer chooses, a package once it's placed, then a scooter that
// bobs like it's riding for the pickup → delivered leg. The traveled links light
// up and a readout names who is acting (customer / shop / biker). It auto-advances
// (the "living" part); tapping a hex jumps the order there and dwells. Under
// reduced motion nothing travels and nothing auto-plays, but every stage is still
// selectable. Same SVG-geometry + DOM-button pattern as the TrueMoney network.
const GLYPHS = {
  cart: '<svg viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/><path d="M3 4h2l2.2 10.4a1 1 0 0 0 1 .8h7.9a1 1 0 0 0 1-.78L20 8H6.2"/></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4-8 4z"/><path d="M4 8v8l8 4 8-4V8"/><path d="M12 12v8"/></svg>',
  scooter: '<svg viewBox="0 0 24 24"><circle cx="6.5" cy="17.5" r="2.3"/><circle cx="17.5" cy="17.5" r="2.3"/><path d="M8.8 17.5h6.4l1.8-6.5H19"/><path d="M4.5 9.5H8l1.7 8"/><path d="M14.5 6H17l1.6 4.5"/></svg>',
};
// The order's form on ARRIVAL at each stage: browse/order = cart, preparing = box,
// pickup/delivering/delivered = scooter (the biker has it now).
const glyphFor = (i) => (i <= 1 ? 'cart' : i === 2 ? 'box' : 'scooter');

export function initBeehiveJourney() {
  const stage = document.querySelector('[data-bee-journey]');
  if (!stage) return;

  const hexes = [...stage.querySelectorAll('[data-bee-stage]')];
  const links = [...stage.querySelectorAll('.bee-link')];
  const token = stage.querySelector('[data-bee-token]');
  const readout = document.querySelector('[data-bee-readout]');
  const nameEl = readout && readout.querySelector('[data-bee-name]');
  const descEl = readout && readout.querySelector('[data-bee-desc]');
  const roleEl = readout && readout.querySelector('[data-bee-role]');
  const indexEl = readout && readout.querySelector('[data-bee-index]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(location.search).has('static');

  const ids = hexes.map((h) => h.dataset.beeStage);
  const coord = (h) => ({ x: parseFloat(h.style.getPropertyValue('--x')), y: parseFloat(h.style.getPropertyValue('--y')) });
  gsap.set(token, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

  let current = 0;
  let timer = null;
  let move = null;

  // Highlight the hex, fill the traveled links, update the readout. No token here.
  function paint(index) {
    const hex = hexes[index];
    hexes.forEach((h, i) => {
      h.classList.toggle('is-active', i === index);
      h.setAttribute('aria-pressed', String(i === index));
    });
    links.forEach((l, i) => l.classList.toggle('is-done', i < index));
    if (nameEl) {
      nameEl.textContent = hex.dataset.name;
      descEl.textContent = hex.dataset.desc;
      roleEl.textContent = hex.dataset.role;
      indexEl.textContent = String(index + 1).padStart(2, '0');
    }
  }

  // Send the order from one stage to another, becoming the right thing en route.
  function moveOrder(from, to) {
    const key = glyphFor(to);
    token.innerHTML = GLYPHS[key];
    token.classList.toggle('is-riding', key === 'scooter');
    const a = coord(hexes[from]);
    const b = coord(hexes[to]);
    if (move) move.kill();
    // Adjacent step: glide along the connector, then drop into the hex.
    if (Math.abs(to - from) === 1) {
      move = gsap.timeline()
        .set(token, { left: `${a.x}%`, top: `${a.y}%` })
        .fromTo(token, { autoAlpha: 0, scale: .5 }, { autoAlpha: 1, scale: 1, duration: .26, ease: 'back.out(2)' }, 0)
        .to(token, { left: `${b.x}%`, top: `${b.y}%`, duration: .8, ease: 'power2.inOut' }, 0)
        .to(token, { autoAlpha: 0, scale: .6, duration: .3, ease: 'power2.in' }, .8);
      return;
    }
    // Wrap-around or a far tap: don't fly backwards — arrive with a quick pop.
    move = gsap.timeline()
      .set(token, { left: `${b.x}%`, top: `${b.y}%` })
      .fromTo(token, { autoAlpha: 0, scale: .5 }, { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, 0)
      .to(token, { autoAlpha: 0, scale: .6, duration: .3, ease: 'power2.in' }, .95);
  }

  function select(index, travel = true) {
    const from = current;
    current = index;
    paint(index);
    if (reduced || !travel || from === index) return;
    moveOrder(from, index);
  }

  function step() {
    select((current + 1) % ids.length);
    timer = gsap.delayedCall(2, step);
  }

  hexes.forEach((h, i) => {
    const jump = () => {
      if (timer) timer.kill();
      select(i);
      if (!reduced) timer = gsap.delayedCall(3.4, step);
    };
    h.addEventListener('click', jump);
    h.addEventListener('focus', jump);
  });

  select(0, false);
  if (!reduced) timer = gsap.delayedCall(1.6, step);
}
