/* Shared portal layout: renders the sidebar navigation for every page
   from a single source of truth, and marks the current page's link as active. */
(function () {
    'use strict';

    var NAV_LINKS = [
        { href: 'dashboard.html', icon: 'fas fa-user', label: 'Dashboard' },
        { href: 'analytics.html', icon: 'fas fa-chart-bar', label: 'Analytics' },
        { href: 'jobs.html', icon: 'fas fa-tasks', label: 'Jobs Board' },
        { href: 'documents.html', icon: 'fas fa-file-alt', label: 'Documents' },
        { href: 'settings.html', icon: 'fas fa-cog', label: 'Settings' },
        { href: 'help.html', icon: 'fas fa-question-circle', label: 'Help' },
        { href: 'about.html', icon: 'fas fa-info-circle', label: 'About' }
    ];

    function currentPage() {
        var parts = window.location.pathname.split('/');
        var file = parts[parts.length - 1] || 'index.html';
        return file.toLowerCase();
    }

    /* Pages live under pages/ except index.html at the root. Arbitrate the
       prefix for page links (pages/ from root, none from pages/) and for
       asset/file links to the root (none from root, ../ from pages/). */
    function pageBase() {
        var parts = window.location.pathname.split('/');
        if (parts.length >= 2 && parts[parts.length - 2].toLowerCase() === 'pages') {
            return '';
        }
        return 'pages/';
    }

    function assetBase() {
        return pageBase() === '' ? '../' : '';
    }

    function render() {
        var nav = document.getElementById('app-nav');
        if (!nav) {
            return;
        }

        var page = currentPage();
        var pages = pageBase();
        var assets = assetBase();
        var items = NAV_LINKS.map(function (link) {
            var active = link.href === page;
            return (
                '<li><a href="' + pages + link.href + '"' + (active ? ' class="active"' : '') + '>' +
                    '<i class="' + link.icon + '"></i>' +
                    '<span class="nav-item">' + link.label + '</span>' +
                '</a></li>'
            );
        }).join('');

        nav.innerHTML =
            '<div class="navbar">' +
                '<div class="logo">' +
                    '<a href="' + assets + 'index.html"><img src="' + assets + 'pic/logo.jpg" alt="Job Portal logo"></a>' +
                    '<h1><a href="' + assets + 'index.html">jobs</a></h1>' +
                '</div>' +
                '<ul>' + items +
                    '<li><a href="' + pages + 'login.html" class="logout">' +
                        '<i class="fas fa-sign-out-alt"></i>' +
                        '<span class="nav-item">Logout</span>' +
                    '</a></li>' +
                '</ul>' +
            '</div>';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();