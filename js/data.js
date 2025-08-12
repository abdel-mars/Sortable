export async function fetchData() {
  const resp = await fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json');
  return resp.json();
}

export function normalizeHeroes(raw) {
  return raw.map(hero => ({
    id: hero.id,
    icon: hero.images.xs,
    name: hero.name,
    fullName: hero.biography.fullName || null,
    intelligence: +hero.powerstats.intelligence || null,
    strength: +hero.powerstats.strength || null,
    speed: +hero.powerstats.speed || null,
    durability: +hero.powerstats.durability || null,
    power: +hero.powerstats.power || null,
    combat: +hero.powerstats.combat || null,
    race: hero.appearance.race || null,
    gender: hero.appearance.gender || null,
    height: parseNumber(hero.appearance.height[1]),
    weight: parseNumber(hero.appearance.weight[1]),
    birthPlace: hero.biography.placeOfBirth || null,
    alignment: hero.biography.alignment || null,
    largeImage: hero.images.lg
  }));
}

function parseNumber(str = '') {
  const num = str.replace(/[^[0-9.]]/g, '');
  return num ? +num : null;
}