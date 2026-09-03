# Portfolio agent guide

This is Phyo Aung Zaw's editorial portfolio: Vite, Three.js, GSAP/ScrollTrigger,
Lenis, and generative Web Audio. Keep the site warm, restrained, and coherent across
Work, World, and Country Story.

## Start here

Read [vibecoding.md](./vibecoding.md) before changing code. Apply its implementation
ladder: reuse an existing pattern or browser feature before adding code or a dependency.

For front-end changes, also read the project reference skill at
[`.claude/skills/portfolio-frontend/SKILL.md`](./.claude/skills/portfolio-frontend/SKILL.md).
For transitions, scrolling, reveals, or any other animation, read
[` .claude/skills/motion-system/SKILL.md`](./.claude/skills/motion-system/SKILL.md).
These are project-local references; do not treat Claude launch configuration or its
permission settings as Codex instructions.

## Architecture and source of truth

- `index.html` + `src/main.js`: Work.
- `world.html` + `src/world.js`: the interactive globe and country discovery.
- `country.html` + `src/country.js`: a country deep dive.
- `discovery.html`: legacy redirect to `world.html?view=discovery`.
- `src/data/projects.js` and `src/data/places.js`: project and country content.
- `src/modules/`: UI behaviour; `src/gl/`: Three.js; `src/audio/Ambient.js`: sound;
  `src/styles/main.css`: shared tokens and system styles.

World and Country Discovery are **two states of the same `world.html` experience**.
`src/modules/countryDiscovery.js` changes `viewMode` and reuses the mounted `Globe` from
`src/world.js`; selecting a country must not create a second globe or route away. Only
the `DEEP DIVE` action opens `country.html`.

Keep copy in markup/data, behaviour in modules, and visual rules in CSS. Use existing
tokens from `src/styles/main.css` (`--gutter`, `--section`, `--ease`, colour and font
tokens) instead of introducing equivalent hard-coded values.

## Change rules

- Respect `prefers-reduced-motion` (and the `?static` test path) for every new motion.
- Match neighbouring code and reuse the existing GSAP/iris-cover system for real
  page-to-page transitions. Do not add dependencies without explicit approval.
- `dist/` is generated: never edit it by hand or commit a verification build.
- Preserve the shared lo-fi preference across page loads; Web Audio still needs a user
  gesture before it can audibly begin in most browsers.

## Verify

Run `npm run build` for every implementation change. For visible changes, also inspect
the relevant page in the browser when practical (`npm run dev`, then port 5173) and
check that layout, motion, and the browser console remain clean.
