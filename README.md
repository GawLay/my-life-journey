# Phyo Aung Zaw · Portfolio

The personal portfolio of **Kyrie (Phyo Aung Zaw)**, a senior mobile engineer
(Android & Flutter) based in Ho Chi Minh City.

It is two things in one site:

- **Work:** selected product case studies, each told through its own interactive
  scene instead of a static screenshot grid.
- **World:** a photo journal of the places I have lived and travelled, reached
  through an interactive 3D globe.

Both halves share one editorial visual language (warm paper tones, a serif display
face, mono labels) and are stitched together by native page transitions, so moving
between separate pages feels like one continuous piece.

## The site

| Page | What it is | Entry |
| --- | --- | --- |
| `index.html` | **Work:** hero, selected projects, experience, practice, contact | `src/main.js` |
| `project.html?project=<id>` | **Case study** for one project | `src/project.js` |
| `world.html` | **Explore my world:** 3D globe and a country discovery gallery | `src/world.js` |
| `country.html?place=<id>` | **Country journal:** a long-form photo story for one country | `src/country.js` |
| `discovery.html` | Redirect helper to `world.html?view=discovery` | inline |

### Case studies

Each project has a signature interaction built for it:

- **Aether Weather:** the whole page becomes a living sky. A six-state switcher
  (sunny, cloudy, rain, snow, storm, night) cross-fades one canvas atmosphere, with
  particles modelled on the real app's rain painter.
- **TrueMoney Agent App:** a live agent service network, with transactions streaming
  out from a 23K-agent core.
- **Portfolio App:** an interactive recreation of my résumé app inside a single phone.
- **Beehive:** one order travelling across two apps, from browsing to the doorstep.

### Explore my world

- A **Three.js globe** you can drag and spin. Visited countries are selectable, and a
  few "someday" places sit alongside them.
- **Country journals** for Myanmar, Thailand and Vietnam: city by city, with photos
  and short looping video clips.

### Across every page

- **Page transitions** using the native cross-document View Transitions API (`@view-transition`
  plus a small head script), so the next page is revealed over the current one
  without a blank flash.
- **Liquid lettering:** display type and headers ripple under the cursor.
- **Ambient soundtrack:** an optional generative lo-fi loop (pad, sub bass, arpeggio,
  dub delay) made entirely with the Web Audio API, no audio files. It starts only on
  a user gesture and keeps its place in the progression when you change pages.
- **Reduced motion:** every animation has a calm, static fallback for
  `prefers-reduced-motion`. Add `?static` to any URL to force it.
- Fully responsive, from phone to wide desktop.

## Built with

| | |
| --- | --- |
| Build | [Vite](https://vite.dev) 6, multi-page (one HTML entry per page) |
| 3D | [Three.js](https://threejs.org) for the globe |
| Motion | [GSAP](https://gsap.com) + ScrollTrigger |
| Transitions | Native View Transitions API |
| Sound | Web Audio API |
| Media hosting | [Supabase Storage](https://supabase.com/docs/guides/storage) (public bucket) |
| Type | Instrument Serif, Manrope, DM Mono (Google Fonts) |
| Hosting | GitHub Pages (static) |

No front-end framework: plain HTML, CSS custom properties and ES modules.

## Getting started

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build
```

### Media

Photos, videos and project screenshots are **not in this repo**. They live in the
public Supabase Storage bucket `life-journey` and are loaded from the URL in `.env`:

```bash
VITE_MEDIA_URL=https://<project>.supabase.co/storage/v1/object/public/life-journey
```

JavaScript reads it as `import.meta.env.VITE_MEDIA_URL`, and HTML as `%VITE_MEDIA_URL%`.
The bucket mirrors these paths:

```
life-journey/
  world/<country>/<file>.webp | .m4v     photos, clips and their posters
  projects/<project>/<file>.png          app screenshots
```

To add a photo: upload it to the matching folder in the bucket, then reference it in
`src/data/places.js` as `` `${MEDIA}/world/<country>/<file>.webp` ``. Sizes, ratios
and export settings are in [PHOTO_CONTENT_GUIDE.md](./PHOTO_CONTENT_GUIDE.md).

## Editing content

| What | Where |
| --- | --- |
| Name, bio, experience, contact links | `index.html` |
| Projects and case-study copy | `src/data/projects.js` |
| Countries, cities, photos, captions | `src/data/places.js` |
| Colours, spacing, easing, fonts | `:root` tokens in `src/styles/main.css` |
| Soundtrack | `src/audio/Ambient.js` |

## Structure

```
index.html  project.html  world.html  country.html  discovery.html
public/
  page-wave.js          cross-document page transition (head script)
  data/                 world-countries.geojson for the globe
src/
  main.js  project.js  world.js  country.js      one entry per page
  data/                 projects.js, places.js (all content)
  modules/              page behaviour: work grid, case-study scenes,
                        country discovery, header wave, liquid text, sound
  gl/                   Globe.js (Three.js)
  audio/                Ambient.js (generative Web Audio)
  styles/               main.css (shared tokens) + one stylesheet per page
```

## Deploy

It is a fully static site. `npm run build` writes every page to `dist/`, which can be
published to GitHub Pages (or any static host). `vite.config.js` uses a relative
`base`, so it also works from a project subpath like `username.github.io/repo/`.
`dist/`, `node_modules/` and `public/images/` are git-ignored.

## Working on it

House rules live in [vibecoding.md](./vibecoding.md) (reuse before adding, native
platform features first, design tokens over magic numbers) and in
[CLAUDE.md](./CLAUDE.md) / [AGENTS.md](./AGENTS.md) for AI-assisted work.
