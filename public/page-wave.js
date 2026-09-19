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

// pagereveal can precede World's module. Keep the source snapshot intact until
// the destination has warmed its first WebGL frame. Photographs can finish
// decoding behind the wave without holding the interaction on one frame.
const worldReady = supported && pageKind(location.href) === 'world'
  ? new Promise((resolve) => { window.__PAZ_WAVE_WORLD_READY__ = resolve; })
  : null;

window.__PAZ_PAGE_WAVE__ = supported;
window.__PAZ_WAVE_LINK__ = (url) => supported && Boolean(pageKind(location.href) && pageKind(url));

function stageWave(url, back = false) {
  try {
    const next = new URL(url, location.href);
    const target = next.pathname + next.search;
    sessionStorage.setItem('paz-wave-entry', target);
    sessionStorage.setItem('paz-wave-route', JSON.stringify({ target, from: pageKind(location.href), back }));
  } catch { /* storage can be unavailable; navigation still works */ }
}

// A one-navigation hint makes the arriving page skip its old iris/intro before
// the browser captures the new page. The URL match prevents stale hints.
if (supported) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || link.target && link.target !== '_self' || !window.__PAZ_WAVE_LINK__(link.href)) return;
    stageWave(link.href, pageKind(link.href) === 'work');
  }, { capture: true });
}

// Static and reduced-motion routes also opt out of the native snapshot.
// Catch its ready promise on the outgoing document before skipping it.
window.addEventListener('pageswap', (event) => {
  event.viewTransition?.ready.catch(() => {});
  const activation = event.activation;
  if (!supported || !activation?.entry || !window.__PAZ_WAVE_LINK__(activation.entry.url)) {
    // Discovery and country journals use their own iris/photo covers.
    event.viewTransition?.skipTransition();
    return;
  }
  const back = activation.navigationType === 'traverse'
    ? activation.entry.index < activation.from.index
    : pageKind(activation.entry.url) === 'work';
  stageWave(activation.entry.url, back);
});

const ease = (t) => t * t * (3 - 2 * t);
function waveEdge(progress, y, depth) {
  if (depth) return -10 + progress * 120 + Math.sin(Math.PI * progress)
    * (Math.sin(y * Math.PI * 1.35 - progress * 2.4) * 6.5
      + Math.sin(y * Math.PI * 2.3 - progress * 1.4) * 1.2);
  return -7 + progress * 114
    + Math.sin(y * Math.PI * 2.25 - progress * 4.7) * 2.35
    + Math.sin(y * Math.PI * 4.5 + progress * 3.2) * .55;
}

function wavePolygon(progress, depth = false, reverse = false) {
  const side = reverse ? 100 : 0;
  const points = [`${side}% 0%`];
  const segments = depth ? 60 : 28;
  for (let i = 0; i <= segments; i += 1) {
    const y = i / segments;
    const x = waveEdge(progress, y, depth);
    points.push(`${(reverse ? 100 - x : x).toFixed(3)}% ${(y * 100).toFixed(3)}%`);
  }
  points.push(`${side}% 100%`);
  return `polygon(${points.join(', ')})`;
}

function letterDelay(x, duration, y, depth) {
  const target = Math.min(1, Math.max(0, (x / innerWidth * 100 + 7) / 114));
  let low = 0;
  let high = 1;
  for (let i = 0; i < 12; i += 1) {
    const mid = (low + high) / 2;
    if (depth ? waveEdge(ease(mid), y / innerHeight, true) < x / innerWidth * 100 : ease(mid) < target) low = mid;
    else high = mid;
  }
  return ((low + high) / 2) * duration;
}

function inViewport(rect) {
  return rect.width > 0 && rect.height > 0
    && rect.right > 0 && rect.left < innerWidth
    && rect.bottom > 0 && rect.top < innerHeight;
}

// Individual spans lose the font's kerning. Match their advances to the shaped
// word so removing the animation wrappers does not resize the finished heading.
function preserveWordSpacing(word) {
  if (word.dataset.pageWaveSpaced) return;
  const letters = [...word.children];
  const text = document.createTextNode(word.textContent);
  word.replaceChildren(text);
  const range = document.createRange();
  range.selectNodeContents(text);
  const bounds = range.getBoundingClientRect();
  let offset = 0;
  const starts = letters.map((letter) => {
    range.setStart(text, offset);
    offset += letter.textContent.length;
    range.setEnd(text, offset);
    return range.getBoundingClientRect().left - bounds.left;
  });
  starts.push(bounds.width);
  word.replaceChildren(...letters);
  const widths = letters.map((letter) => letter.getBoundingClientRect().width);
  letters.forEach((letter, index) => {
    letter.style.marginRight = `${starts[index + 1] - starts[index] - widths[index]}px`;
  });
  word.dataset.pageWaveSpaced = 'true';
}

// Reuse the arriving headline spans prepared by the page module. Splitting all
// visible copy here forced repeated layout during the reveal, including nav text.
function prepareVisibleText() {
  root.querySelectorAll('.wave-arrival .wave-word').forEach(preserveWordSpacing);
}

function animateVisibleText(reveal) {
  const elapsed = performance.now() - reveal.startedAt;
  // Read geometry as one batch before creating animations, which write styles.
  const letters = [...root.querySelectorAll('.wave-arrival .wave-letter')]
    .filter((letter) => !reveal.animated.has(letter))
    .map((letter) => ({ letter, rect: letter.getBoundingClientRect(), fontSize: parseFloat(getComputedStyle(letter).fontSize) }))
    .filter(({ rect }) => inViewport(rect));
  for (const { letter, rect, fontSize } of letters) {
    const center = rect.left + rect.width / 2;
    const x = reveal.reverse ? innerWidth - center : center;
    // The reveal edge acts like a cursor sweeping across the text.
    const start = Math.max(elapsed, letterDelay(x, reveal.duration, rect.top + rect.height / 2, reveal.depth) - 85);
    if (start >= reveal.duration - 20) continue;
    const rise = Math.min(6, Math.max(1.5, fontSize * .2));
    // A single soft crest travels with the edge. Keep the same pace on the
    // right-hand side instead of squeezing its letters into a quick bounce.
    const frames = Array.from({ length: 13 }, (_, i) => {
      const offset = i / 12;
      const crest = Math.sin(Math.PI * offset) ** 2;
      return {
        offset,
        transform: `translate(${((reveal.reverse ? -1.8 : 1.8) * crest).toFixed(2)}px, ${(-rise * crest).toFixed(2)}px) rotate(${((reveal.reverse ? .7 : -.7) * crest).toFixed(2)}deg)`,
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
  let route = null;
  try {
    const saved = JSON.parse(sessionStorage.getItem('paz-wave-route') || 'null');
    sessionStorage.removeItem('paz-wave-route');
    if (saved?.target === location.pathname + location.search) {
      route = saved;
      sessionStorage.removeItem('paz-wave-entry');
      // Restored documents do not rerun their head script.
      if (supported) root.classList.add('is-wave-entering', 'has-wave-arrived');
    }
  } catch { /* use the browser's activation when storage is unavailable */ }
  const transition = event.viewTransition;
  if (!transition) { root.classList.remove('is-wave-entering'); return; }
  if (!supported || !root.classList.contains('is-wave-entering')) {
    transition.ready.catch(() => {});
    transition.skipTransition();
    return;
  }

  const activation = window.navigation?.activation;
  const from = route?.from || pageKind(activation?.from?.url || document.referrer || location.href);
  const to = pageKind(location.href);
  // Every recognized page hand-off (Work · World · project detail) gets the same
  // soft depth settle. "Back" (reverse sweep) is any return to the Work home page.
  const kinds = ['work', 'project', 'world'];
  const depth = kinds.includes(from) && kinds.includes(to);
  root.classList.toggle('has-wave-depth', depth);
  root.classList.remove('is-wave-covered');
  const reverse = depth && (route?.back ?? (activation?.navigationType === 'traverse'
    ? activation.entry.index < activation.from.index
    : to === 'work'));
  const duration = depth ? 1120 : 980;
  const reveal = { duration, depth, reverse, animations: [], animated: new WeakSet(), startedAt: 0, active: true, holds: [] };
  // This live surface is captured with the arriving page, like its letter motion.
  // Only the inside half of the soft shadow is visible through the reveal clip.
  let edge = null;
  let edgeFrame = 0;
  if (depth) {
    edge = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    edge.setAttribute('class', 'page-wave-depth');
    edge.setAttribute('viewBox', '0 0 1000 620');
    edge.setAttribute('preserveAspectRatio', 'none');
    edge.setAttribute('aria-hidden', 'true');
    edge.innerHTML = '<defs><filter id="page-wave-shadow" x="-100%" y="-30%" width="300%" height="160%"><feGaussianBlur stdDeviation="9"/></filter></defs><path fill="none" stroke="currentColor" stroke-width="22" filter="url(#page-wave-shadow)"/><path class="page-wave-depth__light" fill="none" stroke-width="1.5"/>';
    document.body.appendChild(edge);
  }
  activeReveal = reveal;
  transition.ready.then(async () => {
    if (!reveal.active) return;
    if (worldReady) {
      const hidden = wavePolygon(0, depth, reverse);
      const newHold = root.animate([{ clipPath: hidden }, { clipPath: hidden }], {
        duration, fill: 'both', pseudoElement: '::view-transition-new(root)',
      });
      const oldHold = root.animate([{ opacity: 1 }, { opacity: 1 }], {
        duration, fill: 'both', pseudoElement: '::view-transition-old(root)',
      });
      reveal.holds = [newHold, oldHold];
      reveal.holds.forEach((animation) => animation.pause());
      await worldReady;
      if (!reveal.active) return;
    }
    prepareVisibleText();
    const frames = Array.from({ length: 61 }, (_, i) => ({
      offset: i / 60,
      // Finish on the real, untransformed page and hold it before the browser
      // retires its snapshot layers. No old pixels may survive this handoff.
      clipPath: depth && i >= 54 ? 'inset(0)' : wavePolygon(ease(i / 60), depth, reverse),
      ...(depth ? { transform: i >= 54 ? 'none' : `scale(${1 + .012 * (1 - ease(Math.min(1, i / 48)))})` } : {}),
    }));
    root.animate(frames, {
      duration,
      easing: 'linear',
      fill: 'both',
      pseudoElement: '::view-transition-new(root)',
    });
    if (depth) {
      root.animate(Array.from({ length: 61 }, (_, i) => ({
        offset: i / 60,
        opacity: i < 53 ? 1 : 0,
        // Keep snapshots covering the viewport so the settle cannot expose a rim.
        transform: `scale(${1 + .004 * Math.sin(Math.PI * ease(i / 60))})`,
        filter: `brightness(${1 - .035 * Math.sin(Math.PI * ease(i / 60))})`,
      })), { duration, easing: 'linear', fill: 'both', pseudoElement: '::view-transition-old(root)' });
    }
    reveal.holds.forEach((animation) => animation.cancel());
    reveal.startedAt = performance.now();
    if (edge) {
      const shadow = edge.querySelector('path');
      const light = edge.querySelector('.page-wave-depth__light');
      const drawEdge = () => {
        if (!reveal.active) return;
        const progress = ease(Math.min(1, (performance.now() - reveal.startedAt) / duration));
        // Pin the completed surface independently of animation fill state.
        if (progress >= ease(.9)) root.classList.add('is-wave-covered');
        const path = Array.from({ length: 61 }, (_, i) => {
          const x = waveEdge(progress, i / 60, true);
          return `${i ? 'L' : 'M'}${(reverse ? 100 - x : x) * 10},${i / 60 * 620}`;
        }).join(' ');
        shadow.setAttribute('d', path);
        light.setAttribute('d', path);
        edge.style.opacity = Math.sin(Math.PI * progress);
        shadow.style.opacity = .15;
        light.style.opacity = .32;
        if (progress < 1) edgeFrame = requestAnimationFrame(drawEdge);
      };
      drawEdge();
    }
    animateVisibleText(reveal);
  }).catch(() => { /* a cancelled navigation is safe to show directly */ });

  transition.finished.catch(() => {}).finally(() => {
    reveal.active = false;
    reveal.holds.forEach((animation) => animation.cancel());
    cancelAnimationFrame(edgeFrame);
    edge?.remove();
    if (activeReveal === reveal) activeReveal = null;
    root.classList.remove('is-wave-entering');
    // Keep the same glyphs for the cursor effect. Unwrapping here and letting
    // liquidWarp split them again on the next frame causes a second layout jump.
    Promise.allSettled(reveal.animations.map((animation) => animation.finished)).then(() => {
      root.querySelectorAll('[data-page-wave-temp], .wave-arrival .wave-word').forEach((word) => {
        word.classList.add('page-wave-settled');
        word.setAttribute('aria-label', word.textContent);
        word.removeAttribute('data-page-wave-temp');
        [...word.children].forEach((letter) => letter.setAttribute('aria-hidden', 'true'));
      });
      root.querySelectorAll('.wave-arrival').forEach((heading) => {
        heading.classList.remove('wave-arrival');
      });
      window.dispatchEvent(new Event('paz:wave-settled'));
    });
  });
});
