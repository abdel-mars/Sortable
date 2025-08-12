// --- State ---
const state = {
  allHeroes: [],
  filteredHeroes: [],
  searchTerm: '',
  sortField: 'name',
  sortDirection: 'asc',
  pageSize: '20',
  currentPage: 1,
  selectedHero: null
};

// --- Fetch & Initialize ---
async function init() {
  try {
    const resp = await fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json');
    const raw = await resp.json();
    state.allHeroes = normalize(raw);
    state.filteredHeroes = [...state.allHeroes];
    renderApp();
    attachEventListeners();
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

function normalize(raw) {
  return raw.map(hero => ({
    id: hero.id,
    icon: hero.images.xs,
    name: hero.name,
    fullName: hero.biography.fullName || '',
    intelligence: parseNum(hero.powerstats.intelligence),
    strength: parseNum(hero.powerstats.strength),
    speed: parseNum(hero.powerstats.speed),
    durability: parseNum(hero.powerstats.durability),
    power: parseNum(hero.powerstats.power),
    combat: parseNum(hero.powerstats.combat),
    race: hero.appearance.race || '',
    gender: hero.appearance.gender || '',
    height: parseNum(hero.appearance.height[1]),
    weight: parseNum(hero.appearance.weight[1]),
    birthPlace: hero.biography.placeOfBirth || '',
    alignment: hero.biography.alignment || '',
    largeImage: hero.images.lg
  }));
}
function parseNum(val) { const n = Number(val); return isNaN(n) ? null : n; }

// --- Render Cycle ---
function renderApp() {
  // Filter
  const term = state.searchTerm.toLowerCase();
  state.filteredHeroes = state.allHeroes.filter(h => !term || h.name.toLowerCase().includes(term));

  // Sort
  state.filteredHeroes.sort((a, b) => {
    const fa = a[state.sortField], fb = b[state.sortField];
    if (fa == null && fb == null) return 0;
    if (fa == null) return 1;
    if (fb == null) return -1;
    if (typeof fa === 'string') {
      return state.sortDirection === 'asc' ? fa.localeCompare(fb) : fb.localeCompare(fa);
    }
    return state.sortDirection === 'asc' ? fa - fb : fb - fa;
  });

  // Paginate
  const slice = (state.pageSize === 'all')
    ? state.filteredHeroes
    : state.filteredHeroes.slice(
        (state.currentPage - 1) * Number(state.pageSize),
        (state.currentPage - 1) * Number(state.pageSize) + Number(state.pageSize)
      );

  // Render
  renderControls();
  renderTable(slice);
  renderPagination();
}

// --- Render Helpers ---
function renderControls() {
  document.getElementById('search-input').value = state.searchTerm;
  document.getElementById('page-size-select').value = state.pageSize;
}

function renderTable(heroes) {
  const cols = [
    'icon','name','fullName','intelligence','strength',
    'speed','durability','power','combat','race',
    'gender','height','weight','birthPlace','alignment'
  ];
  const labels = {
    icon:'', name:'Name', fullName:'Full Name', intelligence:'Intelligence',
    strength:'Strength', speed:'Speed', durability:'Durability',
    power:'Power', combat:'Combat', race:'Race', gender:'Gender',
    height:'Height', weight:'Weight', birthPlace:'Place of Birth',
    alignment:'Alignment'
  };

  const thead = document.querySelector('#hero-table thead');
  const tbody = document.querySelector('#hero-table tbody');

  // Headers
  thead.innerHTML = '<tr>' + cols.map(c => {
    const sorted = state.sortField === c;
    const arrow = sorted ? (state.sortDirection === 'asc' ? ' ▲' : ' ▼') : '';
    return `<th data-field="${c}">${labels[c]}${arrow}</th>`;
  }).join('') + '</tr>';

  // Rows
  tbody.innerHTML = heroes.map(h => `
    <tr data-id="${h.id}">
      <td><img src="${h.icon}" alt=""></td>
      <td>${h.name}</td>
      <td>${h.fullName}</td>
      <td>${h.intelligence || ''}</td>
      <td>${h.strength || ''}</td>
      <td>${h.speed || ''}</td>
      <td>${h.durability || ''}</td>
      <td>${h.power || ''}</td>
      <td>${h.combat || ''}</td>
      <td>${h.race}</td>
      <td>${h.gender}</td>
      <td>${h.height || ''}</td>
      <td>${h.weight || ''}</td>
      <td>${h.birthPlace}</td>
      <td>${h.alignment}</td>
    </tr>
  `).join('');

  // Sort click
  thead.querySelectorAll('th').forEach(th => {
    th.onclick = () => {
      const f = th.dataset.field;
      if (state.sortField === f) state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDirection = 'asc'; }
      renderApp();
    };
  });

  // Detail click
  tbody.querySelectorAll('tr').forEach(tr => {
    tr.onclick = () => {
      state.selectedHero = state.filteredHeroes.find(h => h.id === Number(tr.dataset.id));
      renderDetail();
    };
  });
}

function renderPagination() {
  const pc = document.getElementById('pagination-controls');
  const total = state.filteredHeroes.length;
  const size = state.pageSize === 'all' ? total : Number(state.pageSize);
  const pages = Math.ceil(total / size) || 1;
  let html = '';
  if (pages > 1) {
    html += `<button id="prev" ${state.currentPage <= 1 ? 'disabled' : ''}>Prev</button>`;
    html += ` Page ${state.currentPage} of ${pages} `;
    html += `<button id="next" ${state.currentPage >= pages ? 'disabled' : ''}>Next</button>`;
  }
  pc.innerHTML = html;
  pc.querySelector('#prev')?.addEventListener('click', () => { state.currentPage--; renderApp(); });
  pc.querySelector('#next')?.addEventListener('click', () => { state.currentPage++; renderApp(); });
}

function renderDetail() {
  const d = document.getElementById('detail-view');
  if (!state.selectedHero) { d.hidden = true; return; }
  const h = state.selectedHero;
  d.innerHTML = `
    <button id="detail-close">✖</button>
    <h2>${h.name} (${h.fullName})</h2>
    <img src="${h.largeImage}" alt="">
    <ul>
      <li><strong>Intelligence:</strong> ${h.intelligence || ''}</li>
      <li><strong>Strength:</strong> ${h.strength || ''}</li>
      <li><strong>Speed:</strong> ${h.speed || ''}</li>
      <li><strong>Durability:</strong> ${h.durability || ''}</li>
      <li><strong>Power:</strong> ${h.power || ''}</li>
      <li><strong>Combat:</strong> ${h.combat || ''}</li>
      <li><strong>Race:</strong> ${h.race}</li>
      <li><strong>Gender:</strong> ${h.gender}</li>
      <li><strong>Height:</strong> ${h.height ? h.height + ' cm' : ''}</li>
      <li><strong>Weight:</strong> ${h.weight ? h.weight + ' kg' : ''}</li>
      <li><strong>Born in:</strong> ${h.birthPlace}</li>
      <li><strong>Alignment:</strong> ${h.alignment}</li>
    </ul>
  `;
  d.hidden = false;
  document.getElementById('detail-close').onclick = () => { state.selectedHero = null; renderDetail(); };
}

// --- Event Listeners ---
function attachEventListeners() {
  document.getElementById('search-input').addEventListener('input', e => {
    state.searchTerm = e.target.value;
    state.currentPage = 1;
    renderApp();
  });
  document.getElementById('page-size-select').addEventListener('change', e => {
    state.pageSize = e.target.value;
    state.currentPage = 1;
    renderApp();
  });
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
