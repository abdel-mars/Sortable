import { parseWeight, parseHeight, parseStat } from './parse.js';


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
  return raw.map(hero => {
    const lbStr  = hero.appearance.weight[0];
    const kgStr  = hero.appearance.weight[1];
    const kg = parseWeight(kgStr);
    const lb = parseWeight(lbStr);
    let weightVal, weightRaw;
    if (kg != null && kg > 0) {
      weightVal = kg; weightRaw = kgStr;
    } else if (lb != null && lb > 0) {
      weightVal = lb; weightRaw = lbStr;
    } else {
      weightVal = null; weightRaw = '-';
    }

    const footStr  = hero.appearance.height[0];
    const cmOrMStr  = hero.appearance.height[1];
    const cm = parseHeight(cmOrMStr);
    const foot = parseHeight(footStr);
    let heightVal, heightRaw;
    if (cm != null && cm > 0) {
      heightVal = cm; heightRaw = cmOrMStr;
    } else if (foot != null && foot > 0) {
      heightVal = foot; heightRaw = footStr;
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

function renderApp() {
  const term = state.searchTerm.toLowerCase();
  state.filteredHeroes = state.allHeroes.filter(h =>
    !term || h.name.toLowerCase().includes(term)
  );

  state.filteredHeroes.sort((a, b) => {
    const fa = a[state.sortField], fb = b[state.sortField];
    const missA = fa == null || fa === '-';
    const missB = fb == null || fb === '-';
    if (missA && missB) return 0;
    if (missA) return 1;
    if (missB) return -1;

    const spA = (typeof fa === 'string') && !/^[A-Za-z0-9]/.test(fa);
    const spB = (typeof fb === 'string') && !/^[A-Za-z0-9]/.test(fb);
    if (!spA && spB) return -1;
    if (spA && !spB) return 1;

    if (typeof fa === 'string') {
      return state.sortDirection === 'asc'
        ? fa.localeCompare(fb)
        : fb.localeCompare(fa);
    }
    return state.sortDirection === 'asc' ? fa - fb : fb - fa;
  });

  const perPage = Number(state.pageSize);
  const page = state.currentPage;
  const start = (page - 1) * perPage;
  const end   = start + perPage;

  const slice = state.pageSize === 'all'
    ? state.filteredHeroes
    : state.filteredHeroes.slice(start, end);

  renderControls();
  renderTable(slice);
  renderPagination();
}

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
    return `<th data-field="${field}" tabindex="0">${labels[c]}${arrow}</th>`;
  }).join('') + '</tr>';

  tbody.innerHTML = heroes.map(h => `
    <tr data-id="${h.id}">
      <td><img src="${h.icon}" alt="${h.name} icon"></td>
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
    const toggleSort = () => {
      const field = th.dataset.field;
      if (state.sortField === field) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortDirection = 'asc';
      }
      renderApp();
    };
    th.onclick = toggleSort;
    th.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSort();
      }
    });
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
    <img src="${h.largeImage}" alt="${h.name} large image">
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
  
  document.getElementById('logo').addEventListener('click', () => {
    window.location.reload();
  });
}
document.addEventListener('DOMContentLoaded', init);
