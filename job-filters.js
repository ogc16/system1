/* ── Job-filter engine & component renderer.

   Three modes detected automatically:
     1. Filter page  (#job-search + #job-list)  – dashboard.html / jobs.html
     2. Featured page (#featured-jobs)           – index.html
     3. Neither page – bail out silently.        (layout.js pages without jobs)

   Relies on the global JOBS array supplied by jobs.js. */

(function () {
    'use strict';

    /* ── Helpers ──────────────────────────────────────────────────────── */

    var SEARCH_DELAY = 250;          // ms debounce
    var SKELETON_MS  = 350;          // simulated load delay for skeleton demo

    var SEARCH_INPUT   = document.getElementById('job-search');
    var CATEGORY_SEL   = document.getElementById('job-category');
    var LOCATION_SEL   = document.getElementById('job-location');
    var SALARY_SEL     = document.getElementById('job-salary');
    var FILTER_SEL     = document.getElementById('job-filter');
    var JOB_LIST       = document.getElementById('job-list');
    var FEATURED_LIST  = document.getElementById('featured-jobs');
    var COUNT_EL       = document.getElementById('job-count');
    var EMPTY_EL       = document.getElementById('no-results');
    var tagChips       = Array.prototype.slice.call(document.querySelectorAll('.tag[data-tag]'));
    var activeTags     = [];

    var SKELETON_HTML =
        '<div class="skeleton-card" aria-hidden="true">' +
            '<div class="job_details">' +
                '<div class="skeleton sk-icon"></div>' +
                '<div class="skeleton-text">' +
                    '<div class="sk-title"></div>' +
                    '<div class="sk-sub"></div>' +
                '</div>' +
            '</div>' +
            '<div class="skeleton-right">' +
                '<div class="sk-salary"></div>' +
                '<div class="sk-date"></div>' +
            '</div>' +
        '</div>';

    function skeletonSet(count) {
        var out = '';
        for (var i = 0; i < count; i++) { out += SKELETON_HTML; }
        return out;
    }

    function salaryText(job) {
        return '$' + job.salaryMin + 'k \u2013 $' + job.salaryMax + 'k /yr';
    }

    function dateText(days) {
        return days + (days === 1 ? ' day ago' : ' days ago');
    }

    function badgeClass(label) {
        if (label === 'Remote')   return 'badge-green';
        if (label === 'Hybrid')   return 'badge-blue';
        if (label === 'On-site')  return 'badge-gray';
        if (label === 'Junior')   return 'badge-green';
        if (label === 'Mid')      return 'badge-blue';
        if (label === 'Senior')   return 'badge-purple';
        if (label === 'Manager')  return 'badge-gold';
        if (label === 'Full-time') return 'badge-indigo';
        if (label === 'Contract')  return 'badge-orange';
        return 'badge-gray';
    }

    function renderBadges(job) {
        return '<span class="badge ' + badgeClass(job.type) + '">' + job.type + '</span>' +
               '<span class="badge ' + badgeClass(job.location) + '">' + job.location + '</span>' +
               '<span class="badge ' + badgeClass(job.level) + '">' + job.level + '</span>';
    }

    function renderCard(job) {
        var tags = job.categories.join(', ');
        var label = job.title + ' at ' + job.company + ', ' +
                    job.level + ', ' + job.type + ', ' + job.location + ', ' +
                    salaryText(job);
        return (
            '<a href="job-details.html" class="job_card" data-tags="' + tags + '" aria-label="' + label + '">' +
                '<div class="job_details">' +
                    '<div class="img">' +
                        '<i class="' + job.icon + '" aria-hidden="true"></i>' +
                    '</div>' +
                    '<div class="text">' +
                        '<h2>' + job.title + '</h2>' +
                        '<span>' + job.company + ' \u2013 ' + job.level + ' Post</span>' +
                        '<div class="badges">' + renderBadges(job) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="job_salary">' +
                    '<h4>' + salaryText(job) + '</h4>' +
                    '<span>' + dateText(job.postedDays) + '</span>' +
                '</div>' +
            '</a>'
        );
    }

    function setHTML(el, html) {
        el.innerHTML = html;
    }

    /* ── Featured cards (index.html) ──────────────────────────────────── */

    function renderFeatured() {
        if (!FEATURED_LIST || typeof JOBS === 'undefined') { return; }
        var sorted = JOBS.slice().sort(function (a, b) {
            return a.postedDays - b.postedDays;
        });
        setHTML(FEATURED_LIST, sorted.slice(0, 3).map(renderCard).join(''));
    }

    /* ── Filter logic ─────────────────────────────────────────────────── */

    var isDashboard = JOB_LIST &&
        window.location.pathname.toLowerCase().indexOf('dashboard') !== -1;

    function baseJobs() {
        return isDashboard
            ? JOBS.filter(function (j) { return j.dashboard; })
            : JOBS;
    }

    function daysPosted(job) {
        return job.postedDays || 999;
    }

    function matchesCategory(job) {
        var sel = CATEGORY_SEL ? CATEGORY_SEL.value.toLowerCase() : '';
        if (!sel || sel === 'category') { return true; }
        return job.categories.indexOf(sel) !== -1;
    }

    function matchesLocation(job) {
        var sel = LOCATION_SEL ? LOCATION_SEL.value.toLowerCase() : '';
        if (!sel) { return true; }
        return job.location.toLowerCase().indexOf(sel.slice(0, 2)) === 0;
    }

    function matchesSalary(job) {
        var range = SALARY_SEL ? SALARY_SEL.value : '';
        if (!range) { return true; }
        var parts = range.split('-');
        var lo = parseInt(parts[0], 10);
        var hi = parseInt(parts[1], 10);
        return job.salaryMax >= lo && job.salaryMin <= hi;
    }

    function applyFilters() {
        var all = baseJobs();
        var query = SEARCH_INPUT.value.trim().toLowerCase();
        var maxDays = FILTER_SEL && FILTER_SEL.value ? parseInt(FILTER_SEL.value, 10) : null;
        var visible = [];

        for (var i = 0; i < all.length; i++) {
            var job = all[i];
            var text = (job.title + ' ' + job.company).toLowerCase();
            var matchesQuery  = !query || text.indexOf(query) !== -1;
            var matchesCats   = matchesCategory(job);
            var matchesLoc    = matchesLocation(job);
            var matchesSal    = matchesSalary(job);
            var matchesDays   = maxDays === null || daysPosted(job) <= maxDays;
            var matchesTags   = activeTags.length === 0 || job.categories.some(function (c) {
                return activeTags.indexOf(c) !== -1;
            });
            if (matchesQuery && matchesCats && matchesLoc && matchesSal && matchesDays && matchesTags) {
                visible.push(job);
            }
        }

        setHTML(JOB_LIST, visible.map(renderCard).join(''));
        if (COUNT_EL) { COUNT_EL.textContent = visible.length; }

        if (EMPTY_EL) {
            EMPTY_EL.hidden = visible.length > 0;
            JOB_LIST.hidden = visible.length === 0;
        }
    }

    /* ── Debounce helper ──────────────────────────────────────────────── */

    function debounce(fn, ms) {
        var timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, ms);
        };
    }

    /* ── Chip interaction (keyboard + mouse) ──────────────────────────── */

    tagChips.forEach(function (chip) {
        chip.setAttribute('role', 'button');
        chip.setAttribute('tabindex', '0');
        chip.setAttribute('aria-pressed', 'false');
        chip.setAttribute('aria-controls', 'job-list');
    });

    function toggleTag(tag) {
        var i = activeTags.indexOf(tag);
        if (i === -1) { activeTags.push(tag); } else { activeTags.splice(i, 1); }
    }

    function chipPulse(chip) {
        return chip.classList.contains('active');
    }

    tagChips.forEach(function (chip) {
        function toggle() {
            toggleTag(chip.getAttribute('data-tag'));
            chip.classList.toggle('active');
            chip.setAttribute('aria-pressed', String(chipPulse(chip)));
            applyFilters();
        }
        chip.addEventListener('click', toggle);
        chip.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    });

    /* ── Clear filters button (inside the empty state) ────────────────── */

    var clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (SEARCH_INPUT) { SEARCH_INPUT.value = ''; }
            if (CATEGORY_SEL) { CATEGORY_SEL.value = ''; }
            if (LOCATION_SEL) { LOCATION_SEL.value = ''; }
            if (SALARY_SEL)   { SALARY_SEL.value   = ''; }
            if (FILTER_SEL)   { FILTER_SEL.value   = ''; }
            tagChips.forEach(function (chip) {
                chip.classList.remove('active');
                chip.setAttribute('aria-pressed', 'false');
            });
            activeTags.length = 0;
            applyFilters();
        });
    }

    /* ── Search + filter listeners ────────────────────────────────────── */

    if (SEARCH_INPUT && JOB_LIST) {
        SEARCH_INPUT.addEventListener('input', debounce(applyFilters, SEARCH_DELAY));
    }
    if (CATEGORY_SEL) { CATEGORY_SEL.addEventListener('change', applyFilters); }
    if (LOCATION_SEL) { LOCATION_SEL.addEventListener('change', applyFilters); }
    if (SALARY_SEL)   { SALARY_SEL.addEventListener('change', applyFilters); }
    if (FILTER_SEL)   { FILTER_SEL.addEventListener('change', applyFilters); }

    /* ── Bootstrap ────────────────────────────────────────────────────── */

    if (JOB_LIST) {
        setHTML(JOB_LIST, skeletonSet(4));
        if (EMPTY_EL) { EMPTY_EL.hidden = true; }
        if (COUNT_EL) { COUNT_EL.textContent = '…'; }

        setTimeout(function () {
            applyFilters();
        }, SKELETON_MS);
    } else {
        renderFeatured();
    }

})();