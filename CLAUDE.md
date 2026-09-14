# CLAUDE.md

Guidance for Claude Code working in this repo. Keep it lean; the details live in
the linked files and skills.

## What this is

Kyrie / **Phyo Aung Zaw**'s personal portfolio — an immersive, editorial site built
with **Vite · Three.js · GSAP (ScrollTrigger) · Lenis** + the Web Audio API. One
visual language across three zones / four pages:

| Page | Zone | Entry module |
| --- | --- | --- |
| `index.html` | **Work** — selected product work | `src/main.js` |
| `world.html` | **Explore my world** — globe + country discovery | `src/world.js` |
| `country.html` | **Deep dive** — a country photo journal | `src/country.js` |
| `discovery.html` | redirect helper → `world.html?view=discovery` | — |

Pages are separate documents; navigation between them is a real page load, stitched
together by the **iris-cover transition system** (see the `motion-system` skill).

## How to build code here

Follow the ladder in `vibecoding.md` — climb from rung 1 every time, stop at the first
that holds. Prefer native platform features and existing patterns over new code or new
dependencies. Match the surrounding style.

@vibecoding.md

## Skills

- **`portfolio-frontend`** — framework & file-structure conventions: where content,
  modules, WebGL and the design system live, and how to add/edit projects, places
  and scroll animations.
- **`motion-system`** — the transition & animation rules: the charcoal iris-cover
  hand-off between pages, GSAP timeline conventions, easings, and reduced-motion.

Reach for these whenever you touch the front-end or any motion.

## Map

```
index.html / world.html / country.html   markup + copy (edit content here)
src/
  main.js  world.js  country.js  discovery.js   per-page entry points
  data/           projects.js, places.js         content data
  modules/        work, countryDiscovery, nav, sound, reveal, cursor, headerWave, …
  gl/             LiquidSurface, Globe, Particles, TouchTexture  (Three.js / WebGL)
  audio/          Ambient.js  (generative Web Audio, no files)
  styles/         main.css (shared design system + tokens) + per-page css
```

## Design system

Colours, spacing, easing and fonts are `:root` variables in `src/styles/main.css`
(`--charcoal`, `--cream`, `--paper`, `--ease`, `--gutter`, `--section`, `--display`,
`--mono`). Use the tokens — don't hardcode values that already have a name.

## Commands

```bash
npm run dev       # vite dev server → http://localhost:5173 (HMR)
npm run build     # production build → dist/ (all 4 entry points)
npm run preview   # preview the production build
```

- `dist/` is generated output — never hand-edit it, and don't commit a build made
  only for verification.
- Append **`?static`** to any URL to force the reduced-motion / no-intro path.

## Non-negotiables

- Respect `prefers-reduced-motion` on every animation path.
- Keep the three pages visually one system — shared header/footer rhythm, shared tokens.
- Verify visible changes in the browser preview before saying they're done.
- **Never use em dashes (the long dash, U+2014) in copy or UI text.** Rewrite with a
  comma, colon, parentheses, or a period; for date or number ranges use an en dash
  (`–`), and for label separators use a middot (`·`). Applies to all site copy, data
  strings, and any new writing.
