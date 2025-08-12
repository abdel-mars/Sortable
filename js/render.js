import { state } from './state.js';

const columns = [
  { key: 'icon', label: '' },
  { key: 'name', label: 'Name' },
  /* …other columns… */
];

export function renderTable(heroes) {
  const thead = document.querySelector('#hero-table thead');
  const tbody = document.querySelector('#hero-table tbody');

  // 1) Render table headers with sort arrows
  thead.innerHTML = '<tr>' +
    columns.map(col => {
      const sorted = state.sortField === col.key;
      const arrow = sorted
        ? (state.sortDirection === 'asc' ? ' ▲' : ' ▼')
        : '';
      return `<th data-field="${col.key}">${col.label}${arrow}</th>`;
    }).join('') +
    '</tr>';

  // 2) Render table rows
  tbody.innerHTML = heroes.map(hero => `
    <tr data-id="${hero.id}">
      <td><img src="${hero.icon}" alt></td>
      <td>${hero.name}</td>
      <!-- add other cells the same way -->
    </tr>
  `).join('');

  // 3) Attach header click handlers for sorting
  thead.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.field;
      if (state.sortField === field) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortDirection = 'asc';
      }
      window.dispatchEvent(new Event('stateChange'));
    });
  });

  // 4) Attach row click handlers for detail view
  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => {
      const id = Number(tr.dataset.id);
      state.selectedHero = state.filteredHeroes.find(h => h.id === id);
      renderDetail(state.selectedHero);
    });
  });
}