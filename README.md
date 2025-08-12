## Project Overview

A standalone web application (no frameworks) to fetch, display, filter, sort, paginate, and inspect superhero data from a remote JSON source.

---

## High-Level Layers

1. **Data Layer**

   * Fetch JSON data once on load.
   * Normalize into a flat array of hero objects.

2. **State & Logic Layer**

   * Maintain application state (`allHeroes`, `filteredHeroes`, `searchTerm`, `sortField`, `sortDirection`, `pageSize`, `currentPage`).
   * Implement filtering, sorting, and pagination operations purely in JS.

3. **View Layer (DOM)**

   * Render controls (search input, page-size selector, pagination buttons).
   * Render table (header and body) based on current state.
   * Handle user interactions (input events, clicks) to update state and re-render.

4. **URL Synchronization (Bonus)**

   * Encode state in the query string.
   * On init, parse URL to restore state and render accordingly.

5. **Detail View (Bonus)**

   * When a row is clicked, display full details and large image in a modal or expansion panel.

---

## Suggested File Structure

```
/ (project root)
├── index.html        # HTML skeleton: controls, table, modal container
├── styles.css        # Styles for layout, table, controls, modal
└── js
    ├── app.js        # Entry point: init, fetch, render
    ├── data.js       # Functions: fetchData(), normalizeHeroes(raw)
    ├── state.js      # State object and getters/setters
    ├── filter.js     # filterHeroes(state)
    ├── sort.js       # sortHeroes(state)
    ├── paginate.js   # paginateHeroes(state)
    ├── render.js     # renderControls(), renderTable(), renderPagination(), renderDetail()
    └── events.js     # attachEventListeners()
```

---

## Data & Control Flow

1. **Initialization**

   * `app.js` on DOMContentLoaded → `fetchData()` → `normalizeHeroes()` → set `state.allHeroes` → call `renderApp()`.

2. **Render Cycle (`renderApp()`)**

   * Compute `state.filteredHeroes = filterHeroes(state)`
   * Apply `sortHeroes(state.filteredHeroes, state.sortField, state.sortDirection)`
   * Split into pages via `paginateHeroes(...)`
   * Call view functions in `render.js` with current page slice and state.

3. **User Interaction**

   * **Search Input** → updates `state.searchTerm` → `renderApp()`
   * **Column Header Click** → toggles `state.sortField`/`sortDirection` → `renderApp()`
   * **Page-Size Select** → updates `state.pageSize` + resets `state.currentPage` → `renderApp()`
   * **Pagination Buttons** → update `state.currentPage` → `renderApp()`
   * **Row Click** → set `state.selectedHero` → `renderDetail()`

---

## Performance Considerations

* Batch DOM writes (construct rows in a document fragment or HTML string).
* Use simple array operations in memory.
* Optional: debounce search input if needed.

---

## Extensibility Points

* Add specialized search operators in `filter.js` (e.g. `>`, `<`, `!`).
* Extract URL-sync logic into `urlSync.js`.
* Theme toggling (dark/light) by adding a style switcher.
