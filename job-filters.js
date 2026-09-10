/* Shared job-board filtering: live search, category, recency and tag chips.
   Only runs on pages that expose the expected controls (dashboard, jobs). */
(function () {
    'use strict';

    var searchInput = document.getElementById('job-search');
    var categorySelect = document.getElementById('job-category');
    var filterSelect = document.getElementById('job-filter');
    var jobCount = document.getElementById('job-count');

    if (!searchInput || !filterSelect || !jobCount) {
        return;
    }

    var tagChips = Array.prototype.slice.call(document.querySelectorAll('.tag[data-tag]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.job_card'));
    var activeTags = [];

    // Make filter chips operable by keyboard as well as mouse
    tagChips.forEach(function (chip) {
        chip.setAttribute('role', 'button');
        chip.setAttribute('tabindex', '0');
        chip.setAttribute('aria-pressed', 'false');
    });

    function chipPressed(chip) {
        return chip.classList.contains('active');
    }

    function daysPosted(card) {
        var meta = card.querySelector('.job_salary span');
        var match = meta ? meta.textContent.match(/(\d+)\s*days?/i) : null;
        return match ? parseInt(match[1], 10) : 999;
    }

    function cardTags(card) {
        return (card.dataset.tags || '').split(',').map(function (tag) {
            return tag.trim();
        });
    }

    function toggleTag(tag) {
        var index = activeTags.indexOf(tag);
        if (index === -1) {
            activeTags.push(tag);
        } else {
            activeTags.splice(index, 1);
        }
    }

    function applyFilters() {
        var query = searchInput.value.trim().toLowerCase();
        var category = categorySelect ? categorySelect.value.toLowerCase() : '';
        var maxDays = filterSelect.value ? parseInt(filterSelect.value, 10) : null;

        var visible = 0;
        cards.forEach(function (card) {
            var text = (card.textContent || '').toLowerCase();
            var tags = cardTags(card);

            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesCategory = !category || category === 'category' || text.indexOf(category) !== -1;
            var matchesFilter = maxDays === null || daysPosted(card) <= maxDays;
            var matchesTags = activeTags.length === 0 || tags.some(function (tag) {
                return activeTags.indexOf(tag) !== -1;
            });

            var visibleCard = matchesQuery && matchesCategory && matchesFilter && matchesTags;
            card.style.display = visibleCard ? '' : 'none';
            if (visibleCard) {
                visible++;
            }
        });
        jobCount.textContent = visible;
    }

    tagChips.forEach(function (chip) {
        function toggle() {
            var tag = chip.dataset.tag;
            toggleTag(tag);
            chip.classList.toggle('active');
            chip.setAttribute('aria-pressed', String(chipPressed(chip)));
            applyFilters();
        }

        chip.addEventListener('click', toggle);
        chip.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });
    });

    searchInput.addEventListener('input', applyFilters);
    if (categorySelect) {
        categorySelect.addEventListener('change', applyFilters);
    }
    filterSelect.addEventListener('change', applyFilters);
    applyFilters();
})();