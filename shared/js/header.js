/**
 * Header functionality - Sticky behavior and Search toggle
 * Separated from HTML to work with component loader
 */
function initHeaderLogic() {
    const header = document.getElementById('main-header');
    const placeholder = document.getElementById('header-placeholder');

    // Retry initialization if header isn't found yet (in case of async loading delays)
    if (!header) {
        setTimeout(initHeaderLogic, 100);
        return;
    }

    // Set initial placeholder height to match header height (h-28 = 7rem = 112px)
    if (placeholder) {
        placeholder.className = 'h-28';
    }

    // Scroll logic
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 0) {
            // Scrolled down: Move header to top (0px) by negating the top-10 (40px)
            header.classList.remove('translate-y-0');
            header.classList.add('-translate-y-10');
        } else {
            // At top: Restore header to original position (40px)
            header.classList.remove('-translate-y-10');
            header.classList.add('translate-y-0');
        }

        // Placeholder size remains constant as header height (content-wise) doesn't change
        // We ensure it stays h-28
        if (placeholder && !placeholder.classList.contains('h-28')) {
            placeholder.className = 'h-28';
        }
    }

    window.addEventListener('scroll', handleScroll);
    // Trigger once on init
    handleScroll();

    // Gestion de la recherche
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');

    if (searchToggle && searchContainer && searchInput) {
        // Fonction pour afficher/masquer la recherche
        function toggleSearch() {
            if (searchContainer.classList.contains('hidden')) {
                searchContainer.classList.remove('hidden');
                searchInput.focus();
            } else {
                searchContainer.classList.add('hidden');
            }
        }

        // Écouter le clic sur l'icône de recherche
        searchToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSearch();
        });

        // Fermer la recherche quand on clique ailleurs
        document.addEventListener('click', function (e) {
            if (!searchContainer.contains(e.target) && e.target !== searchToggle) {
                searchContainer.classList.add('hidden');
            }
        });

        // Empêcher la fermeture quand on clique dans le champ de recherche
        searchContainer.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        // Fermer avec la touche Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                searchContainer.classList.add('hidden');
            }
        });

        // Gérer la soumission du formulaire
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    // Rediriger vers la page de recherche
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            });
        }
    }
}

// Initialize when script is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderLogic);
} else {
    initHeaderLogic();
}
