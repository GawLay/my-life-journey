export function initNav(lenis) {
  const nav = document.getElementById('nav');
  let last = 0;

  const update = (y) => {
    if (y > last && y > 240) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    last = y;
  };

  if (lenis) lenis.on('scroll', ({ scroll }) => update(scroll));
  else window.addEventListener('scroll', () => update(window.scrollY), { passive: true });

  // Smooth-scroll anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) {
        e.preventDefault();
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
