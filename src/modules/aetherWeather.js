// Turns the Aether case study into a living sky. A single fixed canvas paints
// the whole-page atmosphere — gradient, light, drifting cloud, particles and
// storm — and every section reacts to it. A six-state switcher (sunny, cloudy,
// rain, snow, storm, night) retargets one interpolated `env`, so the page
// cross-fades between conditions instead of hard-cutting. Reading content sits
// on dark glass, so it stays legible in every state.
//
// Particle character mirrors the real Android app (see the Flutter
// RainParticlePainter): hash-seeded streaks/dots, looped with per-particle
// speed, size and opacity. Intensities fade with the env, so states blend.

const IMG = `${import.meta.env.VITE_MEDIA_URL}/projects/aether`;

// Each state is a target the env eases toward. sky = [top, mid, bottom].
const STATES = {
  sunny: {
    label: 'Sunny', screen: `${IMG}/home.png`,
    sky: ['#255f86', '#3f93bf', '#7cc4dd'], glow: '#ffd587', glowPos: [0.8, 0.14], glowA: 0.85,
    rain: 0, snow: 0, stars: 0, motes: 0.6, cloud: 0.14, wind: 0.15, storm: 0, accent: '#ffce7a',
  },
  cloudy: {
    label: 'Cloudy', screen: `${IMG}/home.png`,
    sky: ['#38434f', '#54626f', '#84929c'], glow: '#dfe7ec', glowPos: [0.62, 0.2], glowA: 0.4,
    rain: 0, snow: 0, stars: 0, motes: 0.25, cloud: 0.95, wind: 0.35, storm: 0, accent: '#c3ced6',
  },
  rain: {
    label: 'Rain', screen: `${IMG}/rain.png`,
    sky: ['#141f34', '#213a56', '#33506e'], glow: '#4d6f92', glowPos: [0.7, 0.16], glowA: 0.35,
    rain: 0.62, snow: 0, stars: 0, motes: 0, cloud: 0.7, wind: 0.4, storm: 0, accent: '#84acd2',
  },
  snow: {
    label: 'Snow', screen: `${IMG}/snow.png`,
    sky: ['#20303f', '#304254', '#47596c'], glow: '#b6c6d3', glowPos: [0.5, 0.18], glowA: 0.45,
    rain: 0, snow: 0.9, stars: 0.15, motes: 0, cloud: 0.6, wind: 0.25, storm: 0, accent: '#d0dbe4',
  },
  storm: {
    label: 'Storm', screen: `${IMG}/rain.png`,
    sky: ['#0b131e', '#151f2d', '#26313f'], glow: '#3a536e', glowPos: [0.68, 0.12], glowA: 0.28,
    rain: 0.78, snow: 0, stars: 0, motes: 0, cloud: 0.85, wind: 0.95, storm: 1, accent: '#9bb3c8',
  },
  night: {
    label: 'Night', screen: `${IMG}/starry.png`,
    sky: ['#05080f', '#0a1120', '#131f36'], glow: '#cdd7e6', glowPos: [0.74, 0.15], glowA: 0.5,
    rain: 0, snow: 0, stars: 1, motes: 0, cloud: 0.1, wind: 0.1, storm: 0, accent: '#a4b5cd',
  },
};
const ORDER = ['sunny', 'cloudy', 'rain', 'snow', 'storm', 'night'];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (i, s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };

function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// A fully interpolatable snapshot of the sky, built from a STATES entry.
function toEnv(s) {
  return {
    sky: [hex(s.sky[0]), hex(s.sky[1]), hex(s.sky[2])], glow: hex(s.glow), glowPos: [...s.glowPos], glowA: s.glowA,
    rain: s.rain, snow: s.snow, stars: s.stars, motes: s.motes, cloud: s.cloud, wind: s.wind, storm: s.storm,
    accent: hex(s.accent),
  };
}
function easeEnv(env, goal, k) {
  const cs = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  env.sky = [cs(env.sky[0], goal.sky[0]), cs(env.sky[1], goal.sky[1]), cs(env.sky[2], goal.sky[2])];
  env.glow = cs(env.glow, goal.glow); env.accent = cs(env.accent, goal.accent);
  env.glowPos = [lerp(env.glowPos[0], goal.glowPos[0], k), lerp(env.glowPos[1], goal.glowPos[1], k)];
  for (const p of ['glowA', 'rain', 'snow', 'stars', 'motes', 'cloud', 'wind', 'storm']) env[p] = lerp(env[p], goal[p], k);
}

export function initAetherWeather(initial = 'rain', ambient = null) {
  const switcher = document.querySelector('[data-aether-switch]');
  const screen = document.querySelector('[data-aether-screen]');
  const label = document.querySelector('[data-aether-scene-label]');
  const readout = document.querySelector('[data-aether-readout]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(location.search).has('static');

  const canvas = document.createElement('canvas');
  canvas.className = 'aether-sky';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });

  let W = 0, H = 0, dpr = 1;
  function resize() {
    const w = window.innerWidth || document.documentElement.clientWidth;
    const h = window.innerHeight || document.documentElement.clientHeight;
    if (!w || !h) return; // hidden / detached — keep the last good frame, don't blank
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = w; H = h;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  // Setting canvas.width clears the bitmap; if we aren't running an animation
  // loop (reduced motion / hidden tab) repaint the resting frame ourselves.
  window.addEventListener('resize', () => { resize(); if (!raf) renderStatic(); }, { passive: true });

  const env = toEnv(STATES[initial]);
  let goal = toEnv(STATES[initial]);
  let current = initial;
  let flash = 0, flashCue = 0, bolt = null;

  // Persistent particle fields, modulated by env intensities so they fade in/out.
  const rainP = Array.from({ length: 340 }, (_, i) => ({ x: rand(i, 1), y: rand(i, 2), len: 0.02 + rand(i, 3) * 0.03, spd: 0.5 + rand(i, 4) * 0.6, a: 0.42 + rand(i, 5) * 0.42, w: 0.7 + rand(i, 6) * 0.9 }));
  const snowP = Array.from({ length: 380 }, (_, i) => ({ x: rand(i, 7), y: rand(i, 8), r: 3 + rand(i, 9) * 4, spd: 0.05 + rand(i, 10) * 0.08, sway: 0.5 + rand(i, 11) * 1.4, ph: rand(i, 12) * 6.28 }));
  const starP = Array.from({ length: 220 }, (_, i) => ({ x: rand(i, 13), y: rand(i, 14) * 0.82, r: 0.8 + rand(i, 15) * 1.9, ph: rand(i, 16) * 6.28, tw: 0.5 + rand(i, 17) * 2.2 }));
  const moteP = Array.from({ length: 46 }, (_, i) => ({ x: rand(i, 18), y: rand(i, 19), r: 1.5 + rand(i, 20) * 3, vx: (rand(i, 21) - 0.5) * 0.02, vy: -0.01 - rand(i, 22) * 0.02 }));
  const cloudP = Array.from({ length: 6 }, (_, i) => ({ x: rand(i, 23), y: 0.08 + rand(i, 24) * 0.4, w: 0.4 + rand(i, 25) * 0.4, h: 0.12 + rand(i, 26) * 0.1, spd: 0.004 + rand(i, 27) * 0.006 }));

  function paintSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(env.sky[0], 1)); g.addColorStop(0.55, rgba(env.sky[1], 1)); g.addColorStop(1, rgba(env.sky[2], 1));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    if (env.glowA > 0.01) { // sun / moon
      const gx = env.glowPos[0] * W, gy = env.glowPos[1] * H, gr = Math.max(W, H) * 0.55;
      const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      rg.addColorStop(0, rgba(env.glow, env.glowA)); rg.addColorStop(0.5, rgba(env.glow, env.glowA * 0.25)); rg.addColorStop(1, rgba(env.glow, 0));
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }
    // top vignette keeps header + hero type legible on bright skies
    const v = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    v.addColorStop(0, 'rgba(4,7,14,0.3)'); v.addColorStop(1, 'rgba(4,7,14,0)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H * 0.45);
  }

  function paintClouds(t) {
    if (env.cloud < 0.02) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const c of cloudP) {
      const x = ((c.x + t * c.spd) % 1.3 - 0.15) * W, y = c.y * H, w = c.w * W, h = c.h * H;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, w);
      rg.addColorStop(0, rgba(env.glow, 0.06 * env.cloud)); rg.addColorStop(0.6, rgba(env.glow, 0.03 * env.cloud)); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, 6.2832); ctx.fill();
    }
    ctx.restore();
  }

  function paintRain(t) {
    if (env.rain < 0.02) return;
    const n = Math.round(rainP.length * clamp01(env.rain));
    const slant = 0.1 + env.wind * 0.08; // gentle, near-vertical
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const p = rainP[i];
      const y = ((p.y + t * p.spd * (1 + env.storm * 0.6)) % 1) * (H * 1.2) - H * 0.1;
      const x = p.x * W;
      const len = p.len * H * (1 + env.storm * 0.3), dx = slant * len;
      const a = p.a * env.rain;
      ctx.lineWidth = p.w;
      // faint motion-blur tail fading to a bright leading head (per the shadertoy ref)
      const g = ctx.createLinearGradient(x, y, x - dx, y + len);
      g.addColorStop(0, 'rgba(209,228,252,0)');
      g.addColorStop(0.7, `rgba(209,228,252,${a * 0.12})`);
      g.addColorStop(1, `rgba(226,239,255,${a})`);
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx, y + len); ctx.stroke();
    }
  }

  function paintSnow(t) {
    if (env.snow < 0.02) return;
    const n = Math.round(snowP.length * clamp01(env.snow));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#eef4ff';
    for (let i = 0; i < n; i++) {
      const p = snowP[i];
      const y = ((p.y + t * p.spd) % 1) * (H * 1.1) - H * 0.05;
      const x = (p.x + Math.sin(t * p.sway + p.ph) * 0.02) * W;
      ctx.globalAlpha = (0.72 + 0.28 * Math.sin(t * 1.4 + p.ph)) * env.snow;
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.2832); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function paintStars(t) {
    if (env.stars < 0.02) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffffff';
    for (const p of starP) {
      ctx.globalAlpha = (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph))) * env.stars;
      ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.2832); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function paintMotes(t) {
    if (env.motes < 0.02) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of moteP) {
      p.x = (p.x + p.vx * 0.01 + 1) % 1; p.y = (p.y + p.vy * 0.01 + 1) % 1;
      const x = p.x * W, y = p.y * H;
      ctx.fillStyle = rgba(env.glow, 0.35 * env.motes);
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.2832); ctx.fill();
    }
    ctx.restore();
  }

  function paintFlash() {
    if (flash < 0.01) return;
    ctx.fillStyle = `rgba(220,232,245,${flash * 0.45})`; ctx.fillRect(0, 0, W, H);
  }

  // A jagged main channel that descends from the top, sprouting a few shorter
  // forks — returns line segments [x1,y1,x2,y2] in device-independent px.
  function makeBolt() {
    const segs = [];
    let x = W * (0.15 + Math.random() * 0.7), y = 0;
    const steps = 9 + (Math.random() * 6 | 0);
    const stepY = H / steps;
    for (let i = 0; i < steps; i++) {
      const nx = x + (Math.random() - 0.5) * W * 0.07;
      const ny = y + stepY * (0.7 + Math.random() * 0.6);
      segs.push([x, y, nx, ny]);
      if (Math.random() < 0.4 && i > 1) { // sprout a fork
        let bx = nx, by = ny;
        const dir = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6);
        const branch = 2 + (Math.random() * 3 | 0);
        for (let j = 0; j < branch; j++) {
          const l = stepY * (0.55 + Math.random() * 0.5);
          const ex = bx + Math.sin(dir) * l + (Math.random() - 0.5) * W * 0.02;
          const ey = by + Math.cos(dir) * l * 0.8;
          segs.push([bx, by, ex, ey]);
          bx = ex; by = ey;
        }
      }
      x = nx; y = ny;
      if (y > H * 0.92) break;
    }
    return segs;
  }

  function paintBolt() {
    if (!bolt || bolt.life < 0.03) return;
    const a = bolt.life;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const trace = () => { ctx.beginPath(); for (const s of bolt.segs) { ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); } ctx.stroke(); };
    ctx.strokeStyle = `rgba(150,190,255,${0.32 * a})`; ctx.lineWidth = 7; trace(); // glow
    ctx.strokeStyle = `rgba(236,244,255,${0.95 * a})`; ctx.lineWidth = 1.8; trace(); // core
    ctx.restore();
  }

  let last = performance.now(), raf = 0;
  function frame(now) {
    if (W !== window.innerWidth || H !== window.innerHeight) resize(); // self-heal a bad/late size
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const t = now / 1000;
    easeEnv(env, goal, 1 - Math.pow(0.0009, dt)); // ~1s cross-fade
    document.documentElement.style.setProperty('--wx-accent', rgba(env.accent, 1));

    // storm lightning — a forked bolt with a soft screen flash behind it
    if (env.storm > 0.4) { flashCue -= dt; if (flashCue <= 0) { bolt = { segs: makeBolt(), life: 1 }; flash = 0.5; flashCue = 2.8 + Math.random() * 4.5; if (ambient) setTimeout(() => ambient.thunder(), 140 + Math.random() * 460); } }
    flash *= Math.pow(0.02, dt);
    if (bolt) bolt.life *= Math.pow(0.004, dt);

    paintSky(); paintClouds(t); paintStars(t); paintMotes(t); paintRain(t); paintSnow(t); paintFlash(); paintBolt();
    raf = requestAnimationFrame(frame);
  }

  function renderStatic() { // reduced motion / hidden tab: one calm frame
    easeEnv(env, goal, 1);
    document.documentElement.style.setProperty('--wx-accent', rgba(env.accent, 1));
    paintSky(); paintClouds(0); paintStars(0.5); paintMotes(0); paintRain(0.5); paintSnow(0.5);
  }

  function start() { if (raf || reduced) return; resize(); last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  function setState(name) {
    if (!STATES[name]) return;
    current = name; goal = toEnv(STATES[name]);
    if (ambient) ambient.setScene(name); // rain/storm play a rain bed, else lo-fi
    document.body.dataset.weather = name;
    if (screen) { screen.src = STATES[name].screen; screen.alt = `Aether Android app in the ${STATES[name].label.toLowerCase()} scene`; }
    if (label) label.textContent = STATES[name].label.toUpperCase();
    if (readout) readout.textContent = STATES[name].label;
    if (switcher) switcher.querySelectorAll('[data-weather]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.weather === name)));
    if (reduced || document.hidden) renderStatic();
  }

  if (switcher) {
    switcher.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-weather]');
      if (btn) setState(btn.dataset.weather);
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stop(); return; }
    resize();
    if (reduced) renderStatic(); else start();
  });

  setState(initial);
  if (reduced) renderStatic(); else start();
  return { setState, states: ORDER };
}
