const SKIP = 'script, style, svg, canvas, textarea, input, select, option, .liquid-word, .liquid-char, .liquid-cursor, [data-page-wave-temp], .wave-arrival, .page-wave-settled';
const CHARACTERS = '.liquid-char, .page-wave-settled > .wave-letter';
const TOP_BARS = '.site-header, .world-header, .discovery-header, .country-header, .project-header';
const TRAIL_LIFETIME = 680;

function splitText(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      const hidden = parent?.closest('[aria-hidden="true"]');
      if (!node.textContent.trim() || parent?.closest(SKIP) || parent?.closest(TOP_BARS)
        || (hidden && !parent.closest('.wave-text'))) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part || /^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'liquid-word';
      word.setAttribute('aria-label', part);
      [...part].forEach((letter) => {
        const character = document.createElement('span');
        character.className = 'liquid-char';
        character.setAttribute('aria-hidden', 'true');
        character.textContent = letter;
        word.appendChild(character);
      });
      fragment.appendChild(word);
    });
    node.replaceWith(fragment);
  });
}

export function initLiquidWarp() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer:fine)');
  if (reduced.matches || !finePointer.matches
    || new URLSearchParams(location.search).has('static')) return;

  splitText(document.body);
  let characters = [...document.querySelectorAll(CHARACTERS)];

  const cursor = document.createElement('i');
  cursor.className = 'liquid-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const points = [];
  const active = new Set();
  let positions = [];
  let previous = null;
  let frame = 0;
  let measureFrame = 0;
  let measureTimer = 0;
  let refreshFrame = 0;
  let cursorX = 0;
  let cursorY = 0;
  let cursorOpacity = 0;

  const measure = () => {
    measureFrame = 0;
    positions = characters.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY + rect.height / 2,
      };
    });
  };

  const scheduleMeasure = () => {
    window.clearTimeout(measureTimer);
    measureTimer = window.setTimeout(() => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    }, 120);
  };

  const observer = new MutationObserver(() => {
    if (refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      observer.disconnect();
      splitText(document.body);
      characters = [...document.querySelectorAll(CHARACTERS)];
      measure();
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  const clear = () => {
    points.length = 0;
    previous = null;
  };

  const render = (now) => {
    frame = 0;
    for (let index = points.length - 1; index >= 0; index -= 1) {
      if (now - points[index].born > TRAIL_LIFETIME) points.splice(index, 1);
    }

    const nextActive = new Set();
    positions.forEach(({ element, x, y }) => {
      let best = 0;
      let influence = null;
      for (const point of points) {
        const dx = x - point.x;
        const dy = y - point.y;
        const radius = 58 + point.speed * 1.25;
        if (Math.abs(dx) >= radius || Math.abs(dy) >= radius) continue;
        const distance = Math.hypot(dx, dy);
        if (distance >= radius) continue;
        const life = Math.pow(1 - (now - point.born) / TRAIL_LIFETIME, 1.35);
        const proximity = 1 - distance / radius;
        const amount = proximity * proximity * life * Math.min(1, .28 + point.speed / 17);
        if (amount > best) { best = amount; influence = point; }
      }

      if (!influence || best < .006) return;
      const pull = 14 * best;
      const angle = Math.atan2(influence.dy, influence.dx);
      const stretch = 1 + .42 * best;
      const squash = 1 - .14 * best;
      const skew = influence.dy * 7 * best;
      element.style.transform = `translate3d(${influence.dx * pull}px, ${influence.dy * pull}px, 0) rotate(${angle}rad) scale(${stretch}, ${squash}) rotate(${-angle}rad) skewX(${skew}deg)`;
      nextActive.add(element);
    });

    active.forEach((element) => {
      if (!nextActive.has(element)) element.style.transform = '';
    });
    active.clear();
    nextActive.forEach((element) => active.add(element));

    const visible = points.length > 0;
    cursorOpacity += ((visible ? 1 : 0) - cursorOpacity) * .13;
    cursor.style.opacity = cursorOpacity.toFixed(3);
    cursor.style.transform = `translate3d(${cursorX - 17}px, ${cursorY - 17}px, 0)`;
    if (points.length || cursorOpacity > .01) frame = requestAnimationFrame(render);
  };

  const move = (event) => {
    if (event.pointerType === 'touch') return;
    const now = performance.now();
    cursorX = event.clientX;
    cursorY = event.clientY;
    const x = event.clientX + window.scrollX;
    const y = event.clientY + window.scrollY;

    if (previous && now - previous.time < 140) {
      const dx = x - previous.x;
      const dy = y - previous.y;
      const distance = Math.hypot(dx, dy);
      if (distance > .5) {
        const steps = Math.min(10, Math.ceil(distance / 14));
        const directionX = dx / distance;
        const directionY = dy / distance;
        const speed = Math.min(32, distance);
        for (let index = 1; index <= steps; index += 1) {
          points.push({
            x: previous.x + dx * index / steps,
            y: previous.y + dy * index / steps,
            dx: directionX,
            dy: directionY,
            speed,
            born: now - (steps - index) * 8,
          });
        }
        if (points.length > 55) points.splice(0, points.length - 55);
      }
    }
    previous = { x, y, time: now };
    if (!frame) frame = requestAnimationFrame(render);
  };

  const leave = () => { previous = null; };
  const adoptWave = () => {
    characters = [...document.querySelectorAll(CHARACTERS)];
    measure();
  };
  measure();
  window.setTimeout(measure, 1600);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerleave', leave);
  window.addEventListener('resize', scheduleMeasure);
  window.addEventListener('scroll', scheduleMeasure, { passive: true });
  window.addEventListener('paz:wave-settled', adoptWave);

  return () => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(measureFrame);
    cancelAnimationFrame(refreshFrame);
    window.clearTimeout(measureTimer);
    observer.disconnect();
    active.forEach((element) => { element.style.transform = ''; });
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerleave', leave);
    window.removeEventListener('resize', scheduleMeasure);
    window.removeEventListener('scroll', scheduleMeasure);
    window.removeEventListener('paz:wave-settled', adoptWave);
    cursor.remove();
    clear();
  };
}
