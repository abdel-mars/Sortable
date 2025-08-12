export function sortHeroes(arr, field, dir) {
  arr.sort((a, b) => {
    const va = a[field], vb = b[field];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') {
      return dir === 'asc'
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    }
    return dir === 'asc' ? va - vb : vb - va;
  });
}