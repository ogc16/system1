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
        { href: 'help.html', icon: 'fas fa-question-circle', label: 'Help' }
    ];

    function currentPage() {
        var parts = window.location.pathname.split('/');
        var file = parts[parts.length - 1] || 'index.html';
        return file.toLowerCase();
    }

    function render() {
        var nav = document.getElementById('app-nav');
        if (!nav) {
            return;
        }

        var page = currentPage();
        var items = NAV_LINKS.map(function (link) {
            var active = link.href === page;
            return (
                '<li><a href="' + link.href + '"' + (active ? ' class="active"' : '') + '>' +
                    '<i class="' + link.icon + '"></i>' +
                    '<span class="nav-item">' + link.label + '</span>' +
                '</a></li>'
            );
        }).join('');

        nav.innerHTML =
            '<div class="navbar">' +
                '<div class="logo">' +
                    '<a href="index.html"><img src="pic/logo.jpg" alt="Job Portal logo"></a>' +
                    '<h1><a href="index.html">jobs</a></h1>' +
                '</div>' +
                '<ul>' + items +
                    '<li><a href="login.html" class="logout">' +
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