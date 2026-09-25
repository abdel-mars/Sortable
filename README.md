# Superhero Directory

A searchable, sortable, paginated table of superheroes built with plain HTML, CSS, and JavaScript. Data comes from the [Superhero API](https://github.com/akabab/superhero-api) — no build step, no dependencies, no framework.

## Features

- **Sorting** — click any column header to toggle ascending/descending. Missing values always sort last.
- **Search** — filter heroes by name as you type.
- **Pagination** — 10, 20, 50, 100, or all heroes per page.
- **Detail view** — click a row to open a card with the hero's full stats and image.
- **Sticky UI** — the table header and the Name column stay visible while scrolling.
- **Responsive** — the layout adapts down to mobile widths.

## Tech

Vanilla HTML, CSS, and JavaScript using ES modules and the `fetch` API. The only runtime externals are Google Fonts and the hero dataset.

## File Structure

```
sortable/
├── index.html    # Markup: header, search controls, table, pagination, detail view
├── sortable.js   # State, data fetching, normalize, sort/filter/paginate, rendering
├── parse.js      # Weight, height, and stat parsers (kg, lb, ton, cm, m, ft'in")
├── styles.css    # Dark theme, sticky columns, responsive breakpoints
└── README.md
```

## Data

Heroes are fetched on page load from
`https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json`.

The API returns inconsistent height and weight formats. `parse.js` converts them into
sortable numbers (kg and cm) while the table still displays the API's original strings.
When a hero has no valid kg and cm value, the imperial value is used as a fallback.

## Run

The app uses ES modules and `fetch`, so it must be served over HTTP — opening
`index.html` directly from the filesystem will fail. From the `sortable/` directory run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy to GitHub Pages

This project lives in the `sortable/` subfolder of the repository, so the Pages source must
be the repository root:

1. Go to the repository on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`, then **Save**.
4. GitHub builds the site and publishes it at:

   <https://abdel-mars.github.io/Raids-js/sortable/>

Note: the bare root URL (`abdel-mars.github.io/Raids-js/`) will return 404 because the app
is in a subfolder — `/sortable/` is the entry point. No configuration changes are needed,
since all asset paths are relative.
