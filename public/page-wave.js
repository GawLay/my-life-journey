// Loaded as a classic head script so pagereveal is registered before first paint.
// Native cross-document View Transitions keep both real pages available. The
// destination is clipped directly over the source: no intermediate color cover.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  || new URLSearchParams(location.search).has('static');
const supported = !reduced && 'onpagereveal' in window
  && 'startViewTransition' in document
  && CSS.supports('view-transition-name: root');

function pageKind(url) {
  const parsed = new URL(url, location.href);
  if (parsed.origin !== location.origin || parsed.searchParams.has('static')) return null;
  if (parsed.pathname.endsWith('/world.html')) return parsed.searchParams.has('view') ? null : 'world';
  if (parsed.pathname.endsWith('/project.html')) return 'project';
  if (parsed.pathname.endsWith('/index.html') || parsed.pathname.endsWith('/')) return 'work';
  return null;
}

window.__PAZ_PAGE_WAVE__ = supported;
window.__PAZ_WAVE_LINK__ = (url) => supported && Boolean(pageKind(location.href) && pageKind(url));

// A one-navigation hint makes the arriving page skip its old iris/intro before
// the browser captures the new page. The URL match prevents stale hints.
if (supported) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || link.target && link.target !== '_self' || !window.__PAZ_WAVE_LINK__(link.href)) return;
    try {
      const next = new URL(link.href);
      sessionStorage.setItem('paz-wave-entry', next.pathname + next.search);
    } catch { /* storage can be unavailable; navigation still works */ }
  }, { capture: true });
}

const ease = (t) => t * t * (3 - 2 * t);
function wavePolygon(progress) {
  const edge = -7 + progress * 114;
  const points = ['0% 0%'];
  for (let i = 0; i <= 28; i += 1) {
    const y = i / 28;
    const curve = Math.sin(y * Math.PI * 2.25 - progress * 4.7) * 2.35
      + Math.sin(y * Math.PI * 4.5 + progress * 3.2) * .55;
    points.push(`${(edge + curve).toFixed(3)}% ${(y * 100).toFixed(3)}%`);
  }
  points.push('0% 100%');
  return `polygon(${points.join(', ')})`;
}

function letterDelay(x, duration) {
  const target = Math.min(1, Math.max(0, (x / innerWidth * 100 + 7) / 114));
  let low = 0;
  let high = 1;
  for (let i = 0; i < 12; i += 1) {
    const mid = (low + high) / 2;
    if (ease(mid) < target) low = mid;
    else high = mid;
  }
  return ((low + high) / 2) * duration;
}

function inViewport(rect) {
  return rect.width > 0 && rect.height > 0
    && rect.right > 0 && rect.left < innerWidth
    && rect.bottom > 0 && rect.top < innerHeight;
}

// Preserve links, emphasis and intentional line breaks by splitting only their
// visible text nodes. Existing [data-wave] labels already have letter spans.
function prepareVisibleText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!node.textContent.trim() || !parent || parent.closest('script, style, svg, canvas, textarea, select, option, [hidden], [aria-hidden="true"], [data-wave], .wave-word, .work-entry, .world-entry, .project-transition')) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (![...range.getClientRects()].some(inViewport)) continue;
    let hidden = false;
    for (let element = parent; element && element !== document.body; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.opacity === '0') { hidden = true; break; }
    }
    if (!hidden) nodes.push(node);
  }

  nodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    for (const piece of textNode.textContent.match(/\S+|\s+/g) || []) {
      if (!piece.trim()) { fragment.appendChild(document.createTextNode(piece)); continue; }
      const word = document.createElement('span');
      word.className = 'wave-word';
      word.dataset.pageWaveTemp = '';
      for (const character of piece) {
        const letter = document.createElement('span');
        letter.className = 'wave-letter';
        letter.textContent = character;
        word.appendChild(letter);
      }
      fragment.appendChild(word);
    }
    textNode.replaceWith(fragment);
  });
}

function animateVisibleText(reveal) {
  const elapsed = performance.now() - reveal.startedAt;
  for (const letter of root.querySelectorAll('.wave-letter')) {
    if (reveal.animated.has(letter)) continue;
    const rect = letter.getBoundingClientRect();
    if (!inViewport(rect)) continue;
    const x = rect.left + rect.width / 2;
    // The reveal edge acts like a cursor sweeping across the text.
    const start = Math.max(elapsed, letterDelay(x, reveal.duration) - 85);
    if (start >= reveal.duration - 20) continue;
    const rise = Math.min(6, Math.max(1.5, parseFloat(getComputedStyle(letter).fontSize) * .2));
    // A single soft crest travels with the edge. Keep the same pace on the
    // right-hand side instead of squeezing its letters into a quick bounce.
    const frames = Array.from({ length: 13 }, (_, i) => {
      const offset = i / 12;
      const crest = Math.sin(Math.PI * offset) ** 2;
      return {
        offset,
        transform: `translate(${(1.8 * crest).toFixed(2)}px, ${(-rise * crest).toFixed(2)}px) rotate(${(-.7 * crest).toFixed(2)}deg)`,
      };
    });
    reveal.animated.add(letter);
    reveal.animations.push(letter.animate(frames, {
      duration: 420,
      delay: start - elapsed,
      easing: 'linear',
    }));
  }
}

let activeReveal = null;
window.__PAZ_WAVE_CONTENT_READY__ = () => {
  if (!root.classList.contains('is-wave-entering')) return;
  prepareVisibleText();
  if (activeReveal?.startedAt) animateVisibleText(activeReveal);
};

window.addEventListener('pagereveal', (event) => {
  const transition = event.viewTransition;
  if (!transition) return;
  if (!supported || !root.classList.contains('is-wave-entering')) {
    transition.skipTransition();
    return;
  }

  const duration = 980;
  const reveal = { duration, animations: [], animated: new WeakSet(), startedAt: 0, active: true };
  activeReveal = reveal;
  prepareVisibleText();
  transition.ready.then(() => {
    if (!reveal.active) return;
    prepareVisibleText();
    const frames = Array.from({ length: 25 }, (_, i) => ({
      offset: i / 24,
      clipPath: wavePolygon(ease(i / 24)),
    }));
    root.animate(frames, {
      duration,
      easing: 'linear',
      fill: 'both',
      pseudoElement: '::view-transition-new(root)',
    });
    reveal.startedAt = performance.now();
    animateVisibleText(reveal);
  }).catch(() => { /* a cancelled navigation is safe to show directly */ });

  transition.finished.finally(() => {
    reveal.active = false;
    if (activeReveal === reveal) activeReveal = null;
    root.classList.remove('is-wave-entering');
    // Let the final letters settle before replacing their temporary wrappers;
    // finishing every animation at the clip's end made the right edge snap.
    Promise.allSettled(reveal.animations.map((animation) => animation.finished)).then(() => {
      root.querySelectorAll('[data-page-wave-temp]').forEach((word) => word.replaceWith(document.createTextNode(word.textContent)));
      root.querySelectorAll('.wave-arrival').forEach((heading) => {
        heading.textContent = heading.getAttribute('aria-label');
        heading.removeAttribute('aria-label');
        heading.removeAttribute('data-wave-ready');
        heading.classList.remove('wave-arrival');
      });
    });
  });
});
