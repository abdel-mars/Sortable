import { fetchData, normalizeHeroes } from './data.js';
import { state } from './state.js';
import { filterHeroes } from './filter.js';
import { sortHeroes } from './sort.js';
import { paginateHeroes } from './paginate.js';
import { renderControls, renderTable, renderPagination, renderDetail } from './render.js';
import { attachEventListeners } from './events.js';

function renderApp() {
  state.filteredHeroes = filterHeroes(state);
  sortHeroes(state.filteredHeroes, state.sortField, state.sortDirection);
  const pageSlice = paginateHeroes(state);

  renderControls(state);
  renderTable(pageSlice, state);
  renderPagination(state);
  if (state.selectedHero) renderDetail(state.selectedHero);
}

function init() {
  fetchData()
    .then(raw => {
      state.allHeroes = normalizeHeroes(raw);
      state.filteredHeroes = [...state.allHeroes];
      renderApp();
      attachEventListeners();
      window.addEventListener('stateChange', renderApp);
    })
    .catch(console.error);
}

document.addEventListener('DOMContentLoaded', init);