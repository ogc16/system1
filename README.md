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
├── style.css               # Portal styles (design tokens + responsive breakpoints)
├── login.css               # Auth page styles
├── layout.js               # Shared sidebar navigation (single source of truth)
├── job-filters.js          # Shared search/filter logic for the job boards
└── pic/logo.jpg            # Favicon / brand logo
```

## How the shared pieces work

- **`layout.js`** — injects the sidebar into every portal page (pages contain only `<nav id="app-nav"></nav>`). It detects the current page from the URL and marks the matching link as active, so adding or renaming a page is a one-line change.
- **`job-filters.js`** — powers the search box, category select, recency select, and tag chips on `dashboard.html` and `jobs.html`. Cards carry a `data-tags` attribute (e.g. `data-tags="programming, design"`) that the filter script reads. The script no-ops on pages that don't expose the controls.
- **`style.css`** — colors are defined once as CSS variables in `:root` (e.g. `--accent`, `--bg`), so rebranding is a single edit. Responsive breakpoints at 1024px, 768px, and 480px turn the sidebar into a top nav on small screens.

## Adding a job

1. Give the card a `data-tags` attribute matching the filter chips:
   `data-tags="programming, design"`
2. Include the posting age inside `.job_salary span` as `<n> days ago` — the recency filter parses this text.
3. Paste the card markup as a `.job_card` block in `dashboard.html` and `jobs.html`.

## Customizing the brand

- **Logo / favicon:** replace `pic/logo.jpg`, referenced by every page's `<link rel="icon">`.
- **Colors:** edit the `:root` variables at the top of `style.css` (and `login.css` for auth pages).
- **Nav links:** edit the `NAV_LINKS` array in `layout.js`.

## Accessibility

- Keyboard-visible `:focus-visible` rings on interactive elements.
- All inputs have associated `<label>` elements.
- Filter tag chips are operable by mouse and keyboard (Enter / Space) and expose `aria-pressed` state.
- Semantic landmarks (`<nav>`, `<main>`) on every page.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). No legacy support.