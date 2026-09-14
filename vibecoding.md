# Vibe coding — how we build here

The house style for this repo. Read it before writing code, not after.

## The senior engineer on your shoulder

You know him. Long ponytail. Oval glasses. Has been at the company longer than the
version control. You show him fifty lines; he looks at them, says nothing, and
replaces them with one.

Write as if he's reviewing every diff. He doesn't reward cleverness — he rewards
the smallest thing that works and reads plainly six months from now.

## The ladder

Before writing code, stop at the first rung that holds:

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Already in this codebase?  → reuse it, don't rewrite
3. Stdlib does it?            → use it
4. Native platform feature?   → use it
5. Installed dependency?      → use it
6. One line?                  → one line
7. Only then: the minimum that works
```

Climb from the top every time. Most tasks are answered by rungs 1–4.

### What the rungs mean here

- **1 — Does this need to exist?** No speculative options, config flags, or
  abstractions for a second caller that doesn't exist yet. Delete before you add.
- **2 — Already in this codebase?** This site has strong existing patterns: the
  charcoal iris-cover transition, GSAP timelines, the shared design-system tokens
  in `src/styles/main.css`, `data-*`-driven content. Reuse the pattern; don't
  invent a parallel one. (See the `motion-system` and `portfolio-frontend` skills.)
- **3 — Stdlib does it?** Reach for the language/runtime built-ins before a helper.
- **4 — Native platform feature?** The browser is the framework. CSS `scroll-snap`,
  `position: sticky`, `clip-path`, `:has()`, `sessionStorage`, `IntersectionObserver`,
  view transitions — prefer these over a script or a library that reimplements them.
  Example: "don't overshoot the project sections" is CSS `scroll-snap`, not a JS
  momentum limiter.
- **5 — Installed dependency?** We already ship `gsap`, `three`, `lenis`. Use them
  before adding anything new. Adding a dependency is a decision, not a reflex —
  raise it, don't just `npm install`.
- **6 — One line?** If it's one clear line, it's one line. No wrapper, no util file.
- **7 — The minimum that works.** Match the surrounding code's naming, comment
  density, and idiom. Boring and consistent beats novel.

## A few standing rules

- **Match the neighbours.** New CSS reads like the CSS above it; new JS like the
  module it lives in. Same spacing, same quote style, same comment voice.
- **Design tokens, not magic numbers.** Colours, spacing, easing and fonts come
  from the `:root` variables in `main.css` (`--charcoal`, `--cream`, `--ease`,
  `--gutter`, `--section`, `--display`, `--mono`, …). Don't hardcode a hex or a
  cubic-bezier that already has a name.
- **Respect `prefers-reduced-motion`.** Every animation path has a reduced-motion
  branch that renders a calm, static result. New motion must too.
- **Keep content in data / markup, code in modules.** Copy, projects and places
  live in `index.html` and `src/data/*`. Behaviour lives in `src/modules/*`.
- **Don't commit build output.** `dist/` is generated (`npm run build`); never
  hand-edit it and don't let a verification build leak into a commit.
- **Verify what you can see.** If a change is visible in the browser, check it in
  the preview before calling it done — never ask the user to check for you.
- **No em dashes.** Never write an em dash (the long dash, U+2014) in copy, data
  strings or UI text. Use a comma, colon, parentheses or a period; ranges take an
  en dash (`–`), label separators a middot (`·`). Code comments are exempt.

> When in doubt, do less. The best diff is often the one that deletes a rung
> someone else climbed too far up.
