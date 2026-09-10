# Job Portal

A lightweight, static job search portal with a live filtering dashboard. Pure HTML, CSS, and vanilla JavaScript — no build step, no framework, no dependencies beyond Font Awesome.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Landing page with featured jobs |
| `dashboard.html` | Job board with search, category, recency and tag filtering |
| `jobs.html` | Full job list with the same filtering as the dashboard |
| `job-details.html` | Individual job detail view |
| `analytics.html` | Portal statistics |
| `documents.html` | User documents |
| `settings.html` | Account settings |
| `help.html` | Support / FAQ |
| `about.html` | About the portal |
| `login.html` | Sign-in form |
| `signup.html` | Account creation form |
| `forgot-password.html` | Password recovery form |

## Running locally

No server or install needed — open any page directly:

```
start dashboard.html
```

Or serve the folder for a more faithful experience (works with any static server):

```
npx serve .
```

## Structure

```
.
├── index.html              # Landing page
├── dashboard.html          # Filterable job board
├── jobs.html               # Full job list
├── job-details.html        # Job detail view
├── analytics.html          # Statistics
├── documents.html          # User documents
├── settings.html           # Account settings
├── help.html               # Support
├── about.html              # About page
├── login.html              # Sign-in
├── signup.html             # Sign-up
├── forgot-password.html    # Password recovery
├── style.css               # Portal styles (design tokens, badges, skeleton, responsive)
├── login.css               # Auth page styles
├── jobs.js                 # Job data (single source of truth for all listings)
├── job-filters.js          # Renderer, debounced search, skeleton, empty state, badges
├── layout.js               # Shared sidebar navigation (single source of truth)
└── pic/logo.jpg            # Favicon / brand logo
```

## How the shared pieces work

- **`jobs.js`** — the single source of truth for all job listings. Each entry carries the title, company, icon class, salary range, posting age, category tags, and structured fields for location, type, and seniority level — all rendered automatically.
- **`job-filters.js`** — renders cards from `jobs.js` and powers search (debounced 250 ms), category select, recency select, and tag chips on `dashboard.html` / `jobs.html`. On `index.html` it renders the top 3 most recent jobs as featured cards. A skeleton shimmer is shown briefly during initial render, and an empty state appears when no jobs match the current filters.
- **`layout.js`** — injects the sidebar into every portal page (pages contain only `<nav id="app-nav"></nav>`). It detects the current page from the URL and marks the matching link as active, so adding or renaming a page is a one-line change.
- **`style.css`** — colors are defined once as CSS variables in `:root` (e.g. `--accent`, `--bg`), so rebranding is a single edit. Includes card hover/active/focus-visible states, colored badge pills for location/type/level, skeleton shimmer animation, and responsive breakpoints at 1024px, 768px, and 480px.

## Adding a job

Open `jobs.js` and append an object to the `JOBS` array:

```js
{
  title: 'Staff Engineer',
  company: 'Stripe',
  icon: 'fab fa-stripe',          // any Font Awesome brand class
  categories: ['programming'],
  salaryMin: 180,                  // annual, USD (whole thousands)
  salaryMax: 250,
  postedDays: 1,
  type: 'Full-time',              // or 'Contract'
  location: 'Remote',             // or 'Hybrid' / 'On-site'
  level: 'Senior',                // or 'Junior' / 'Mid' / 'Manager'
  dashboard: true                 // true = shown on dashboard recent list
}
```

The renderer in `job-filters.js` handles all markup, badges, and count automatically.

## Customizing the brand

- **Logo / favicon:** replace `pic/logo.jpg`, referenced by every page's `<link rel="icon">`.
- **Colors:** edit the `:root` variables at the top of `style.css` (and `login.css` for auth pages).
- **Nav links:** edit the `NAV_LINKS` array in `layout.js`.

## Accessibility

- Keyboard-visible `:focus-visible` rings on interactive elements.
- All inputs have associated `<label>` elements; selects carry `aria-label`.
- Filter tag chips are operable by mouse and keyboard (Enter / Space) and expose `aria-pressed` + `aria-controls`.
- Each rendered card has a descriptive `aria-label` for screen readers.
- `aria-hidden="true"` on all decorative Font Awesome icons.
- `aria-live="polite"` + `aria-busy` on the job list for announced count changes.
- Empty state appears when no jobs match, with a clear-filters button.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). No legacy support.