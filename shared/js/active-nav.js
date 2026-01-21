/**
 * LIQUIDO Active Navigation Highlighter
 * Automatically highlights the active navigation item based on current page
 */

/**
 * Set active state on navigation links
 * @param {string} navSelector - CSS selector for navigation container
 * @param {string} activeClass - Class to add to active link
 */
function setActiveNav(navSelector = 'nav', activeClass = 'text-primary') {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll(`${navSelector} a`);

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Remove active class from all links first
        link.classList.remove(activeClass);

        // Add active class if href matches current page
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add(activeClass);

            // Add underline indicator for some navigation styles
            if (!link.querySelector('.active-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'active-indicator absolute -bottom-2 left-0 w-full h-0.5 bg-primary';
                link.style.position = 'relative';
                link.appendChild(indicator);
            }
        }
    });
}

/**
 * Set active state on admin sidebar navigation
 */
function setActiveSidebarNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const sidebarLinks = document.querySelectorAll('aside nav a');

    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Remove active class
        link.classList.remove('sidebar-active', 'text-primary');
        link.classList.add('text-slate-600', 'dark:text-[#baba9c]');

        // Add active class if href matches
        if (href === currentPage || href === `#${currentPage}`) {
            link.classList.remove('text-slate-600', 'dark:text-[#baba9c]');
            link.classList.add('sidebar-active', 'text-primary');
        }
    });
}

// Auto-execute on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setActiveNav();
        setActiveSidebarNav();
    });
} else {
    setActiveNav();
    setActiveSidebarNav();
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setActiveNav, setActiveSidebarNav };
}
