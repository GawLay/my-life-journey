import gsap from 'gsap';

export function initCursor() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursor = document.querySelector('.cursor');
  if (!fine || !cursor) return;

  document.documentElement.classList.add('cursor-active');
  const label = cursor.querySelector('.cursor__label');

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3' });

  let shown = false;
  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
    if (!shown) {
      gsap.to(cursor, { autoAlpha: 1, duration: 0.3 });
      shown = true;
    }
  });

  document.addEventListener('mouseleave', () => gsap.to(cursor, { autoAlpha: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to(cursor, { autoAlpha: 1, duration: 0.3 }));

  document.querySelectorAll('[data-cursor]').forEach((el) => {
    const type = el.dataset.cursor;
    el.addEventListener('pointerenter', () => {
      cursor.classList.remove('is-pointer', 'is-view');
      if (type === 'view') {
        cursor.classList.add('is-view');
        label.textContent = 'View';
      } else {
        cursor.classList.add('is-pointer');
      }
    });
    el.addEventListener('pointerleave', () => {
      cursor.classList.remove('is-pointer', 'is-view');
    });
  });
}
