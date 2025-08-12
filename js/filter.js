export function filterHeroes(state) {
  const term = state.searchTerm.toLowerCase();
  return state.allHeroes.filter(h => h.name.toLowerCase().includes(term));
}