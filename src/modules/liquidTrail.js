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
  const target = { x: 0, y: 0 };
  const pools = Array.from({ length: 7 }, () => ({ x: 0, y: 0 }));
  let active = false;
  let width = 1;
  let height = 1;
  let frame = 0;
  let phase = 0;
  let pointerSpeed = 0;
  let lastPointer = { x: 0, y: 0 };

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

  const move = (event) => {
    if (!active) {
      active = true;
      pools.forEach((pool) => { pool.x = event.clientX; pool.y = event.clientY; });
      lastPointer = { x: event.clientX, y: event.clientY };
    }
    pointerSpeed = Math.min(80, Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y));
    lastPointer = { x: event.clientX, y: event.clientY };
    target.x = event.clientX;
    target.y = event.clientY;
  };

  const drawPool = (x, y, radius, index, alpha) => {
    const wobble = 0.08 + Math.min(pointerSpeed / 850, 0.07);
    const pointCount = 28;
    const edge = [];
    for (let point = 0; point < pointCount; point += 1) {
      const angle = (point / pointCount) * TAU;
      const variation = 1
        + Math.sin(angle * 3 + phase * 1.1 + index) * wobble
        + Math.sin(angle * 5 - phase * .74 + index * .8) * wobble * .55;
      edge.push({
        x: x + Math.cos(angle) * radius * variation,
        y: y + Math.sin(angle) * radius * variation,
      });
    }

    context.beginPath();
    context.moveTo((edge[0].x + edge[1].x) * .5, (edge[0].y + edge[1].y) * .5);
    for (let point = 1; point <= pointCount; point += 1) {
      const current = edge[point % pointCount];
      const next = edge[(point + 1) % pointCount];
      context.quadraticCurveTo(current.x, current.y, (current.x + next.x) * .5, (current.y + next.y) * .5);
    }
    context.closePath();

    const color = palette[index % palette.length];
    const gradient = context.createRadialGradient(
      x - radius * .18,
      y - radius * .22,
      radius * .04,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, rgba(color, alpha));
    gradient.addColorStop(.48, rgba(color, alpha * .72));
    gradient.addColorStop(1, rgba(color, 0));
    context.fillStyle = gradient;
    context.fill();
  };

  const render = () => {
    context.clearRect(0, 0, width, height);
    phase += .025;
    pointerSpeed *= .9;

    if (active) {
      pools[0].x += (target.x - pools[0].x) * .2;
      pools[0].y += (target.y - pools[0].y) * .2;
      for (let index = 1; index < pools.length; index += 1) {
        const follow = .19 - index * .012;
        pools[index].x += (pools[index - 1].x - pools[index].x) * follow;
        pools[index].y += (pools[index - 1].y - pools[index].y) * follow;
      }

      context.save();
      context.filter = `blur(${dark ? 17 : 22}px)`;
      for (let index = pools.length - 1; index >= 0; index -= 1) {
        const progress = index / (pools.length - 1);
        const radius = 220 - progress * 118 + Math.sin(phase * 1.7 + index) * 10;
        drawPool(pools[index].x, pools[index].y, radius, index, .24 - progress * .085);
      }
      context.restore();

      // Nearby satellite pools keep the field broad and asymmetrical instead
      // of resolving into a narrow line during a fast pointer movement.
      context.save();
      context.filter = 'blur(28px)';
      drawPool(pools[0].x + Math.sin(phase) * 58, pools[0].y + Math.cos(phase * .8) * 46, 142, 1, .14);
      drawPool(pools[1].x - Math.cos(phase * .7) * 64, pools[1].y + Math.sin(phase * .9) * 52, 116, 2, .12);
      context.restore();
    }

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
