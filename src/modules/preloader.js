import gsap from 'gsap';

export function runPreloader({ reduced }) {
  return new Promise((resolve) => {
    const el = document.getElementById('preloader');
    const countEl = document.getElementById('preloader-count');
    const fill = document.getElementById('preloader-fill');

    if (!el) return resolve();
    if (reduced) {
      el.remove();
      return resolve();
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.remove();
      resolve();
    };

    const obj = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });

    tl.to(obj, {
      v: 100,
      duration: 1.7,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(obj.v);
        countEl.textContent = v;
        fill.style.transform = `scaleX(${obj.v / 100})`;
      },
    });
    tl.to('.preloader__inner', { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, '+=0.15');
    tl.to(el, { yPercent: -100, duration: 1.0, ease: 'expo.inOut' }, '-=0.1');

    // Safety net: a throttled/backgrounded rAF must never trap the loader.
    setTimeout(() => {
      if (!done) {
        tl.progress(1);
        finish();
      }
    }, 6000);
  });
}
