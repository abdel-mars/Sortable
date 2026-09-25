1. Purpose of the Project
The project is a web application that:

Fetches superhero data from an external API (all.json file).

Displays the data in a sortable, searchable, paginated table.

Allows users to click on a row to see detailed info in a popup view.

Lets users change the number of items per page.

Ensures sorting works for both text and numeric values (e.g., “78 kg” before “100 kg”).

Handles missing values by always pushing them to the bottom in any sort order.

2. The Flow (How it works step-by-step)
Step 1 – Initial Setup
When the page loads, the init() function:

Fetches the JSON data from the API.

Runs the normalize() function to clean and prepare the raw superhero data.

Stores the clean data in the state object for later use.

Calls renderApp() to display the first version of the table.

Calls attachEventListeners() to activate user interactions (search, pagination, sorting, detail view).

3. The State Object
This is like the memory of your app.
It stores:

All heroes (allHeroes)

The current filtered list (filteredHeroes)

Search term (searchTerm)

Sort column & direction (sortField & sortDirection)

Page size (pageSize) and current page (currentPage)

The hero selected for detail view (selectedHero)

Everything that changes on screen is driven by changing this state and re-rendering.

4. Normalizing the Data — normalize()
Why normalize? The API data is messy — some values are missing, units differ (cm/m/feet/inches for height; kg/lb/tons for weight).

normalize():

Extracts only the needed fields (name, image, stats, etc.).

Converts height and weight into consistent numeric values for sorting (in cm and kg).

Keeps a raw string version (e.g., "78 kg") for display.

Handles missing values by replacing them with '-'.

Helper functions inside:

parseWeight() → turns strings like "176 lb" or "0.8 tons" into kilograms.

parseHeight() → turns "5'9" or "1.75 m" into centimeters.

parseStat() → turns stat strings like "null" or "85" into numbers or null.

5. Rendering the App — renderApp()
This is the heart of the project — whenever state changes, we re-run this to update the UI.

It:

Filters heroes based on the searchTerm.

Sorts them using custom sorting logic:

Missing values last.

Numbers sorted numerically, strings alphabetically.

Case-insensitive for strings.

Slices the data into only the current page based on pageSize & currentPage.

Calls:

renderControls() → updates search input & page size dropdown.

renderTable() → builds the actual <table> rows.

renderPagination() → builds prev/next page buttons.

6. Rendering the Table — renderTable()
This builds:

A table header (<thead>) with clickable sortable column names.

A table body (<tbody>) with each hero’s data.

It also:

Adds a click handler to each header cell:

First click sorts ascending.

Clicking again toggles ascending/descending.

Adds a click handler to each row to open the detail view for that hero.

7. Sorting Logic
The sort is smart:

First, it checks if a value is missing → push it to the bottom.

For strings:

Case-insensitive alphabetical order.

For numbers:

True numeric order (so 78 < 100 even if stored as "78 kg").

A click on the same column toggles between ascending & descending.

8. Pagination — renderPagination()
It:

Calculates total pages based on filtered heroes & pageSize.

Shows Prev / Next buttons if needed.

Disables Prev if on the first page, disables Next if on the last page.

Clicking these buttons changes currentPage and re-runs renderApp().

9. Search — Live Filtering
The search box:

On every keystroke, updates searchTerm in state.

Resets currentPage to 1.

Calls renderApp() to refresh the table with matching heroes.

10. Detail View — renderDetail()
When a row is clicked:

selectedHero is set in state.

renderDetail():

Creates a popup with all hero info (large image, stats, appearance, biography).

Adds a close button to hide the popup.

11. Event Listeners — attachEventListeners()
This function makes the page interactive by:

Updating the state when:

Search input changes.

Page size dropdown changes.

Table headers are clicked for sorting.

Rows are clicked for detail view.

Reloading the page when the logo is clicked.

12. Overall Logic Flow
Think of it like this:

Start → Fetch & normalize data → store in state.

Render → Filter → Sort → Slice for page → Draw table, controls, pagination.

User acts → Changes state (search, sort, page change, select hero).

Re-render → Repeat step 2 with updated state.

Everything in your app is a loop of:
State change → Render → User interacts → State change → Render again.

If you can explain it in these steps, you’ll sound like you’ve fully mastered it:

“We fetch superhero data, clean it, store it in state, and render a table. The table supports search, sorting, and pagination. Every user interaction changes the state, and then the UI re-renders based on that updated state.”

