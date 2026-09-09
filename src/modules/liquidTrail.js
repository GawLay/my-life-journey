const TAU = Math.PI * 2;

function rgba([red, green, blue], alpha) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function initLiquidTrail({ dark = false } = {}) {
  const canvas = document.getElementById('liquid-trail');
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || !finePointer || reduced) return null;

  if (dark) canvas.classList.add('liquid-trail--dark');
  const context = canvas.getContext('2d');
  const palette = dark
    ? [[216, 105, 70], [221, 160, 94], [113, 139, 126]]
    : [[185, 76, 49], [205, 145, 73], [109, 137, 119]];

  // Rings on water: the pointer drops ripples as it travels, each expanding and
  // fading out. A faint pool follows the cursor so movement still feels "wet".
  const ripples = [];
  const maxRipples = 16;
  const spawnStep = 50;            // px of travel between ripples — keeps it sparse
  const pointer = { x: 0, y: 0, seen: false };
  let travel = 0;                  // distance since the last ripple was dropped
  let speed = 0;                   // decaying pointer speed → drives the pool glow
  let colorTick = 0;
  let width = 1;
  let height = 1;
  let frame = 0;
  let last = null;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = (x, y, strength) => {
    ripples.push({
      x,
      y,
      maxRadius: 58 + strength * 44,
      life: 0,
      duration: 58 + Math.random() * 14,
      color: palette[colorTick % palette.length],
      lineWidth: 1 + Math.random() * .5,
    });
    colorTick += 1;
    if (ripples.length > maxRipples) ripples.shift();
  };

  const move = (event) => {
    const { clientX: x, clientY: y } = event;
    pointer.x = x;
    pointer.y = y;
    pointer.seen = true;
    if (!last) { last = { x, y }; return; }
    const distance = Math.hypot(x - last.x, y - last.y);
    speed = Math.min(20, speed + distance);
    travel += distance;
    if (travel >= spawnStep) {
      travel = 0;
      spawn(x, y, Math.min(1, distance / 24));
    }
    last = { x, y };
  };

  const render = () => {
    context.clearRect(0, 0, width, height);
    speed *= .9;

    // Soft pool at the cursor — present while moving, gone at rest.
    if (pointer.seen && speed > .4) {
      const radius = 44;
      const glowAlpha = Math.min(1, speed / 12) * (dark ? .09 : .06);
      const pool = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
      pool.addColorStop(0, rgba(palette[0], glowAlpha));
      pool.addColorStop(1, rgba(palette[0], 0));
      context.fillStyle = pool;
      context.beginPath();
      context.arc(pointer.x, pointer.y, radius, 0, TAU);
      context.fill();
    }

    context.save();
    context.filter = 'blur(.7px)';                  // soften the rings into water
    for (let index = ripples.length - 1; index >= 0; index -= 1) {
      const ripple = ripples[index];
      ripple.life += 1;
      const progress = ripple.life / ripple.duration;
      if (progress >= 1) { ripples.splice(index, 1); continue; }

      const ease = 1 - Math.pow(1 - progress, 3);   // expand fast, then settle
      const radius = 6 + (ripple.maxRadius - 6) * ease;
      const alpha = (1 - progress) * (dark ? .2 : .16);

      context.strokeStyle = rgba(ripple.color, alpha);
      context.lineWidth = ripple.lineWidth;
      context.beginPath();
      context.arc(ripple.x, ripple.y, radius, 0, TAU);
      context.stroke();

      // A trailing inner ring reads as refraction under the surface.
      context.strokeStyle = rgba(ripple.color, alpha * .5);
      context.lineWidth = ripple.lineWidth * .8;
      context.beginPath();
      context.arc(ripple.x, ripple.y, radius * .66, 0, TAU);
      context.stroke();

      // A brief soft core marks the drop point before the ring takes over.
      if (progress < .35) {
        const coreAlpha = (1 - progress / .35) * (dark ? .09 : .07);
        const core = context.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, 14);
        core.addColorStop(0, rgba(ripple.color, coreAlpha));
        core.addColorStop(1, rgba(ripple.color, 0));
        context.fillStyle = core;
        context.beginPath();
        context.arc(ripple.x, ripple.y, 14, 0, TAU);
        context.fill();
      }
    }
    context.restore();

    frame = requestAnimationFrame(render);
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', move, { passive: true });
  frame = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', move);
  };
}
