import { state } from './state.js';

export function attachEventListeners() {
  document.getElementById('search-input')
    .addEventListener('input', e => {
      state.searchTerm = e.target.value;
      state.currentPage = 1;
      window.dispatchEvent(new Event('stateChange'));
    });

  document.getElementById('page-size-select')
    .addEventListener('change', e => {
      state.pageSize = e.target.value;
      state.currentPage = 1;
      window.dispatchEvent(new Event('stateChange'));
    });

  document.querySelectorAll('#hero-table th')
    .forEach(th => th.addEventListener('click', () => {
      const field = th.dataset.field;
      if (state.sortField === field) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortDirection = 'asc';
      }
      window.dispatchEvent(new Event('stateChange'));
    }));

  document.getElementById('pagination-controls')
    .addEventListener('click', e => {
      if (!e.target.matches('button')) return;
      const rel = e.target.dataset.rel;
      state.currentPage += (rel === 'next' ? 1 : -1);
      window.dispatchEvent(new Event('stateChange'));
    });

  // Re-render on any stateChange
  window.addEventListener('stateChange', () => {
    // assuming app.js listens and calls renderApp()
    document.dispatchEvent(new Event('renderApp'));
  });
}