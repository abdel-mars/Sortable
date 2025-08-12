export function paginateHeroes(state) {
  const all = state.filteredHeroes;
  if (state.pageSize === 'all') return all;
  const size = +state.pageSize;
  const start = (state.currentPage - 1) * size;
  return all.slice(start, start + size);
}