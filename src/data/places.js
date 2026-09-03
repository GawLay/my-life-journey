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
      alt: galleryItem?.alt || `${moment.toLowerCase()} in ${city}, ${place.country}`,
      palette: galleryItem?.palette || palette,
    };
  });
}

const placeData = [
  {
    id: 'myanmar', iso: 'MMR', country: 'Myanmar', year: '2016', cities: 'YANGON / MANDALAY',
    coordinates: '16.8409° N / 96.1735° E', lat: 16.84, lng: 96.17, photos: 18, stories: 4,
    note: 'Where the story began — familiar streets, monsoon air and the instinct to keep making things.',
    images: [],
  },
  {
    id: 'thailand', iso: 'THA', country: 'Thailand', year: '2019', cities: 'BANGKOK / CHIANG MAI',
    coordinates: '13.7563° N / 100.5018° E', lat: 13.75, lng: 100.5, photos: 32, stories: 6,
    note: 'A chapter of heat, movement and learning to notice the generous details between destinations.',
    images: [],
  },
  {
    id: 'singapore', iso: 'SGP', country: 'Singapore', year: '2021', cities: 'SINGAPORE',
    coordinates: '1.3521° N / 103.8198° E', lat: 1.35, lng: 103.82, photos: 14, stories: 3,
    note: 'Small distances, sharp contrasts and an enduring lesson in precision at city scale.',
    images: [],
  },
  {
    id: 'vietnam', iso: 'VNM', country: 'Vietnam', year: 'NOW', cities: 'HO CHI MINH CITY / ĐÀ NẴNG / HỘI AN / MŨI NÉ',
    coordinates: '10.8231° N / 106.6297° E', lat: 10.82, lng: 106.63, photos: 20, stories: 5,
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
    ],
    deepDive: {
      cover: {
        src: '/images/world/vietnam/08-the-long-way-mui-ne-coast.webp',
        city: 'MŨI NÉ', moment: 'THE LONG WAY', position: 'center',
        alt: 'Travellers waving beside two colourful open-top jeeps on the coast at Mũi Né',
        palette: ['#293833', '#c9b88f', '#a84732'],
      },
      intro: 'Home is not one fixed point. It is city traffic after dark, lanterns over an old street, and the decision to take the longer road toward the sea.',
      opening: 'Bougainvillea spills over a busy old-town corner, where shopfronts, lanterns and passing conversations share the same warm afternoon light.',
      portraitTitle: 'The market opens<br /><em>one flower at a time.</em>',
      portraitCopy: 'On the stone steps, yellow chrysanthemums and pink blossoms turn an ordinary morning into a small ceremony of colour.',
      diptychCopy: 'Hội An lingers in handmade colour: silk lanterns up close, then the river market opening into a wider human scene.',
      closingCopy: 'At Mũi Né, the road gives way to sand. People become small marks on the ridge, and the horizon does the remembering.',
      photos: [
        {
          src: '/images/world/vietnam/deep-01-hoi-an-old-town.webp', city: 'HỘI AN', moment: 'OLD TOWN AFTERNOON', position: 'center 48%',
          alt: 'A busy Hội An old-town shopfront framed by yellow walls and flowering bougainvillea',
        },
        {
          src: '/images/world/vietnam/deep-02-hoi-an-flower-vendor.webp', city: 'HỘI AN', moment: 'MORNING MARKET', position: 'center 45%',
          alt: 'Flower vendors arranging yellow and pink blossoms on stone steps in Hội An',
        },
        {
          src: '/images/world/vietnam/deep-03-hoi-an-lantern-detail.webp', city: 'HỘI AN', moment: 'LANTERN DETAIL', position: 'center',
          alt: 'Rows of colourful silk lanterns hanging closely together in Hội An',
        },
        {
          src: '/images/world/vietnam/deep-04-hoi-an-river-market.webp', city: 'HỘI AN', moment: 'RIVER MARKET', position: 'center 52%',
          alt: 'Vendors and visitors gathered beneath hanging lanterns at Hội An river market',
        },
        {
          src: '/images/world/vietnam/deep-05-mui-ne-dunes.webp', city: 'MŨI NÉ', moment: 'DEPARTURE', position: 'center',
          alt: 'Tiny travellers and an orange jeep crossing a broad sand dune at Mũi Né',
        },
      ],
    },
  },
  {
    id: 'japan', iso: 'JPN', country: 'Japan', year: '2025', cities: 'TOKYO / KYOTO / OSAKA',
    coordinates: '35.6762° N / 139.6503° E', lat: 35.68, lng: 139.65, photos: 24, stories: 3,
    note: 'I arrived expecting one city and found a thousand small worlds, each moving at its own tempo.',
    images: [],
  },
];

export const places = placeData.map((place, index) => ({
  ...place,
  memories: createMemories(place, index),
}));
