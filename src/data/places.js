const memoryBlueprints = [
  ['ARRIVAL', 0, 'landscape'],
  ['FIELD NOTE', 0, 'portrait'],
  ['AFTER RAIN', 1, 'landscape'],
  ['BLUE HOUR', 0, 'wide'],
  ['MORNING LIGHT', 1, 'portrait'],
  ['ON THE MOVE', 0, 'square'],
  ['QUIET DETAIL', 1, 'landscape'],
  ['THE LONG WAY', 0, 'wide'],
  ['BETWEEN STREETS', 1, 'portrait'],
  ['LATE AFTERNOON', 0, 'landscape'],
  ['WEATHER STUDY', 1, 'square'],
  ['LAST LIGHT', 0, 'wide'],
  ['NIGHT WALK', 1, 'portrait'],
  ['SMALL RITUALS', 0, 'landscape'],
  ['DEPARTURE', 1, 'wide'],
];

const memoryPalettes = [
  ['#344b48', '#d0a66d', '#9f4935'],
  ['#5d6355', '#e2c394', '#b35c3c'],
  ['#263d3c', '#bd714e', '#d8a668'],
  ['#6d4538', '#d98d55', '#3f5957'],
  ['#293833', '#c9b88f', '#a84732'],
  ['#425b57', '#e1b574', '#7f4035'],
];

function createMemories(place, placeIndex) {
  const cities = place.cities.split(' / ').map((city) => city.trim());
  const imageCount = Math.max(memoryBlueprints.length, place.gallery?.length || place.images?.length || 0);

  return Array.from({ length: imageCount }, (_, index) => {
    const [moment, cityIndex, aspect] = memoryBlueprints[index % memoryBlueprints.length];
    const palette = memoryPalettes[(index + placeIndex) % memoryPalettes.length];
    const city = cities[cityIndex % cities.length];
    const galleryItem = place.gallery?.[index];
    return {
      id: `${place.id}-memory-${String(index + 1).padStart(2, '0')}`,
      index: index + 1,
      city: galleryItem?.city || city,
      moment: galleryItem?.moment || moment,
      aspect: galleryItem?.aspect || aspect,
      position: galleryItem?.position || 'center',
      src: galleryItem?.src || place.images?.[index] || '',
      type: galleryItem?.type || 'image',
      poster: galleryItem?.poster || '',
      group: galleryItem?.group || '',
      discovery: galleryItem?.discovery !== false,
      alt: galleryItem?.alt || `${moment.toLowerCase()} in ${city}, ${place.country}`,
      palette: galleryItem?.palette || palette,
    };
  });
}

// Thailand is a places-first archive: the friend and girlfriend portraits are
// intentionally unpublished, so this gallery holds only Sathorn's river weather,
// old brick, the Ko Lan shore, Hua Hin, the Nakhon Pathom home days and the two
// dogs. `bangkok-01` is the lone Bangkok night-market still — it has no group of
// its own, so it surfaces in Discovery's "fragments" scene and skips the Deep Dive.
const thailandGallery = [
  { src: '/images/world/thailand/sathorn-01-first-view.webp', group: 'sathorn', city: 'SATHORN', moment: 'FIRST VIEW', aspect: 'landscape', position: 'center 55%', alt: 'Bangkok and the Chao Phraya River beneath a blue evening sky' },
  { src: '/images/world/thailand/sathorn-02-river-blue-hour.webp', group: 'sathorn', city: 'SATHORN', moment: 'RIVER LIGHT', aspect: 'portrait', position: 'center 58%', alt: 'Ferries and city lights gathering along the Chao Phraya River at blue hour' },
  { src: '/images/world/thailand/sathorn-03-sunrise-room.webp', group: 'sathorn', city: 'SATHORN', moment: 'FIRST MORNING', aspect: 'landscape', position: 'center', alt: 'Sunrise over Bangkok seen through an apartment window beside a toy giraffe' },
  { src: '/images/world/thailand/sathorn-04-sunrise-window.webp', group: 'sathorn', city: 'SATHORN', moment: 'WINDOW LIGHT', aspect: 'wide', position: 'center', alt: 'A warm Bangkok sunrise framed by an apartment window' },
  { src: '/images/world/thailand/sathorn-05-night-skyline.webp', group: 'sathorn', city: 'SATHORN', moment: 'NIGHT SKYLINE', aspect: 'portrait', position: 'center', alt: 'Bangkok towers and street lights glowing through the night haze' },
  { type: 'video', src: '/images/world/thailand/sathorn-06-river-boats.m4v', poster: '/images/world/thailand/sathorn-06-river-boats-poster.webp', group: 'sathorn', city: 'SATHORN', moment: 'RIVER TRAFFIC', aspect: 'portrait', position: 'center', alt: 'Boats crossing the Chao Phraya River beneath a cloudy Bangkok sky' },
  { type: 'video', src: '/images/world/thailand/sathorn-07-blue-hour.m4v', poster: '/images/world/thailand/sathorn-07-blue-hour-poster.webp', group: 'sathorn', city: 'SATHORN', moment: 'BLUE HOUR', aspect: 'wide', position: 'center', alt: 'Bangkok settling into blue hour beside the Chao Phraya River' },
  { type: 'video', src: '/images/world/thailand/sathorn-08-storm-front.m4v', poster: '/images/world/thailand/sathorn-08-storm-front-poster.webp', group: 'sathorn', city: 'SATHORN', moment: 'STORM FRONT', aspect: 'wide', position: 'center', alt: 'A dark storm front moving over the Bangkok riverfront' },
  { type: 'video', src: '/images/world/thailand/sathorn-09-monsoon.m4v', poster: '/images/world/thailand/sathorn-09-monsoon-poster.webp', group: 'sathorn', city: 'SATHORN', moment: 'MONSOON', aspect: 'wide', position: 'center', alt: 'Heavy monsoon clouds obscuring towers along the Chao Phraya River' },
  { src: '/images/world/thailand/ayutthaya-02-temple-tower.webp', group: 'ayutthaya', city: 'AYUTTHAYA', moment: 'OLD STONE', aspect: 'portrait', position: 'center 44%', alt: 'A weathered brick prang rising from the ruins of Ayutthaya' },
  { src: '/images/world/thailand/ayutthaya-03-ruins.webp', group: 'ayutthaya', city: 'AYUTTHAYA', moment: 'FOUNDATIONS', aspect: 'landscape', position: 'center 54%', alt: 'Brick foundations and ruined walls beneath a bright sky in Ayutthaya' },
  { src: '/images/world/thailand/bangkok-01-crocodile-grill.webp', group: 'bangkok', city: 'BANGKOK', moment: 'NIGHT MARKET', aspect: 'portrait', position: 'center', alt: 'A crocodile grill stall at a Bangkok night market' },
  { src: '/images/world/thailand/ko-lan-04-beach-panorama.webp', group: 'ko-lan', city: 'KO LAN', moment: 'THE SHORE', aspect: 'wide', position: 'center', alt: 'A panoramic view of the beach and colourful boats at Ko Lan' },
  { src: '/images/world/thailand/ko-lan-05-speedboat.webp', group: 'ko-lan', city: 'KO LAN', moment: 'ON THE MOVE', aspect: 'landscape', position: 'center', alt: 'A speedboat crossing clear blue water near Ko Lan' },
  { src: '/images/world/thailand/ko-lan-07-storm-beach.webp', group: 'ko-lan', city: 'KO LAN', moment: 'WEATHER STUDY', aspect: 'landscape', position: 'center 62%', alt: 'Beach chairs facing dark rain clouds over Ko Lan' },
  { src: '/images/world/thailand/ko-lan-08-empty-chairs.webp', group: 'ko-lan', city: 'KO LAN', moment: 'BEFORE RAIN', aspect: 'portrait', position: 'center 62%', alt: 'A line of empty beach chairs beneath a stormy Ko Lan sky' },
  { src: '/images/world/thailand/ko-lan-09-yellow-boat.webp', group: 'ko-lan', city: 'KO LAN', moment: 'THE LONG WAY', aspect: 'landscape', position: 'center 56%', alt: 'A yellow speedboat crossing blue water toward Ko Lan' },
  { src: '/images/world/thailand/ko-lan-12-palm-beach.webp', group: 'ko-lan', city: 'KO LAN', moment: 'PALM SHADOW', aspect: 'portrait', position: 'center', alt: 'Palm trees casting narrow shadows across a bright island beach' },
  { src: '/images/world/thailand/hua-hin-01-shoreline.webp', group: 'hua-hin', city: 'HUA HIN', moment: 'SHORELINE', aspect: 'portrait', position: 'center 60%', alt: 'A long Hua Hin shoreline with low waves, horses and distant beachgoers' },
  { src: '/images/world/thailand/nakhon-pathom-02-canal-path.webp', group: 'nakhon-pathom', city: 'NAKHON PATHOM', moment: 'CANAL PATH', aspect: 'landscape', position: 'center 52%', alt: 'A narrow path beneath palms and fruit trees beside a canal in Nakhon Pathom' },
  { src: '/images/world/thailand/nakhon-pathom-03-watering.webp', group: 'nakhon-pathom', city: 'NAKHON PATHOM', moment: 'WATERING', aspect: 'portrait', position: 'center', alt: 'Water spraying across rows of plants in a Nakhon Pathom garden' },
  { src: '/images/world/thailand/nakhon-pathom-04-chillies.webp', group: 'nakhon-pathom', city: 'NAKHON PATHOM', moment: 'HOME GARDEN', aspect: 'portrait', position: 'center', alt: 'Red chillies growing among green leaves in a home garden in Nakhon Pathom' },
  { src: '/images/world/thailand/nakhon-pathom-05-night-fire.webp', group: 'nakhon-pathom', city: 'NAKHON PATHOM', moment: 'NIGHT GATHERING', aspect: 'landscape', position: 'center', alt: 'A small outdoor fire during a night gathering in Nakhon Pathom' },
  { type: 'video', src: '/images/world/thailand/nakhon-pathom-06-cycling.m4v', poster: '/images/world/thailand/nakhon-pathom-06-cycling-poster.webp', group: 'nakhon-pathom', city: 'NAKHON PATHOM', moment: 'EVENING RIDE', aspect: 'portrait', position: 'center', alt: 'An evening bicycle ride along a tree-lined path in Nakhon Pathom' },
  { type: 'video', src: '/images/world/thailand/nakhon-pathom-07-fireplace.m4v', poster: '/images/world/thailand/nakhon-pathom-07-fireplace-poster.webp', group: 'nakhon-pathom', city: 'NAKHON PATHOM', moment: 'FIRELIGHT', aspect: 'wide', position: 'center', alt: 'A small outdoor fire glowing during a night gathering in Nakhon Pathom' },
  { type: 'video', src: '/images/world/thailand/nakhon-pathom-08-kitchen.m4v', poster: '/images/world/thailand/nakhon-pathom-08-kitchen-poster.webp', group: 'nakhon-pathom', city: 'NAKHON PATHOM', moment: 'HOME KITCHEN', aspect: 'portrait', position: 'center', alt: 'A quiet moment in a home kitchen in Nakhon Pathom' },
  { src: '/images/world/thailand/companions-02-mico.webp', group: 'companions', city: 'THAILAND', moment: 'MICO', aspect: 'landscape', position: 'center', alt: 'A small black-and-white dog resting beside a yellow toy' },
  { src: '/images/world/thailand/companions-03-milo.webp', group: 'companions', city: 'THAILAND', moment: 'MILO', aspect: 'portrait', position: 'center', alt: 'A small brown dog looking toward the camera from a bed' },
];

const placeData = [
  {
    // Home. No gallery yet, on purpose: these are the frames I never thought to
    // fill. The copy leans into that, and the placeholders wait for the photos I
    // will bring back. `photos: 0` keeps the counts honest until then.
    id: 'myanmar', iso: 'MMR', country: 'Myanmar', year: '2016', cities: 'YANGON / MANDALAY',
    coordinates: '16.8409° N / 96.1735° E', lat: 16.84, lng: 96.17, photos: 0, stories: 6,
    note: 'It felt like home, so I never thought to photograph it. Myanmar is where everything began: my family, my street, the small world that made me. I was too busy living inside those days to hold up a camera, and the ordinary moments I never kept are the ones I miss most. These frames are still empty. Someday soon I will go home and fill them.',
    images: [],
    deepDive: {
      cover: { city: 'YANGON', moment: 'HOME', palette: ['#7a3b2e', '#d8a866', '#3f5148'] },
      intro: 'Some places you visit. One place makes you. Myanmar is where my footprints first meant something, and where my family, my whole world, still is. I never imagined I could miss a place this much. I have almost no pictures of it, because when you are home you never believe the ordinary will one day be the thing you ache for.',
      chapters: [
        {
          kind: 'wide', role: 'WHERE IT BEGAN', eyebrow: 'YANGON', time: '2016',
          photo: { city: 'YANGON', moment: 'HOME STREETS' },
          copy: 'This is where it all began. Monsoon air on warm pavement, the smell of the first rain, familiar streets that knew my name before I did. It is the first place my footprints ever left a mark, and everything I have made since still starts from here. I thought it would always be there, exactly the way I left it, waiting for whenever I chose to come back.',
        },
        {
          kind: 'split', role: 'MY WHOLE WORLD', eyebrow: 'FAMILY',
          title: 'My family,<br /><em>my whole world.</em>',
          photo: { city: 'YANGON', moment: 'THE TABLE' },
          copy: 'Home was never the skyline or the landmarks. It was the people around the table, the tea going cold while we talked, the small rituals of an ordinary evening. It was my family, who are, and always will be, my whole world. I did not know then that I was already living inside the memory I would one day miss the most.',
        },
        {
          kind: 'diptych', detailRole: 'THE EVERYDAY', streetRole: 'THE ORDINARY',
          detail: { city: 'YANGON', moment: 'SMALL THINGS' },
          street: { city: 'MANDALAY', moment: 'A PASSING DAY' },
          copy: 'The ordinary days I never thought to photograph: a corner, a light, a face I passed every morning, the particular way the afternoon fell across the floor. I did not value them enough to keep them. Now I would give almost anything for one honest frame of a day I was so sure would repeat forever.',
        },
        {
          kind: 'wide', role: 'FROM FAR AWAY', eyebrow: 'HOMESICK',
          photo: { city: 'YANGON', moment: 'LONGING' },
          copy: 'I never imagined I would have to miss my hometown this much. From far away the smallest things turn into poetry: a song, a smell, a word in my own language, the sound of home in someone else&rsquo;s voice. The longing does not shout. It just lingers, quiet and constant, underneath everything. You do not understand how much a place is a part of you until you are standing somewhere it is not.',
        },
        {
          kind: 'split', role: 'ONE PHOTOGRAPH', eyebrow: 'WHAT I LEARNED',
          title: 'One photograph,<br /><em>a whole world back.</em>',
          photo: { city: 'HOME', moment: 'IF ONLY' },
          copy: 'I never understood how a single photograph could become the most valuable thing you own. Now I do. One ordinary frame can hand you back a whole afternoon: a voice, a laugh, a version of the people you love that will never come again. I learned it a little too late for some of them. I am trying to learn it in time for the rest.',
        },
        {
          kind: 'closing', role: 'PHOTOS TO COME',
          photo: { city: 'YANGON', moment: 'SOMEDAY' },
          copy: 'So this chapter waits, honestly, with more blank space than pictures. I did not capture enough of home the first time around, and I have made my peace with letting that ache show here. But I am going back, and this time I will hold up the camera. Someday soon these frames will hold my family, my streets and my whole world: the photographs they have always deserved.',
        },
      ],
    },
  },
  {
    id: 'thailand', iso: 'THA', country: 'Thailand', year: '2019', cities: 'BANGKOK / AYUTTHAYA / NAKHON PATHOM / KO LAN / HUA HIN',
    coordinates: '13.7563° N / 100.5018° E', lat: 13.75, lng: 100.5, photos: 21, videos: 7, stories: 6,
    note: 'Sathorn was the beginning: river weather outside the window, then old brick, island shores and the home days that followed.',
    gallery: thailandGallery,
    discoveryGroups: [
      { id: 'ko-lan', eyebrow: 'KO LAN / THE ISLAND SHORE', title: 'Across the water,<br /><em>to the shore.</em>', copy: 'The island stayed with me as weather and water: empty loungers waiting out the heat, a bright boat crossing the bay, and palm shadows falling long across the sand.' },
      { id: 'hua-hin', eyebrow: 'HUA HIN / SHORELINE', title: 'A quieter<br /><em>edge.</em>', copy: 'One long beach, low waves and the slow traffic of people and horses along the water.' },
      { id: 'nakhon-pathom', eyebrow: 'NAKHON PATHOM / HOME DAYS', title: 'The days became<br /><em>familiar.</em>', copy: 'Garden paths, evening rides, cooking and firelight: the ordinary pieces that made a place feel lived in.' },
      { id: 'companions', eyebrow: 'SMALL COMPANIONS', title: 'The softest<br /><em>footnotes.</em>', copy: 'Mico and Milo, two small dogs who quietly ran the household and kept turning up in the camera roll.' },
    ],
    deepDive: {
      cover: { ...thailandGallery[0], moment: 'FIRST ADDRESS', palette: ['#2f4245', '#c9a779', '#a64d39'] },
      intro: 'Thailand began for me in Sathorn: river weather outside the window, ferries below and a skyline changing by the hour. The map widened from there, but that first address still holds the beginning.',
      chapters: [
        { kind: 'collection', role: 'FIRST ADDRESS', eyebrow: 'SATHORN · WHERE IT STARTED', title: 'The first view<br /><em>became a beginning.</em>', copy: 'Sathorn was my first place in Thailand. Morning entered through the window; boats and storms crossed the river; the skyline taught me the changing pace of Bangkok.', media: thailandGallery.filter((item) => item.group === 'sathorn') },
        { kind: 'collection', role: 'OLD CAPITAL', eyebrow: 'AYUTTHAYA · OLD STONE', title: 'Time held<br /><em>in warm brick.</em>', copy: 'Ayutthaya slowed the journey down: weathered prangs holding the afternoon heat, and brick foundations that have outlasted everything once built on them.', media: thailandGallery.filter((item) => item.group === 'ayutthaya') },
        { kind: 'collection', role: 'ISLAND DAYS', eyebrow: 'KO LAN · THE ISLAND SHORE', title: 'Across the water,<br /><em>to the shore.</em>', copy: 'Ko Lan is mostly weather and water: a speedboat cutting the bay, storm light gathering over the loungers, empty chairs on the sand and palm shadows in the afternoon.', media: thailandGallery.filter((item) => item.group === 'ko-lan') },
        { kind: 'collection', role: 'SHORELINE', eyebrow: 'HUA HIN · A QUIETER EDGE', title: 'One long beach,<br /><em>one slower afternoon.</em>', copy: 'Hua Hin appears as a single long shoreline: people, horses and low waves passing through the same pale frame.', media: thailandGallery.filter((item) => item.group === 'hua-hin') },
        { kind: 'collection', role: 'HOME DAYS', eyebrow: 'NAKHON PATHOM · LIVED IN', title: 'The ordinary days<br /><em>held the longest.</em>', copy: 'All the Nakhon Pathom memories belong together: garden paths, watering plants, evening rides, cooking and firelight. Not landmarks, just the details that made Thailand feel lived in.', media: thailandGallery.filter((item) => item.group === 'nakhon-pathom') },
        { kind: 'collection', role: 'FOOTNOTES', eyebrow: 'SMALL COMPANIONS', title: 'The softest<br /><em>part of the archive.</em>', copy: 'Mico and Milo: the two small dogs who quietly ran the household and stayed in the camera roll long after.', media: thailandGallery.filter((item) => item.group === 'companions') },
      ],
    },
  },
  {
    id: 'vietnam', iso: 'VNM', country: 'Vietnam', year: 'NOW', cities: 'HO CHI MINH CITY / ĐÀ NẴNG / HỘI AN / MŨI NÉ',
    coordinates: '10.8231° N / 106.6297° E', lat: 10.82, lng: 106.63, photos: 21, stories: 8,
    note: 'Home now: early coffee, late rides and the long road between city light, old-town colour and open sand.',
    gallery: [
      {
        src: '/images/world/vietnam/01-arrival-saigon-cathedral.webp',
        city: 'HO CHI MINH CITY', moment: 'ARRIVAL', aspect: 'landscape', position: 'center 58%',
        alt: 'Notre-Dame Cathedral of Saigon under restoration scaffolding above passing city traffic',
      },
      {
        src: '/images/world/vietnam/02-field-note-saigon-photographer.webp',
        city: 'HO CHI MINH CITY', moment: 'FIELD NOTE', aspect: 'portrait', position: 'center',
        alt: 'A woman raises her phone to photograph the Ho Chi Minh City skyline',
      },
      {
        src: '/images/world/vietnam/03-after-rain-saigon-alley.webp',
        city: 'HO CHI MINH CITY', moment: 'AFTER RAIN', aspect: 'landscape', position: 'center',
        alt: 'A narrow wet alley lined with scooters and leafy plants after rain in Ho Chi Minh City',
      },
      {
        src: '/images/world/vietnam/04-blue-hour-da-nang-harbor.webp',
        city: 'ĐÀ NẴNG', moment: 'BLUE HOUR', aspect: 'wide', position: 'center 55%',
        alt: 'Bougainvillea, glowing lamps and fishing boats along Đà Nẵng waterfront at blue hour',
      },
      {
        src: '/images/world/vietnam/05-morning-light-da-nang-lady-buddha.webp',
        city: 'ĐÀ NẴNG', moment: 'MORNING LIGHT', aspect: 'portrait', position: 'center 45%',
        alt: 'The Lady Buddha statue rising against layered clouds in Đà Nẵng',
      },
      {
        src: '/images/world/vietnam/06-on-the-move-mui-ne-atv.webp',
        city: 'MŨI NÉ', moment: 'ON THE MOVE', aspect: 'square', position: 'center',
        alt: 'A line of ATV riders crossing the pale sand dunes of Mũi Né',
      },
      {
        src: '/images/world/vietnam/07-quiet-detail-saigon-storefront.webp',
        city: 'HO CHI MINH CITY', moment: 'QUIET DETAIL', aspect: 'landscape', position: 'center 50%',
        alt: 'A playful banana neon sign glowing inside a Ho Chi Minh City storefront',
      },
      {
        src: '/images/world/vietnam/08-the-long-way-mui-ne-coast.webp',
        city: 'MŨI NÉ', moment: 'THE LONG WAY', aspect: 'wide', position: 'center',
        alt: 'Travellers waving beside two colourful open-top jeeps on the coast at Mũi Né',
      },
      {
        src: '/images/world/vietnam/09-between-streets-mui-ne-road.webp',
        city: 'MŨI NÉ', moment: 'BETWEEN STREETS', aspect: 'portrait', position: 'center 45%',
        alt: 'A woman seated by the open side of a travel bus on the road through Mũi Né',
      },
      {
        src: '/images/world/vietnam/10-late-afternoon-mui-ne-canyon.webp',
        city: 'MŨI NÉ', moment: 'LATE AFTERNOON', aspect: 'landscape', position: 'center',
        alt: 'Eroded red and white sandstone walls winding through the Fairy Stream near Mũi Né',
      },
      {
        src: '/images/world/vietnam/11-weather-study-da-nang-macaque.webp',
        city: 'ĐÀ NẴNG', moment: 'WEATHER STUDY', aspect: 'square', position: 'center 47%',
        alt: 'A macaque sitting beneath a tree and a stormy sky on Sơn Trà Peninsula',
      },
      {
        src: '/images/world/vietnam/12-last-light-hoi-an-lanterns.webp',
        city: 'HỘI AN', moment: 'LAST LIGHT', aspect: 'wide', position: 'center 60%',
        alt: 'Two hands meeting beneath the warm glow of lanterns in Hội An at night',
      },
      {
        src: '/images/world/vietnam/13-night-walk-saigon-lantern-alley.webp',
        city: 'HO CHI MINH CITY', moment: 'NIGHT WALK', aspect: 'portrait', position: 'center',
        alt: 'A narrow city passage glowing beneath lanterns and an orange awning at night',
      },
      {
        src: '/images/world/vietnam/14-small-rituals-da-nang-beach.webp',
        city: 'ĐÀ NẴNG', moment: 'SMALL RITUALS', aspect: 'landscape', position: 'center 58%',
        alt: 'Shoes, clothes and a football resting on the sand beside the sea in Đà Nẵng',
      },
      {
        src: '/images/world/vietnam/15-departure-saigon-night-traffic.webp',
        city: 'HO CHI MINH CITY', moment: 'DEPARTURE', aspect: 'wide', position: 'center 58%',
        alt: 'Motorbikes and market lights filling a Ho Chi Minh City street at night',
      },
      {
        src: '/images/world/vietnam/16-night-study-hoi-an-photographer.webp',
        city: 'HỘI AN', moment: 'NIGHT STUDY', aspect: 'landscape', position: 'center 48%',
        alt: 'A photographer checking his camera beside colourful reflections on the Hội An river at night',
      },
    ],
    deepDive: {
      cover: {
        src: '/images/world/vietnam/08-the-long-way-mui-ne-coast.webp',
        city: 'MŨI NÉ', moment: 'THE LONG WAY', position: 'center',
        alt: 'Travellers waving beside two colourful open-top jeeps on the coast at Mũi Né',
        palette: ['#293833', '#c9b88f', '#a84732'],
      },
      intro: 'Home is not one fixed point. It is cathedral bells and midnight traffic, a white statue over the sea, lanterns above an old street, and the long road out to the open sand.',
      // A four-city arc: Ho Chi Minh City → Đà Nẵng → Hội An → Mũi Né. Each city
      // is its own chapter set, rendered by src/country.js#storyChapter.
      chapters: [
        {
          kind: 'split', role: 'ARRIVAL', eyebrow: 'HO CHI MINH CITY · ARRIVAL',
          title: 'Not where I&rsquo;m from &mdash;<br /><em>where I live now.</em>',
          copy: 'The basilica has worn its scaffolding for years now. Saigon isn&rsquo;t where I grew up, but it&rsquo;s the city I keep coming back to &mdash; learning its streets again after every trip, one closed lane and one new coffee window at a time.',
          photo: {
            src: '/images/world/vietnam/01-arrival-saigon-cathedral.webp',
            city: 'HO CHI MINH CITY', moment: 'NOTRE-DAME', position: 'center 42%',
            alt: 'Notre-Dame Cathedral of Saigon wrapped in restoration scaffolding above passing traffic',
          },
        },
        {
          kind: 'wide', role: 'AFTER DARK', eyebrow: 'HO CHI MINH CITY',
          copy: 'By night the city stops pretending to rest. Bến Thành throws its light across the roundabout, the traffic knots and loosens, and the whole junction moves like one patient animal.',
          photo: {
            src: '/images/world/vietnam/15-departure-saigon-night-traffic.webp',
            city: 'HO CHI MINH CITY', moment: 'BẾN THÀNH', position: 'center 72%',
            alt: 'Motorbikes and cars crossing the roundabout in front of the illuminated Bến Thành Market at night',
          },
        },
        {
          kind: 'split', role: 'MORNING LIGHT', eyebrow: 'ĐÀ NẴNG · SƠN TRÀ',
          title: 'The coast keeps<br /><em>a calmer watch.</em>',
          copy: 'Six hours north the noise thins to surf. The Lady Buddha stands over Sơn Trà with the mountains at her back and the sea in front of her, the first real quiet of the whole road.',
          photo: {
            src: '/images/world/vietnam/05-morning-light-da-nang-lady-buddha.webp',
            city: 'ĐÀ NẴNG', moment: 'LADY BUDDHA', position: 'center 32%',
            alt: 'The white Lady Buddha statue of Đà Nẵng rising over a laughing Buddha against heavy clouds',
          },
        },
        {
          kind: 'diptych', detailRole: 'WILD EDGE', streetRole: 'SHORELINE',
          copy: 'The peninsula still belongs to the monkeys; the beach belongs to whoever left their shoes in the sand.',
          detail: {
            src: '/images/world/vietnam/11-weather-study-da-nang-macaque.webp',
            city: 'ĐÀ NẴNG', moment: 'SƠN TRÀ', position: 'center 45%',
            alt: 'A macaque sitting beneath a tree and a stormy sky on the Sơn Trà Peninsula',
          },
          street: {
            src: '/images/world/vietnam/14-small-rituals-da-nang-beach.webp',
            city: 'ĐÀ NẴNG', moment: 'MỸ KHÊ', position: 'center 58%',
            alt: 'Shoes, clothes and a football left on the sand beside the sea in Đà Nẵng',
          },
        },
        {
          kind: 'wide', role: 'AFTERNOON', eyebrow: 'HỘI AN',
          copy: 'Then the map softens into old town: mustard walls, tiled awnings, bougainvillea over every second doorway. Nothing here is in a hurry, and it asks you not to be either.',
          photo: {
            src: '/images/world/vietnam/deep-01-hoi-an-old-town.webp',
            city: 'HỘI AN', moment: 'OLD TOWN', position: 'center 45%',
            alt: 'A Hội An old-town shopfront framed by mustard-yellow walls and flowering bougainvillea',
          },
        },
        {
          kind: 'split', role: 'MORNING MARKET', eyebrow: 'HỘI AN · MORNING',
          title: 'The market opens<br /><em>one flower at a time.</em>',
          copy: 'On the stone steps, yellow chrysanthemums and pink blossoms turn an ordinary morning into a small ceremony of colour.',
          photo: {
            src: '/images/world/vietnam/deep-02-hoi-an-flower-vendor.webp',
            city: 'HỘI AN', moment: 'FLOWER MARKET', position: 'center 52%',
            alt: 'A flower vendor in a conical hat seated among yellow and pink blossoms on the steps of the Hội An market',
          },
        },
        {
          kind: 'diptych', detailRole: 'HANDMADE', streetRole: 'RIVER',
          copy: 'Colour made by hand, one lantern at a time, then the river gathers all of it into a single warm crowd.',
          detail: {
            src: '/images/world/vietnam/deep-03-hoi-an-lantern-detail.webp',
            city: 'HỘI AN', moment: 'LANTERNS', position: 'center',
            alt: 'Rows of colourful silk lanterns hanging closely together in Hội An',
          },
          street: {
            src: '/images/world/vietnam/deep-04-hoi-an-river-market.webp',
            city: 'HỘI AN', moment: 'RIVER MARKET', position: 'center 52%',
            alt: 'Vendors and visitors gathered beneath hanging lanterns at the Hội An river market',
          },
        },
        {
          kind: 'closing', role: 'DEPARTURE',
          copy: 'And then the road gives way to sand. At Mũi Né people become small marks on the ridge, the jeeps shrink to bright dots, and the horizon does the rest of the remembering.',
          photo: {
            src: '/images/world/vietnam/deep-05-mui-ne-dunes.webp',
            city: 'MŨI NÉ', moment: 'DEPARTURE', position: 'center',
            alt: 'Tiny travellers and an orange jeep crossing a broad sand dune at Mũi Né',
          },
        },
      ],
    },
  },
];

export const places = placeData.map((place, index) => ({
  ...place,
  memories: createMemories(place, index),
}));

// Not visited yet: the bucket list. These are aspirations, not archives, so they
// live outside `places` (no globe pin, no discovery) and render as a quiet
// "someday" group in the world nav. Add more here as the list grows.
export const dreams = [
  { place: 'Switzerland', note: 'The Alps' },
  { place: 'Iceland', note: 'The aurora' },
  { place: 'New Zealand', note: 'The far south' },
];
