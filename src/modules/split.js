/**
 * Lightweight text splitters (no dependency on SplitText).
 * Elements are rebuilt so words/chars/lines can be animated individually.
 */

export function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  const chars = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.style.display = 'inline-block';
    span.style.whiteSpace = 'pre';
    span.textContent = ch;
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}

export function splitWords(el) {
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  const parts = text.split(' ');
  el.textContent = '';
  const words = [];
  parts.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.style.display = 'inline-block';
    span.textContent = word;
    el.appendChild(span);
    words.push(span);
    if (i < parts.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return words;
}

/**
 * Split into lines by measuring word offsets, then wrap each line in a
 * mask (overflow:hidden) + inner element for a clean reveal.
 * Returns the inner elements to animate.
 */
export function splitLines(el) {
  const words = splitWords(el);
  const lines = [];
  let cur = null;
  let lastTop = null;
  words.forEach((w) => {
    const top = w.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      cur = [];
      lines.push(cur);
      lastTop = top;
    }
    cur.push(w);
  });

  el.textContent = '';
  const inners = [];
  lines.forEach((group) => {
    const mask = document.createElement('span');
    mask.className = 'line-mask';
    mask.style.display = 'block';
    mask.style.overflow = 'hidden';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.style.display = 'block';
    group.forEach((w, i) => {
      inner.appendChild(w);
      if (i < group.length - 1) inner.appendChild(document.createTextNode(' '));
    });
    mask.appendChild(inner);
    el.appendChild(mask);
    inners.push(inner);
  });
  return inners;
}
