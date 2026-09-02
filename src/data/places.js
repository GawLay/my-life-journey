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
  const imageCount = Math.max(memoryBlueprints.length, place.images?.length || 0);

  return Array.from({ length: imageCount }, (_, index) => {
    const [moment, cityIndex, aspect] = memoryBlueprints[index % memoryBlueprints.length];
    const palette = memoryPalettes[(index + placeIndex) % memoryPalettes.length];
    const city = cities[cityIndex % cities.length];
    return {
      id: `${place.id}-memory-${String(index + 1).padStart(2, '0')}`,
      index: index + 1,
      city,
      moment,
      aspect,
      src: place.images?.[index] || '',
      alt: `${moment.toLowerCase()} in ${city}, ${place.country}`,
      palette,
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
    id: 'vietnam', iso: 'VNM', country: 'Vietnam', year: 'NOW', cities: 'HO CHI MINH CITY / ĐÀ NẴNG',
    coordinates: '10.8231° N / 106.6297° E', lat: 10.82, lng: 106.63, photos: 48, stories: 8,
    note: 'Home now: early coffee, late rides and a city whose pace keeps sharpening the work.',
    images: [],
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
