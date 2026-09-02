---
name: motion-system
description: The motion, animation and page-transition rules for this portfolio — the charcoal iris-cover hand-off that stitches the separate pages together, the reveal-from-cover pattern, GSAP timeline/easing/duration conventions, ScrollTrigger usage, reduced-motion handling, and the hidden-tab requestAnimationFrame caveat when verifying. Use when adding or changing ANY transition, scroll animation, reveal, or cover.
---

# Motion system

One motion language across every page. Reuse these patterns (ladder rung 2) — do not
invent a second transition style.

## The iris-cover primitive

Every page-to-page transition is a full-screen cover that irises open or closed via
`clip-path: circle()`:

- **Covering** = `clip-path: circle(150% at 50% 50%)` (the whole page is inside the circle).
- **Revealed** = `clip-path: circle(0% at 50% 50%)` (cover shrunk to nothing).
- **Reveal** an incoming page: animate `150% → 0%`.  **Cover** an outgoing page: animate `0% → 150%`.

The cover elements (all `position: fixed; inset: 0; z-index: 10000; background: var(--charcoal)`):

- `.world-entry` (world.html) and `.country-entry` (country.html) — CSS default is
  `circle(150%)`, i.e. they **cover on load** and get revealed by JS.
- `.work-entry` (index.html) — CSS default is `circle(0%)` (hidden); it only covers when
  `html.is-entering` is set, so a **first visit is untouched**.

Ease `power3.inOut`, ~0.85–1.1s. Label text is a small `--mono` caption centered in the cover.

### ⚠️ Never `clearProps` clip-path on a cover whose CSS default is `circle(150%)`

`.world-entry` / `.country-entry` default to **covering**. If a reveal tween ends with
`clearProps: 'clipPath'`, the element snaps back to the CSS default and **re-covers the
screen**. Leave the inline `circle(0%)` in place instead. (`.work-entry` defaults to
`circle(0%)`, so clearing props there is fine — it stays hidden.)

## Seamless hand-off between two documents

A page load is a hard boundary. To avoid a flash / hard cut, the **incoming page must
already be painting a matching cover before its first paint**, then iris it open:

1. **Outgoing page** animates its cover closed (`0% → 150%`) and navigates in the tween's
   `onComplete` (`window.location.assign(...)`). Set any hand-off state *before* the tween.
2. **Incoming page** decides to cover *before first paint* via an inline `<head>` script
   that reads a flag and adds a class — never via a module that runs after paint:
   - Work return: `world.js` sets `sessionStorage 'paz-entry' = 'work'`; `index.html`'s head
     script consumes it and adds `html.is-entering`; `main.js` irises `.work-entry` open and
     holds the hero intro a beat (`intro` timeline `delay`).
   - Deep-dive → discovery: `world.js#revealIntoDiscovery` keeps `.world-entry` covering,
     enters discovery in a `reveal` mode (content settles behind the cover), then irises open.
3. **Match the cover's colour** so the two page-covers read as one surface. The discovery
   arrival rebuilds the exact warm gradient the Deep Dive page departs under, from
   `sessionStorage 'paz-country-handoff'` (fallback: the place's memory palette).

Consume one-shot flags immediately (remove on read) so they only affect the very next load,
and reset covers on `pageshow` (bfcache) and when leaving a view.

## GSAP conventions

- **Easings:** reveals/settles `power3.out`; irises & morphs `power3.inOut`; soft fades `power2.out`.
- **Durations:** ~0.4–0.7s for element reveals, ~0.85–1.25s for covers/hero.
- **Visibility:** animate `autoAlpha` (opacity + visibility), not bare opacity.
- **Timelines** use absolute position params (`, 0`, `, .55`) to choreograph; give a shared
  `delay` when a group should wait for a cover.
- **ScrollTrigger:** reveals fire at `start: 'top ~70-78%'`; parallax uses `scrub` with
  `start:'top bottom' / end:'bottom top'` and `ease:'none'`.

## Reduced motion — always

Covers are `display:none` under `@media (prefers-reduced-motion: reduce)`; JS paths take an
early branch that `gsap.set(...)`s the final state (or removes the entry element) instead of
animating, and navigations happen immediately. Any new motion needs the same branch.
`?static` on the URL forces this path for testing.

## Verifying motion (important caveat)

A **hidden or fully-backgrounded browser tab pauses `requestAnimationFrame`**, so GSAP's
ticker never advances and animations freeze at their start value — you cannot screenshot
mid-animation there. To verify without a visible tab:

- Confirm the tween exists and its start state applied (e.g. inline `clip-path: circle(150%)`).
- Import the *same* gsap singleton and force finite tweens to their end to inspect the resting
  state: `getTweensOf(el).forEach(t => t.progress(1))` — then read computed styles / screenshot.
- The real animation runs fine in a foreground tab; the freeze is only a verification artifact.
