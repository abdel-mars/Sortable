export function parseWeight(str = '') {
  const clean = str.replace(/,/g, '').toLowerCase();
  const n = parseFloat(clean);
  if (isNaN(n)) return null;
  if (clean.includes('ton')) return n * 1000;
  if (clean.includes('kg'))  return n;
  if (clean.includes('lb'))  return n * 0.453592;
  return n;
}


export function parseHeight(str = '') {
  const clean = str.trim().toLowerCase();
  if (clean.includes('cm')) {
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
  }
  if (clean.includes('m') && !clean.includes('cm')) {
    const n = parseFloat(clean);
    return isNaN(n) ? null : n * 100;
  }
  const match = clean.match(/(\d+)'(\d+)/);
  if (match) {
    const feet = Number(match[1]), inches = Number(match[2]);
    return feet * 30.48 + inches * 2.54;
  }
  return null;
}

export function parseStat(val) {
  const n = Number(val);
  return isNaN(n) ? null : n;
}
