/* ── Dashboard control center.
   Renders the personalized greeting, summary stats, notifications,
   the application pipeline (Applied → Shortlisted → Interview → Offer)
   and CSV export – all from the shared JOBS data in jobs.js. */

(function () {
    'use strict';

    /* ── Personalization ─────────────────────────────────────────────── */

    function getUser() {
        try {
            var u = JSON.parse(window.localStorage.getItem('portal.user') || 'null');
            return u && u.name ? u : null;
        } catch (e) { return null; }
    }

    var user = getUser();
    var nameEl = document.getElementById('user-name');
    if (nameEl) { nameEl.textContent = user ? user.name : 'Alex'; }

    /* ── Application history (demo data, keyed by JOBS index) ─────────── */

    var APP_HISTORY = [
        { jobIndex: 4, stage: 3, appliedDays: 9 },   // React.js Expert  – Offer
        { jobIndex: 0, stage: 2, appliedDays: 6 },   // UX Designer      – Interview
        { jobIndex: 7, stage: 1, appliedDays: 4 },   // UI Designer      – Shortlisted
        { jobIndex: 1, stage: 0, appliedDays: 2 },   // JavaScript Dev   – Applied
        { jobIndex: 8, stage: 0, appliedDays: 1 }    // Backend Engineer – Applied
    ];

    var SAVED_JOBS = [3, 10, 16];                    // GitHub, Apple, Spotify

    var STAGES = [
        { label: 'Applied',     badge: 'badge-gray',   segIdx: 1 },
        { label: 'Shortlisted', badge: 'badge-blue',   segIdx: 2 },
        { label: 'Interview',   badge: 'badge-purple', segIdx: 3 },
        { label: 'Offer',       badge: 'badge-green',  segIdx: 4 }
    ];

    /* ── Summary stats ───────────────────────────────────────────────── */

    function updateStats() {
        var applied = APP_HISTORY.length;
        var interviews = APP_HISTORY.filter(function (a) { return a.stage >= 2; }).length;
        var offers = APP_HISTORY.filter(function (a) { return a.stage === 3; }).length;

        setText('stat-applied', applied);
        setText('stat-interviews', interviews);
        setText('stat-saved', SAVED_JOBS.length);
        setText('stat-offers', offers);
    }

    function setText(id, val) {
        var el = document.getElementById(id);
        if (el) { el.textContent = String(val); }
    }

    /* ── Applications pipeline ───────────────────────────────────────── */

    function dateText(days) {
        return days + (days === 1 ? ' day ago' : ' days ago');
    }

    function renderPipeline() {
        var list = document.getElementById('pipeline-list');
        if (!list || typeof JOBS === 'undefined') { return; }

        list.innerHTML = APP_HISTORY.map(function (app) {
            var job = JOBS[app.jobIndex];
            var stage = STAGES[app.stage];
            var segs = '';
            for (var i = 1; i <= 4; i++) {
                segs += '<span class="seg' + (i <= stage.segIdx ? ' filled' : '') + '"></span>';
            }
            return (
                '<div class="pipe-item">' +
                    '<div class="pipe-job">' +
                        '<div class="img"><i class="' + job.icon + '" aria-hidden="true"></i></div>' +
                        '<div class="pipe-text">' +
                            '<h4>' + job.title + '</h4>' +
                            '<span>' + job.company + ' \u00b7 Applied ' + dateText(app.appliedDays) + '</span>' +
                        '</div>' +
                        '<span class="badge ' + stage.badge + '">' + stage.label + '</span>' +
                    '</div>' +
                    '<div class="stage-track" role="progressbar" aria-valuemin="1" aria-valuemax="4" ' +
                         'aria-valuenow="' + stage.segIdx + '" ' +
                         'aria-label="' + job.title + ' application stage: step ' + stage.segIdx + ' of 4">' +
                        segs +
                    '</div>' +
                '</div>'
            );
        }).join('');
    }

    /* ── Notifications ───────────────────────────────────────────────── */

    var NOTIFS = [
        { icon: 'fa-bell',          text: '<a href="jobs.html">React.js Expert</a> matches your JavaScript profile.',          time: '2 hours ago', unread: true  },
        { icon: 'fa-check-circle',  text: 'Google Drive moved your <strong>UX Designer</strong> application to <strong>Interview</strong>.', time: 'Yesterday',   unread: true  },
        { icon: 'fa-bolt',          text: '20 new jobs posted today in Design.',                                                  time: 'Yesterday',   unread: true  },
        { icon: 'fa-trophy',        text: 'YouTube sent you an offer for <strong>React.js Expert</strong>.',                     time: '3 days ago',  unread: false },
        { icon: 'fa-file-alt',      text: 'Your CV was viewed by Figma.',                                                        time: '4 days ago',  unread: false }
    ];

    function renderNotifications() {
        var ul = document.getElementById('notif-list');
        if (!ul) { return; }

        ul.innerHTML = NOTIFS.map(function (n) {
            return (
                '<li class="notif-item' + (n.unread ? ' unread' : '') + '">' +
                    '<i class="fas ' + n.icon + '" aria-hidden="true"></i>' +
                    '<div class="notif-body">' +
                        '<p>' + n.text + '</p>' +
                        '<time>' + n.time + '</time>' +
                    '</div>' +
                '</li>'
            );
        }).join('');

        var count = NOTIFS.filter(function (n) { return n.unread; }).length;
        var badge = document.getElementById('notif-count');
        if (badge) {
            badge.textContent = String(count);
            badge.hidden = count === 0;
        }
    }

    function markAllRead() {
        var items = Array.prototype.slice.call(document.querySelectorAll('.notif-item.unread'));
        items.forEach(function (el) { el.classList.remove('unread'); });
        NOTIFS.forEach(function (n) { n.unread = false; });
        var badge = document.getElementById('notif-count');
        if (badge) { badge.hidden = true; }
    }

    var markReadBtn = document.getElementById('mark-read');
    if (markReadBtn) { markReadBtn.addEventListener('click', markAllRead); }

    /* ── CSV export of application history ───────────────────────────── */

    function exportCSV() {
        if (typeof JOBS === 'undefined') { return; }

        var rows = [['Job', 'Company', 'Salary range', 'Location', 'Applied', 'Stage']];
        APP_HISTORY.forEach(function (app) {
            var job = JOBS[app.jobIndex];
            rows.push([
                job.title,
                job.company,
                '$' + job.salaryMin + 'k\u2013$' + job.salaryMax + 'k/yr',
                job.location,
                dateText(app.appliedDays),
                STAGES[app.stage].label
            ]);
        });

        var csv = rows.map(function (r) {
            return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
        }).join('\r\n');

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'my-applications.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        var btn = document.getElementById('export-csv');
        if (btn) {
            var original = btn.textContent;
            btn.textContent = 'Downloaded! Check your downloads';
            setTimeout(function () { btn.textContent = original; }, 2500);
        }
    }

    var exportBtn = document.getElementById('export-csv');
    if (exportBtn) { exportBtn.addEventListener('click', exportCSV); }

    /* ── Quick actions (scroll to sections) ──────────────────────────── */

    function scrollTo(sel) {
        return function () {
            var el = document.querySelector(sel);
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        };
    }

    var goPipeline = document.getElementById('go-pipeline');
    if (goPipeline) { goPipeline.addEventListener('click', scrollTo('#pipeline')); }
    var goRecs = document.getElementById('go-recommendations');
    if (goRecs) { goRecs.addEventListener('click', scrollTo('#recommendations')); }

    /* ── Bootstrap ───────────────────────────────────────────────────── */

    updateStats();
    renderPipeline();
    renderNotifications();
})();