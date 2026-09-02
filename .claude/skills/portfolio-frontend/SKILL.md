---
name: portfolio-frontend
description: Conventions for this Vite + Three.js + GSAP + Lenis editorial portfolio — the four-page/three-zone structure, the shared design-system tokens in src/styles/main.css, where content vs behaviour lives, how to add or edit projects and places, the WebGL layer, and the gotchas (the .js opacity gate, reduced-motion, ?static). Use when editing anything in this site's front-end (index/world/country pages, src/, styles).
---

# Portfolio front-end

Follow the ladder in `vibecoding.md`. Reuse the patterns below; don't invent parallel ones.

## Stack & pages

**Vite · Three.js · GSAP + ScrollTrigger · Lenis · Web Audio.** Four separate documents,
one visual language:

- `index.html` → **Work** (`src/main.js`) — hero + selected work + experience + contact.
- `world.html` → **Explore my world** (`src/world.js`) — Three.js globe + country discovery view.
- `country.html` → **Deep dive** (`src/country.js`) — a country photo journal.
- `discovery.html` → redirect to `world.html?view=discovery`.

Navigation between pages is a real page load, sewn together by the iris-cover transition
system — see the **`motion-system`** skill before touching any transition or animation.

## Where things live

```
index.html / world.html / country.html   markup + copy — edit content HERE
src/
  main.js world.js country.js discovery.js   per-page entry points (bootstrap + page motion)
  data/projects.js      the Work page's projects (rendered by modules/work.js → #work-list)
  data/places.js        countries + their memories (world / discovery / country pages)
  modules/              work, countryDiscovery, nav, sound, reveal, cursor, magnetic,
                        headerWave, split, appScreens, preloader, liquidTrail, story
  gl/                   LiquidSurface, Globe, Particles, TouchTexture (Three.js / WebGL)
  audio/Ambient.js      generative Web Audio soundscape (no audio files)
  styles/main.css       shared design system + tokens; + world/country/discovery css
```

Rule of thumb: **content in markup/data, behaviour in modules, look in CSS tokens.**

## Design system (src/styles/main.css `:root`)

Use the tokens — never hardcode a value that has a name:

- Colour: `--cream #f2ede3`, `--paper #e8dfd1`, `--charcoal #282722`, `--charcoal-soft`,
  `--terracotta`, `--sand`, `--line`, `--line-light`.
- Rhythm: `--gutter`, `--section`. Motion: `--ease` (`cubic-bezier(.2,.7,.2,1)`).
- Type: `--display` (Instrument Serif), `--body` (Manrope), `--mono` (DM Mono).

Header is `position: fixed; height: 84px` (68px under 700px). Breakpoints: **980px**
(work-nav hides, `.project` columns stack) and **700px** (compact header, tighter gutter).

## Editing content

- **Add / change a Work project:** edit `src/data/projects.js`. Each project drives
  `modules/work.js` → `projectCard()`: `index, layout, eyebrow, title, subtitle,
  description, tags[], year, href, surface`, and either a procedural `screen`+`tint`
  or a real `image`. Colours come from `surface` / the palette, not inline hex.
- **Add / change a place:** edit `src/data/places.js` — `id, country, year, cities
  ("A / B / C"), coordinates, note, photos, stories, memories[]`. Each memory has a
  `palette [a,b,c]`, `city`, `moment`, `index`, `aspect`, and optional `src`/`alt`.
  The globe, discovery scenes and the deep-dive journal all read from this.

## Gotchas (these have bitten before)

- **The `.js` opacity gate.** `main.css` sets `.js [data-reveal], .js [data-hero-line],
  .js .project__content, .js .project__visual { opacity: 0 }` — content is invisible
  until GSAP ScrollTrigger reveals it on scroll. If content "won't show" in a headless
  check, it's this, not a layout bug (force the reveal tweens to complete to inspect).
- **Lenis is a dependency but the Work page uses native scroll** — `main.js` does not
  init Lenis or `modules/nav.js`. Don't assume a smooth-scroll instance exists there.
- **Reduced motion & `?static`.** Every page has a `prefers-reduced-motion` branch that
  renders a single calm frame. Append `?static` to force it. New features must honour both.
- **Per-page headers differ** (`.site-header--work`, `.world-header`, `.country-header`)
  but share tokens. A shared component like `.nav__sound` lives on all three — scope an
  edit (e.g. `.site-header .nav__sound { … }`) if you only mean one page.
- **`dist/` is generated.** Never hand-edit; rebuild with `npm run build`.

## Verify

Dev server: `npm run dev` → `http://localhost:5173` (HMR). After a visible change, check
it in the browser preview (console clean, layout intact) before calling it done.
