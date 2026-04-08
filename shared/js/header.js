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

    // Get top nav height dynamically
    function getTopNavHeight() {
        const topNav = document.querySelector('nav.fixed[class*="z-[70]"]');
        return topNav ? topNav.getBoundingClientRect().height : 0;
    }

    // Update placeholder height: topNav + header
    // On non-home pages, reduce the gap so content sits closer to the header.
    function isHomePage() {
        const path = window.location.pathname;
        return path === '/' ||
               path.endsWith('/index.html') ||
               path.endsWith('/public/index.html');
    }

    function updatePlaceholder() {
        if (placeholder) {
            const topNavH = getTopNavHeight();
            const headerH = header.getBoundingClientRect().height;
            const reduction = isHomePage() ? 0 : 40; // px removed on inner pages
            placeholder.style.height = (topNavH + headerH - reduction) + 'px';
            placeholder.className = '';
        }
    }

    updatePlaceholder();

    window.addEventListener('resize', updatePlaceholder);
    // Trigger once on init
    updatePlaceholder();

    // Gestion de la recherche (live dropdown)
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchDropdown = document.getElementById('search-results-dropdown');
    const searchList = document.getElementById('search-results-list');
    const searchFooter = document.getElementById('search-results-footer');
    const searchEmpty = document.getElementById('search-empty');
    const searchSeeAll = document.getElementById('search-see-all');
    const searchSpinner = document.getElementById('search-spinner');

    if (searchToggle && searchContainer && searchInput) {

        // Determine path to search.html relative to current page
        function getSearchUrl(q) {
            const path = window.location.pathname;
            const inPublic = path.includes('/public/');
            const prefix = inPublic ? '' : 'public/';
            return prefix + 'search.html?q=' + encodeURIComponent(q);
        }

        // ── Open / close ─────────────────────────────────────────────────────
        function openSearch() {
            searchContainer.classList.remove('hidden');
            searchInput.focus();
        }
        function closeSearch() {
            searchContainer.classList.add('hidden');
        }

        searchToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (searchContainer.classList.contains('hidden')) openSearch();
            else closeSearch();
        });

        document.addEventListener('click', function (e) {
            if (!searchContainer.contains(e.target) && e.target !== searchToggle) {
                closeSearch();
            }
        });

        searchContainer.addEventListener('click', function (e) { e.stopPropagation(); });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeSearch();
        });

        // ── Result helpers ────────────────────────────────────────────────────
        function typeLabel(type) {
            return { page: 'Pagina', brand: 'Brand', line: 'Linea', faq: 'FAQ' }[type] || type;
        }
        function typeDotClass(type) {
            return { page: 'bg-blue-400', brand: 'bg-yellow-400', line: 'bg-gray-400', faq: 'bg-green-400' }[type] || 'bg-gray-300';
        }

        function renderItem(item) {
            const hasImg = item.image && item.image.trim();
            const imgPart = hasImg
                ? `<img src="${item.image}" alt="${item.title}" class="w-8 h-8 object-contain rounded flex-shrink-0" onerror="this.style.display='none'">`
                : `<span class="material-symbols-outlined text-xl text-primary flex-shrink-0" style="font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24">${item.icon || 'search'}</span>`;

            return `<a href="${item.url}"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                onclick="document.getElementById('search-container').classList.add('hidden')">
                ${imgPart}
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-gray-900 truncate leading-tight">${item.title}</p>
                    <p class="text-xs text-gray-400 truncate">${item.description || ''}</p>
                </div>
                <span class="flex-shrink-0 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full ${typeDotClass(item.type)}"></span>
                    <span class="text-[10px] text-gray-400 font-medium uppercase tracking-wide">${typeLabel(item.type)}</span>
                </span>
            </a>`;
        }

        // ── Debounced live search ─────────────────────────────────────────────
        let debounceTimer;

        async function runLiveSearch(query) {
            if (!query || query.trim().length < 2) {
                if (searchDropdown) searchDropdown.classList.add('hidden');
                return;
            }

            if (searchSpinner) searchSpinner.classList.remove('hidden');
            if (searchDropdown) searchDropdown.classList.remove('hidden');
            if (searchList) searchList.innerHTML = '';
            if (searchEmpty) searchEmpty.classList.add('hidden');
            if (searchFooter) searchFooter.classList.add('hidden');

            // Wait for search service to load (it's loaded lazily)
            let attempts = 0;
            while (!window.liquidoSearchService && attempts++ < 30) {
                await new Promise(r => setTimeout(r, 150));
            }

            let results = [];
            if (window.liquidoSearchService) {
                try {
                    results = await window.liquidoSearchService.search(query.trim(), 6);
                } catch (e) { console.warn('Live search error', e); }
            }

            if (searchSpinner) searchSpinner.classList.add('hidden');

            if (results.length === 0) {
                if (searchList) searchList.innerHTML = '';
                if (searchEmpty) searchEmpty.classList.remove('hidden');
                if (searchFooter) searchFooter.classList.add('hidden');
            } else {
                if (searchEmpty) searchEmpty.classList.add('hidden');
                if (searchList) searchList.innerHTML = results.map(renderItem).join('');
                if (searchSeeAll) searchSeeAll.href = getSearchUrl(query.trim());
                if (searchFooter) searchFooter.classList.remove('hidden');
            }
        }

        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            const val = searchInput.value;
            if (!val.trim()) {
                if (searchDropdown) searchDropdown.classList.add('hidden');
                return;
            }
            debounceTimer = setTimeout(() => runLiveSearch(val), 300);
        });

        // ── Submit → full search page ─────────────────────────────────────────
        if (searchForm) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const q = searchInput.value.trim();
                if (q) window.location.href = getSearchUrl(q);
            });
        }
    }
    // --- Active Link Highlighting ---
    function highlightActiveLink() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = header.querySelectorAll('nav a');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPath) {
                link.classList.add('text-primary');
                link.classList.remove('text-gray-800');
            } else {
                link.classList.remove('text-primary');
                link.classList.add('text-gray-800');
            }
        });
    }

    highlightActiveLink();

    // --- User Menu Logic ---
    const menuBtn = document.getElementById('hamburger-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const menuOverlay = document.getElementById('user-menu-overlay');
    const userMenu = document.getElementById('user-menu');
    const menuContent = document.getElementById('user-menu-content');

    // Make closeMenu available globally for inline onclick handlers if needed, 
    // or just use it internally.
    function closeUserMenu() {
        if (userMenu && menuOverlay) {
            userMenu.classList.add('translate-x-full');
            menuOverlay.classList.add('opacity-0');
            setTimeout(() => menuOverlay.classList.add('hidden'), 300);
        }
    }
    // Expose to window for inline calls
    window.closeUserMenu = closeUserMenu;

    if (menuBtn && userMenu && menuOverlay && closeMenuBtn) {
        function openMenu() {
            userMenu.classList.remove('translate-x-full');
            menuOverlay.classList.remove('hidden');
            // small delay to allow display:block to apply before opacity transition
            setTimeout(() => menuOverlay.classList.remove('opacity-0'), 10);
        }

        menuBtn.addEventListener('click', openMenu);
        closeMenuBtn.addEventListener('click', closeUserMenu);
        menuOverlay.addEventListener('click', closeUserMenu);

        async function handleLogoutClick() {
            try {
                if (window.firebaseAuthService) {
                    await window.firebaseAuthService.signOut();
                } else {
                    localStorage.removeItem('liquido_user');
                }
                closeUserMenu();
                window.location.reload();
            } catch (e) {
                console.error('Logout failed', e);
            }
        }

        // Update menu based on Auth State
        function updateUserMenu(user) {
            if (user) {
                // Logged In
                const userName = user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'Utente');
                const userEmail = user.email || '';
                const initial = userName.charAt(0).toUpperCase();

                menuContent.innerHTML = `
                    <div class="flex flex-col gap-6">
                        <div class="flex items-center gap-3 pb-6 border-b border-gray-100">
                             <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xl shadow-md">
                                ${initial}
                             </div>
                             <div class="overflow-hidden">
                                 <p class="font-bold text-gray-900 truncate">${userName}</p>
                                 <p class="text-xs text-gray-500 truncate text-ellipsis overflow-hidden w-full">${userEmail}</p>
                             </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Servizi MyLiquido</h4>
                            <a href="myliquido.html#special-request" onclick="window.closeUserMenu()" class="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 bg-white border border-gray-100 hover:border-primary/30 transition-all group shadow-sm">
                                <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                    <span class="material-symbols-outlined text-lg">inventory_2</span>
                                </div>
                                <span class="text-sm font-bold text-gray-700 group-hover:text-gray-900">Richiedi Prodotto</span>
                            </a>
                            <a href="myliquido.html#maintenance-service" onclick="window.closeUserMenu()" class="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 bg-white border border-gray-100 hover:border-primary/30 transition-all group shadow-sm">
                                <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                    <span class="material-symbols-outlined text-lg">build</span>
                                </div>
                                <span class="text-sm font-bold text-gray-700 group-hover:text-gray-900">Manutenzione</span>
                            </a>
                        </div>

                        <div class="mt-auto pt-6 border-t border-gray-100">
                            <button id="menu-logout-btn" class="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all text-sm font-bold uppercase tracking-widest w-full justify-center p-4 rounded-lg border border-transparent hover:border-red-100">
                                <span class="material-symbols-outlined">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                 `;

                // Attach logout listener
                const logoutBtn = document.getElementById('menu-logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', handleLogoutClick);
                }
            } else {
                // Not Logged In
                menuContent.innerHTML = `
                    <div class="flex flex-col h-full justify-center items-center text-center space-y-8">
                        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2 border-2 border-gray-100">
                             <span class="material-symbols-outlined text-4xl">person</span>
                        </div>
                        <div>
                             <h4 class="font-bold text-xl mb-3 text-gray-800">Benvenuto</h4>
                             <p class="text-gray-500 text-sm px-6 leading-relaxed">Accedi al tuo account per gestire i tuoi ordini e richiedere servizi esclusivi MyLiquido.</p>
                        </div>
                        <div class="w-full space-y-4 pt-4 px-2">
                            <a href="myliquido.html" class="block w-full bg-primary hover:bg-primary/80 text-gray-900 font-extrabold uppercase text-xs tracking-[0.15em] py-4 rounded shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                                Accedi / Registrati
                            </a>
                        </div>
                    </div>
                 `;
            }
        }

        // Initialize Auth Check
        function checkAuth() {
            // Check localStorage first for immediate UI update
            const cachedUser = localStorage.getItem('liquido_user');
            if (cachedUser) {
                try {
                    updateUserMenu(JSON.parse(cachedUser));
                } catch (e) {
                    console.error('Error parsing cached user', e);
                    updateUserMenu(null);
                }
            } else {
                updateUserMenu(null);
            }

            // Wait for service
            if (window.firebaseAuthService) {
                window.firebaseAuthService.onAuthStateChanged((user) => {
                    // Prefer cached user with more details if available and matching UID
                    const localUserStr = localStorage.getItem('liquido_user');
                    if (localUserStr) {
                        try {
                            const localUser = JSON.parse(localUserStr);
                            if (user && localUser.uid === user.uid) {
                                updateUserMenu(localUser);
                                return;
                            }
                        } catch (e) { }
                    }

                    if (user) {
                        updateUserMenu(user);
                    } else {
                        updateUserMenu(null);
                    }
                });
            } else {
                // Poll for service if not yet available
                let attempts = 0;
                const checkService = setInterval(() => {
                    attempts++;
                    if (window.firebaseAuthService) {
                        clearInterval(checkService);
                        window.firebaseAuthService.onAuthStateChanged((user) => {
                            const localUserStr = localStorage.getItem('liquido_user');
                            if (localUserStr) {
                                try {
                                    const localUser = JSON.parse(localUserStr);
                                    if (user && localUser.uid === user.uid) {
                                        updateUserMenu(localUser);
                                        return;
                                    }
                                } catch (e) { }
                            }
                            updateUserMenu(user || null);
                        });
                    }
                    if (attempts > 20) clearInterval(checkService); // Stop after 10s
                }, 500);
            }
        }

        checkAuth();
    }
}

// Initialize when script is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderLogic);
} else {
    initHeaderLogic();
}
