# Kyrie Paz — Portfolio

An immersive portfolio for **Kyrie (Phyo Aung Zaw)**,
Senior Android & Flutter Engineer. The whole site speaks one visual language: a
refined GPU **fluid liquid-distortion** shader that reacts to your cursor, used for
the hero background and for every project card, with a drifting **particle field**
and an optional **ambient soundscape**.

Built with **Vite · Three.js · GSAP (ScrollTrigger) · Lenis** + the Web Audio API.

## Features

- 🌊 **Fluid liquid hero** — a custom GLSL domain-warped shader (6-octave fBm, fine
  filaments, ordered dithering to kill banding, gentle desaturation) distorted by a
  pointer "touch texture" trail (`src/gl/`).
- ✦ **Particle field** — ~900 soft GPU particles drifting with cursor parallax,
  layered over the hero (`src/gl/Particles.js`).
- 🔊 **Ambient soundscape** — a calm, generative pad + reverb built entirely with the
  Web Audio API (no audio files), behind a nav toggle. Starts silent; fades in on
  click (`src/audio/Ambient.js`).
- 🎴 **Per-project liquid cards** — each card is its own WebGL surface with a unique
  elegant palette (set via `data-*` attributes in `index.html`).
- ⏳ **Preloader** with animated % counter and reveal.
- 🖱️ **Custom cursor** (blend-mode) with `View` state, + **magnetic** buttons.
- 📜 **Smooth scroll** (Lenis) synced to GSAP ScrollTrigger.
- ✨ **Scroll reveals** — masked text, per-character/line splits, counters, marquee parallax.
- ♿ Respects `prefers-reduced-motion` — renders a single static frame, no animation.
  Append **`?static`** to the URL to force this low-power/no-intro mode for testing.
- 📱 Fully responsive.

## Getting started

```bash
npm install
npm run dev      # start dev server → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Make it yours

Everything user-facing lives in **`index.html`** (content) and a few CSS variables.

| What | Where |
| --- | --- |
| Name / role / bio / links | `index.html` (search for `Kyrie Paz`, `mailto:`, social `<a>` tags) |
| Projects (title, tags, year) | `.project` blocks in `index.html` |
| **Project colours** | `data-bg` / `data-c1` / `data-c2` / `data-c3` on each `.project` |
| Hero fluid colours / intensity | `initWebGL()` in `src/main.js` (the hero `colors` object) |
| Particles (count, size, colour) | `initWebGL()` in `src/main.js` (the `Particles` options) |
| Ambient sound (chord, volume) | `src/audio/Ambient.js` (`chord`, master gain) |
| Fonts | `<link>` in `index.html` + `--font-*` in `src/styles/main.css` |
| Palette / accent / spacing / easing | `:root` variables in `src/styles/main.css` |

> **Contact email:** currently `kyrie.paz@vietpay.com` in `index.html`. Your resume
> also lists `phyoaz14@gmail.com` — swap if you'd rather visitors use that. Phone
> number is intentionally left off a public page.

### Using real project images (optional next step)

Right now each project "image" is a procedural liquid gradient. To swap in real
screenshots with a hover displacement, drop images in `public/` and we can extend
`LiquidSurface` to sample an image texture instead of the procedural palette.

## Deploy

It's a static site — deploy the `dist/` folder anywhere (Vercel, Netlify, GitHub
Pages, Cloudflare Pages). `vite.config.js` uses a relative `base` so it works from
a subfolder too.

## Structure

```
index.html              # markup + content (edit me)
src/
  main.js               # bootstraps everything
  styles/main.css       # design system
  gl/
    LiquidSurface.js     # reusable WebGL liquid plane (hero + cards)
    TouchTexture.js      # cursor-trail texture that drives the distortion
    Particles.js         # drifting particle field with cursor parallax
  audio/
    Ambient.js           # generative Web Audio soundscape
  modules/
    preloader.js  cursor.js  magnetic.js  nav.js  sound.js
    reveal.js            # all GSAP scroll animations
    split.js             # text splitting helpers
```

---

Colours, copy and projects are **placeholders** — swap in your real work. 🖤
