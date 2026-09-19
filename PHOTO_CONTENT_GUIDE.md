# World and Country photography guide

This guide is the source of truth for preparing photographs for **Explore My
World / Country Discovery** and each **Country Deep Dive**.

## Quick count

| Scope | Explore My World gallery | Country Deep Dive | Files to prepare |
| --- | ---: | ---: | ---: |
| One country | 15+ placements | 6+ placements | 15 minimum; grouped archives can expand freely |
| All 5 countries | 75+ placements | 30+ placements | Curate per country rather than forcing equal counts |

The recommended baseline is **15 strong photographs per country** and reuse
them in the Deep Dive. Countries with a larger body of work can continue into
location-based collection sections. Short films count as placements too, but
keep the opening load restrained and defer the larger collections.

The numeric `photos` value in `src/data/places.js` is display copy (for example,
"48 PHOTOS"); it does not control how many files the page renders.

## Recommended folder structure

Put public image files here:

```text
public/
  images/
    world/
      myanmar/
      thailand/
      singapore/
      vietnam/
      japan/
```

Use lowercase, ASCII, hyphenated filenames. The same order must be used for
every country:

```text
01-arrival.webp
02-field-note.webp
03-after-rain.webp
04-blue-hour.webp
05-morning-light.webp
06-on-the-move.webp
07-quiet-detail.webp
08-the-long-way.webp
09-between-streets.webp
10-late-afternoon.webp
11-weather-study.webp
12-last-light.webp
13-night-walk.webp
14-small-rituals.webp
15-departure.webp
```

## Explore My World gallery: 15+ media placements per country

The gallery is the Country Discovery state inside `world.html`. It uses 15
baseline images in three scenes; a country with `discoveryGroups` can continue
with any number of grouped collection sections.

| # | Scene | Editorial role | Display ratio | Recommended export | Shooting / crop guidance |
| ---: | --- | --- | --- | --- | --- |
| 01 | Opening orbit | Arrival | 4:3 landscape | 2000×1500 | Clear establishing view; leave room for the bottom caption. |
| 02 | Opening orbit | Field note | 4:5 portrait | 1600×2000 | Person, doorway, façade or vertical street rhythm. |
| 03 | Opening orbit | After rain | 4:3 landscape | 2000×1500 | Reflections, weather or street atmosphere. |
| 04 | Opening orbit | Blue hour | 16:9 wide | 2400×1350 | Strong wide city or landscape frame. |
| 05 | Opening orbit | Morning light | 4:5 portrait | 1600×2000 | Vertical subject with breathing room. |
| 06 | Opening orbit | On the move | 1:1 square | 1800×1800 | Motion, transport or a centered graphic moment. |
| 07 | Opening orbit | Quiet detail | 4:3 landscape | 2000×1500 | Texture or detail that still reads at a small size. |
| 08 | Feature scene | The long way | 16:9 wide | 2400×1350 | Main cinematic image; use as the canonical cover. |
| 09 | Feature scene | Between streets | 4:5 portrait | 1600×2000 | Layered vertical street scene. |
| 10 | Feature scene | Late afternoon | 4:3 landscape | 2000×1500 | Warm light and a strong horizon or subject. |
| 11 | Feature scene | Weather study | 1:1 square | 1800×1800 | Minimal weather, shadow or architectural study. |
| 12 | Archive scene | Last light | 16:9 wide | 2400×1350 | Strong closing-light image. |
| 13 | Archive scene | Night walk | 4:5 portrait | 1600×2000 | Vertical night scene with controlled highlights. |
| 14 | Archive scene | Small rituals | 4:3 landscape | 2000×1500 | Human detail, food, craft or everyday gesture. |
| 15 | Archive scene | Departure | 16:9 wide | 2400×1350 | Quiet final frame with a center-safe panoramic crop. |

All cards use `object-fit: cover`. Important subjects should remain inside the
central 70% of the frame so desktop and mobile crops both work. Captions sit
near the bottom edge, so avoid critical details in the lowest 15%.

### Cover photograph

Use **08 — The Long Way** as the canonical cover. It is already the code's
fallback hand-off image when no visible gallery card can be selected.

Today, the transition can instead use whichever gallery image is closest to the
viewport center when the visitor clicks **Deep dive**. That image becomes the
warm transition and incoming hero cover. Therefore every gallery photo should
be strong enough to appear full-screen. If a fixed cover is required every
time, add a dedicated `cover` field and stop selecting the nearest visible card.

## Country Deep Dive: 6 placements per country

| Slot | Role | Display ratio | Recommended export | Recommended reuse from gallery |
| --- | --- | --- | --- | --- |
| Cover | Full-screen hero and page hand-off | Responsive full bleed | 2400×1350 minimum | 08 — The Long Way |
| 01 | Opening wide / blue hour | 16:9 | 2400×1350 | 04 — Blue Hour |
| 02 | Morning portrait | 4:5 | 1600×2000 | 05 — Morning Light |
| 03 | Detail | 1:1 | 1800×1800 | 11 — Weather Study |
| 04 | Street / after rain | 4:3 | 2000×1500 | 03 — After Rain |
| 05 | Departure panorama | 21:9 desktop; 4:3 mobile | 2520×1080 ideal | 15 — Departure |

The cover and panorama receive aggressive responsive crops. Keep the main
subject inside the central 50–60%. The panorama becomes 4:3 on small screens, so
do not place essential content near its far left or right edges.

### Current implementation status

- Gallery entries can be defined as explicit objects in `place.gallery`, with
  their own path, city, moment, alt text, aspect and crop position.
- Deep Dive content can be defined in `place.deepDive`, including a fixed cover,
  five story images and page-specific editorial copy.
- **08 — The Long Way** is used as the fixed cover during the transition and on
  the Deep Dive hero, whether the page is entered from Discovery or opened
  directly.
- Countries without explicit photo data continue to use the existing generated
  placeholders.

## Myanmar: integrated September 2026

Myanmar uses 15 unique photographs from the 16 supplied JPEGs. The exact duplicate
`kalaw_mountain_five.jpeg` is preserved with the masters and is not published.

- Explore My World: 15 real photographs across the existing three scenes.
- Country Deep Dive: six chapters reusing eight gallery photographs, plus the cover.
- Both Bagan photographs appear in Discovery and together in the Deep Dive.
- The main World page has eight floating photographs: both Bagan frames,
  Shwedagon at night, two Thailand frames and three Vietnam frames.
- Cover: `08-shwedagon-night.webp`.
- Locations represented: Yangon, Bagan and Kalaw. The flower detail and evening
  rooftops retain a country-level caption because their city is not supplied.
- Published files: sRGB WebP at quality 82, about 1.8 MB total, with private
  metadata removed. Original dimensions are preserved without upscaling.
- Local untouched masters: `source-images/world/myanmar/` (git-ignored).

## Vietnam: integrated September 2026

Vietnam uses all 21 unique iPhone photographs supplied. The duplicate
`hoi_an_five copy.jpeg` is preserved with the masters but is not published.

- Explore My World: 16 unique images.
- Country Deep Dive: a four-city arc — The Long Way cover plus ten published
  gallery photos reused across eight chapters (no extra files).
- Cover: `08-the-long-way-mui-ne-coast.webp`.
- Locations represented: Ho Chi Minh City, Đà Nẵng, Hội An and Mũi Né.
- Published files: optimized WebP, maximum 2400 px, with GPS/EXIF removed.
- Local full-resolution masters: `source-images/world/vietnam/` (git-ignored).

### Vietnam Explore sequence

| # | File | City | Caption |
| ---: | --- | --- | --- |
| 01 | `01-arrival-saigon-cathedral.webp` | Ho Chi Minh City | Arrival |
| 02 | `02-field-note-saigon-photographer.webp` | Ho Chi Minh City | Field Note |
| 03 | `03-after-rain-saigon-alley.webp` | Ho Chi Minh City | After Rain |
| 04 | `04-blue-hour-da-nang-harbor.webp` | Đà Nẵng | Blue Hour |
| 05 | `05-morning-light-da-nang-lady-buddha.webp` | Đà Nẵng | Morning Light |
| 06 | `06-on-the-move-mui-ne-atv.webp` | Mũi Né | On the Move |
| 07 | `07-quiet-detail-saigon-storefront.webp` | Ho Chi Minh City | Quiet Detail |
| 08 | `08-the-long-way-mui-ne-coast.webp` | Mũi Né | The Long Way / cover |
| 09 | `09-between-streets-mui-ne-road.webp` | Mũi Né | Between Streets |
| 10 | `10-late-afternoon-mui-ne-canyon.webp` | Mũi Né | Late Afternoon |
| 11 | `11-weather-study-da-nang-macaque.webp` | Đà Nẵng | Weather Study |
| 12 | `12-last-light-hoi-an-lanterns.webp` | Hội An | Last Light |
| 13 | `13-night-walk-saigon-lantern-alley.webp` | Ho Chi Minh City | Night Walk |
| 14 | `14-small-rituals-da-nang-beach.webp` | Đà Nẵng | Small Rituals |
| 15 | `15-departure-saigon-night-traffic.webp` | Ho Chi Minh City | Departure |
| 16 | `da_nang_one.jpeg` | Đà Nẵng | Night Harbor |

### Vietnam Deep Dive sequence

The Deep Dive is a four-city arc — Ho Chi Minh City → Đà Nẵng → Hội An → Mũi Né —
authored as `deepDive.chapters` in `src/data/places.js` and rendered by
`src/country.js#storyChapter`. It reuses already-published gallery photos, so it
needs no extra files.

| Chapter | Kind | File(s) | City | Caption |
| --- | --- | --- | --- | --- |
| Cover | hero | `08-the-long-way-mui-ne-coast.webp` | Mũi Né | The Long Way |
| 1 | split | `01-arrival-saigon-cathedral.webp` | Ho Chi Minh City | Arrival · Notre-Dame |
| 2 | wide | `15-departure-saigon-night-traffic.webp` | Ho Chi Minh City | After Dark · Bến Thành |
| 3 | split | `05-morning-light-da-nang-lady-buddha.webp` | Đà Nẵng | Lady Buddha |
| 4 | diptych | `11-weather-study-da-nang-macaque.webp` + `14-small-rituals-da-nang-beach.webp` | Đà Nẵng | Wild Edge · Shoreline |
| 5 | wide | `deep-01-hoi-an-old-town.webp` | Hội An | Old Town |
| 6 | split | `deep-02-hoi-an-flower-vendor.webp` | Hội An | Morning Market |
| 7 | diptych | `deep-03-hoi-an-lantern-detail.webp` + `deep-04-hoi-an-river-market.webp` | Hội An | Lanterns · River Market |
| 8 | closing | `deep-05-mui-ne-dunes.webp` | Mũi Né | Departure |

## Thailand: integrated September 2026

Thailand is a places-first archive: the friend and girlfriend portraits are
intentionally unpublished, leaving 21 published photographs and all seven films.
Discovery presents 28 memories; the Deep Dive presents 27 media in six
location-based chapters. The single Bangkok night-market still is relocated into
Discovery's "fragments" scene and sits outside the Deep Dive arc.

- Cover: `sathorn-01-first-view.webp`.
- Locations represented: Bangkok, Ayutthaya, Nakhon Pathom, Ko Lan and Hua Hin.
- Published stills and poster frames: optimized WebP with private metadata
  removed.
- Published films: silent-by-default, eight-second `.m4v` loops at 960×540.
- Films only load and play near the viewport. Reduced-motion visitors see the
  poster frame instead.

### Thailand story groups

| Group | Photographs | Films | Discovery | Deep Dive |
| --- | ---: | ---: | ---: | ---: |
| Sathorn — where it started | 5 | 4 | 9 | 9 |
| Ayutthaya — old stone | 2 | 0 | 2 | 2 |
| Bangkok — night market | 1 | 0 | 1 | 0 |
| Ko Lan — the island shore | 6 | 0 | 6 | 6 |
| Hua Hin | 1 | 0 | 1 | 1 |
| Nakhon Pathom — home days | 4 | 3 | 7 | 7 |
| Small companions | 2 | 0 | 2 | 2 |

The friend, girlfriend and self-portrait photographs — `ayutthaya-01-friends`,
`bangkok-02-night-market`, `bangkok-03-cat-terrace`,
`ko-lan-01/02/03/06/10/11/13`, `nakhon-pathom-01-garden-portrait` and
`companions-01-dog-walk` — are no longer published. Their source files still
sit in the folder, unreferenced.

Every published film has a matching `-poster.webp` file in the same folder.
When replacing a film, update both files while keeping their public filenames.

## Adding gallery paths

Edit the matching country in `src/data/places.js`:

```js
images: [
  '/images/world/myanmar/01-arrival.webp',
  '/images/world/myanmar/02-field-note.webp',
  '/images/world/myanmar/03-after-rain.webp',
  '/images/world/myanmar/04-blue-hour.webp',
  '/images/world/myanmar/05-morning-light.webp',
  '/images/world/myanmar/06-on-the-move.webp',
  '/images/world/myanmar/07-quiet-detail.webp',
  '/images/world/myanmar/08-the-long-way.webp',
  '/images/world/myanmar/09-between-streets.webp',
  '/images/world/myanmar/10-late-afternoon.webp',
  '/images/world/myanmar/11-weather-study.webp',
  '/images/world/myanmar/12-last-light.webp',
  '/images/world/myanmar/13-night-walk.webp',
  '/images/world/myanmar/14-small-rituals.webp',
  '/images/world/myanmar/15-departure.webp',
],
```

Repeat with the correct country folder for Thailand, Singapore, Vietnam and
Japan. Paths start with `/images/` because everything inside `public/` is served
from the site root.

## Image preparation checklist

- Export in **sRGB**.
- Prefer **WebP** for the current simple one-file setup. AVIF is smaller but
  should ideally be supplied through `<picture>` with a fallback, which the
  current renderer does not generate.
- Use quality 75–82 for WebP and inspect faces, skies, gradients and dark areas.
- Aim for 120–250 KB per gallery image and no more than about 350 KB for a cover.
- Keep one country's 15-image payload near or below 3 MB.
- Remove GPS and unnecessary EXIF metadata before publishing.
- Do not bake captions, borders or colour filters into the photograph; the site
  adds those treatments.
- Avoid transparent images.
- Never upscale a small original merely to reach the suggested dimensions.
- Check both desktop and mobile crops before considering a country complete.

## Replacing an existing photograph yourself

There are two copies of a photograph for different purposes:

| Copy | Location | Purpose |
| --- | --- | --- |
| Full-resolution master | `source-images/world/<country>/` | Your untouched local source; this folder is git-ignored. |
| Optimized website image | `public/images/world/<country>/` | The WebP file the browser actually downloads. |

For a higher-resolution version of the **same photograph**, keep both existing
filenames:

1. Replace its JPEG master in `source-images/world/<country>/`.
2. Export an optimized WebP over the matching file in
   `public/images/world/<country>/`.
3. Keep the WebP path and filename unchanged. No JavaScript edit is needed.
4. Run `npm run build`, then check the image at desktop and mobile widths.

Recommended website export: sRGB WebP, quality 75–82, 1500–2000 px on the long
edge for gallery images, and up to 2400 px for a cover. Strip GPS/EXIF data from
the public WebP, but the private master may retain it.

If you rename the public file, change its caption, change its crop, or place a
different photograph in the slot, update `src/data/places.js` as well:

- Explore images are in the country's `gallery` array.
- Deep Dive cover is in `deepDive.cover`.
- Authored Deep Dive media are in `deepDive.chapters`.
- `position` controls the responsive crop, such as `center 45%`.
- `alt` describes the visible photograph for screen-reader users.

For a video entry, keep a separate still poster and add `type: 'video'`:

```js
{
  type: 'video',
  src: '/images/world/thailand/sathorn-09-monsoon.m4v',
  poster: '/images/world/thailand/sathorn-09-monsoon-poster.webp',
  city: 'SATHORN',
  moment: 'MONSOON',
  aspect: 'landscape',
  alt: 'Storm clouds moving over the Bangkok riverfront',
}
```

Vietnam's cover path appears in both gallery slot 08 and `deepDive.cover`. If
you keep the existing filename, replacing the one public WebP updates both
places automatically.

## Content information needed with each country

Before integration, provide:

1. The 15 files in the exact numbered order above.
2. The intended country, city and short moment/caption for every image.
3. Useful alt text describing what is visibly present, not a repeated filename.
4. The preferred cover, if it should not be image 08.
5. Confirmation whether Deep Dive should reuse gallery images or use six unique
   files.
6. The correct year, city list, coordinates, total-photo count, story count and
   short country note shown in `src/data/places.js`.

The current code generates city, moment and alt text from a shared blueprint.
If the real photographs need individual captions and alt text—and they usually
will—the data model should be changed from a plain `images` array to explicit
per-memory objects before final publishing.

## Final verification

After adding a country:

1. Run `npm run build`.
2. Check the opening orbit, feature scene, archive scene and image viewer.
3. Trigger Deep Dive from both the header and the final call-to-action.
4. Verify the transition image and hero cover do not flash or change crop at the
   page boundary.
5. Check the five Deep Dive story placements on desktop and mobile.
6. Confirm there are no broken-image icons or console errors.
