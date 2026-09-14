import gsap from 'gsap';

// TrueMoney signature: a living agent service network. With no private screens
// to show, the system is the hero — transactions stream from the 23K-agent core
// out along four service spokes, and selecting a service traces its path and
// says what it does. Pulses are GSAP tweens on SVG dots (the house idiom);
// under reduced motion the network is calm and static but still selectable.
export function initTruemoneyNetwork() {
  const net = document.querySelector('[data-tm-network]');
  if (!net) return;

  const nodes = [...net.querySelectorAll('[data-tm-node]')];
  const spokes = [...net.querySelectorAll('.tm-spoke')];
  const pulseGroup = net.querySelector('[data-tm-pulses]');
  const readout = document.querySelector('[data-tm-readout]');
  const nameEl = readout && readout.querySelector('[data-tm-name]');
  const descEl = readout && readout.querySelector('[data-tm-desc]');
  const indexEl = readout && readout.querySelector('[data-tm-index]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(location.search).has('static');

  const NS = 'http://www.w3.org/2000/svg';
  const timelines = new Map();  // service id -> its pulse timelines

  // A stream of dots travelling core → node along one spoke.
  function stream(id, x2, y2) {
    const tls = [];
    for (let i = 0; i < 3; i += 1) {
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'tm-pulse');
      dot.setAttribute('r', '1.1');
      dot.setAttribute('cx', '50');
      dot.setAttribute('cy', '50');
      dot.dataset.spoke = id;
      pulseGroup.appendChild(dot);
      const dur = gsap.utils.random(2.2, 3.2);
      const tl = gsap.timeline({ repeat: -1, delay: (dur / 3) * i });
      tl.fromTo(dot, { attr: { cx: 50, cy: 50 } }, { attr: { cx: x2, cy: y2 }, duration: dur, ease: 'none' }, 0)
        .fromTo(dot, { opacity: 0 }, { opacity: .9, duration: dur * .22, ease: 'power1.out' }, 0)
        .to(dot, { opacity: 0, duration: dur * .3, ease: 'power1.in' }, dur * .7);
      tls.push(tl);
    }
    timelines.set(id, tls);
  }

  function select(id) {
    nodes.forEach((n) => {
      const on = n.dataset.tmNode === id;
      n.classList.toggle('is-active', on);
      n.setAttribute('aria-pressed', String(on));
    });
    spokes.forEach((s) => s.classList.toggle('is-active', s.dataset.spoke === id));
    net.querySelectorAll('.tm-pulse').forEach((p) => p.classList.toggle('is-active', p.dataset.spoke === id));
    timelines.forEach((tls, key) => tls.forEach((tl) => tl.timeScale(key === id ? 1.9 : 1)));
    const node = nodes.find((n) => n.dataset.tmNode === id);
    if (node && nameEl) {
      nameEl.textContent = node.dataset.name;
      descEl.textContent = node.dataset.desc;
      indexEl.textContent = String(nodes.indexOf(node) + 1).padStart(2, '0');
    }
  }

  if (!reduced) spokes.forEach((s) => stream(s.dataset.spoke, +s.getAttribute('x2'), +s.getAttribute('y2')));
  nodes.forEach((n) => {
    n.addEventListener('click', () => select(n.dataset.tmNode));
    n.addEventListener('focus', () => select(n.dataset.tmNode));
  });
  if (nodes.length) select(nodes[0].dataset.tmNode);
}
