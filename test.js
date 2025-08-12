// test.js

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

// --- Normalize & Unit Parsing (with fallback imperial) ---
function normalize(raw) {
  return raw.map(hero => {
    // Weight: choose metric if available, else imperial, else dash
    const impW  = hero.appearance.weight[0];
    const metW  = hero.appearance.weight[1];
    const metKg = parseWeight(metW);
    const impKg = parseWeight(impW);
    let weightVal, weightRaw;
    if (metKg > 0) {
      weightVal = metKg; weightRaw = metW;
    } else if (impKg > 0) {
      weightVal = impKg; weightRaw = impW;
    } else {
      weightVal = null; weightRaw = '-';
    }

    // Height: choose metric if available, else imperial, else dash
    const impH  = hero.appearance.height[0];
    const metH  = hero.appearance.height[1];
    const metCm = parseHeight(metH);
    const impCm = parseHeight(impH);
    let heightVal, heightRaw;
    if (metCm > 0) {
      heightVal = metCm; heightRaw = metH;
    } else if (impCm > 0) {
      heightVal = impCm; heightRaw = impH;
    } else {
      heightVal = null; heightRaw = '-';
    }

    return {
      id: hero.id,
      icon: hero.images.xs,
      name: hero.name,
      fullName: hero.biography.fullName || '-',
      intelligence: parseStat(hero.powerstats.intelligence),
      strength:     parseStat(hero.powerstats.strength),
      speed:        parseStat(hero.powerstats.speed),
      durability:   parseStat(hero.powerstats.durability),
      power:        parseStat(hero.powerstats.power),
      combat:       parseStat(hero.powerstats.combat),
      race: hero.appearance.race || '-',
      gender: hero.appearance.gender || '-',
      height: heightVal,
      heightRaw,
      weight: weightVal,
      weightRaw,
      birthPlace: hero.biography.placeOfBirth || '-',
      alignment: hero.biography.alignment || '-',
      largeImage: hero.images.lg
    };
  });
}

function parseStat(val) {
  const n = Number(val);
  return isNaN(n) ? null : n;
}

// Parse weight strings into kg
function parseWeight(str = '') {
  const clean = str.replace(/,/g, '').toLowerCase();
  const n = parseFloat(clean);
  if (isNaN(n)) return null;
  if (clean.includes('ton')) return n * 1000;
  if (clean.includes('kg'))  return n;
  if (clean.includes('lb'))  return n * 0.453592;
  return n;
}

// Parse height strings into cm
function parseHeight(str = '') {
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

// --- Render Cycle ---
function renderApp() {
  const term = state.searchTerm.toLowerCase();
  state.filteredHeroes = state.allHeroes.filter(h =>
    !term || h.name.toLowerCase().includes(term)
  );

  // Sort: normal values first, then special-start strings, then '-' entries
  state.filteredHeroes.sort((a, b) => {
    const fa = a[state.sortField], fb = b[state.sortField];
    const missA = fa == null || fa === '-';
    const missB = fb == null || fb === '-';
    if (missA && missB) return 0;
    if (missA) return 1;
    if (missB) return -1;

    // detect special-start (non-alphanumeric) for string fields
    const spA = (typeof fa === 'string') && !/^[A-Za-z0-9]/.test(fa);
    const spB = (typeof fb === 'string') && !/^[A-Za-z0-9]/.test(fb);
    if (!spA && spB) return -1;
    if (spA && !spB) return 1;

    // both normal or both special
    if (typeof fa === 'string') {
      return state.sortDirection === 'asc'
        ? fa.localeCompare(fb)
        : fb.localeCompare(fa);
    }
    return state.sortDirection === 'asc' ? fa - fb : fb - fa;
  });

  const slice = state.pageSize === 'all'
    ? state.filteredHeroes
    : state.filteredHeroes.slice(
        (state.currentPage - 1) * Number(state.pageSize),
        (state.currentPage - 1) * Number(state.pageSize) + Number(state.pageSize)
      );

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
    'icon','name','fullName',
    'intelligence','strength','speed','durability','power','combat',
    'race','gender','heightRaw','weightRaw',
    'birthPlace','alignment'
  ];
  const labels = {
    icon:'', name:'Name', fullName:'Full Name',
    intelligence:'Intelligence', strength:'Strength', speed:'Speed',
    durability:'Durability', power:'Power', combat:'Combat',
    race:'Race', gender:'Gender', heightRaw:'Height', weightRaw:'Weight',
    birthPlace:'Place of Birth', alignment:'Alignment'
  };

  const thead = document.querySelector('#hero-table thead');
  const tbody = document.querySelector('#hero-table tbody');

  thead.innerHTML = '<tr>' + cols.map(c => {
    const field = c.replace(/Raw$/, '');
    const sorted = state.sortField === field;
    const arrow  = sorted ? (state.sortDirection==='asc'?' ▲':' ▼') : '';
    return `<th data-field="${field}">${labels[c]}${arrow}</th>`;
  }).join('') + '</tr>';

  tbody.innerHTML = heroes.map(h => `
    <tr data-id="${h.id}">
      <td><img src="${h.icon}" alt=""></td>
      <td>${h.name}</td>
      <td>${h.fullName}</td>
      <td>${h.intelligence  ?? '-'}</td>
      <td>${h.strength      ?? '-'}</td>
      <td>${h.speed         ?? '-'}</td>
      <td>${h.durability    ?? '-'}</td>
      <td>${h.power         ?? '-'}</td>
      <td>${h.combat        ?? '-'}</td>
      <td>${h.race}</td>
      <td>${h.gender}</td>
      <td>${h.heightRaw     ?? '-'}</td>
      <td>${h.weightRaw     ?? '-'}</td>
      <td>${h.birthPlace}</td>
      <td>${h.alignment}</td>
    </tr>
  `).join('');

  thead.querySelectorAll('th').forEach(th => {
    th.onclick = () => {
      const field = th.dataset.field;
      if (state.sortField === field) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortDirection = 'asc';
      }
      renderApp();
    };
  });

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.onclick = () => {
      state.selectedHero = state.filteredHeroes.find(h => h.id === Number(tr.dataset.id)) || null;
      renderDetail();
    };
  });
}

function renderPagination() {
  const pc    = document.getElementById('pagination-controls');
  const total = state.filteredHeroes.length;
  const size  = state.pageSize === 'all' ? total : Number(state.pageSize);
  const pages = Math.ceil(total/size) || 1;
  let html = '';
  if (pages>1) {
    html += `<button id="prev" ${state.currentPage<=1?'disabled':''}>Prev</button>`;
    html += ` Page ${state.currentPage} of ${pages} `;
    html += `<button id="next" ${state.currentPage>=pages?'disabled':''}>Next</button>`;
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
      <li><strong>Intelligence:</strong> ${h.intelligence  ?? '-'}</li>
      <li><strong>Strength:</strong>     ${h.strength      ?? '-'}</li>
      <li><strong>Speed:</strong>        ${h.speed         ?? '-'}</li>
      <li><strong>Durability:</strong>   ${h.durability    ?? '-'}</li>
      <li><strong>Power:</strong>        ${h.power         ?? '-'}</li>
      <li><strong>Combat:</strong>       ${h.combat        ?? '-'}</li>
      <li><strong>Race:</strong>         ${h.race}</li>
      <li><strong>Gender:</strong>       ${h.gender}</li>
      <li><strong>Height:</strong>       ${h.heightRaw     ?? '-'}</li>
      <li><strong>Weight:</strong>       ${h.weightRaw     ?? '-'}</li>
      <li><strong>Born in:</strong>      ${h.birthPlace}</li>
      <li><strong>Alignment:</strong>    ${h.alignment}</li>
    </ul>
  `;
  d.hidden = false;
  document.getElementById('detail-close').onclick = () => {
    state.selectedHero = null;
    renderDetail();
  };
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
