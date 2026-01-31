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
                             <div class="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                ${initial}
                             </div>
                             <div class="overflow-hidden">
                                 <p class="font-bold text-gray-900 truncate">${userName}</p>
                                 <p class="text-xs text-gray-500 truncate text-ellipsis overflow-hidden w-full">${userEmail}</p>
                             </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Servizi MyLiquido</h4>
                            <a href="myliquido.html#special-request" onclick="window.closeUserMenu()" class="flex items-center gap-4 p-3 rounded-lg hover:bg-yellow-50 bg-white border border-gray-100 hover:border-yellow-200 transition-all group shadow-sm">
                                <div class="w-8 h-8 rounded bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                    <span class="material-symbols-outlined text-lg">inventory_2</span>
                                </div>
                                <span class="text-sm font-bold text-gray-700 group-hover:text-gray-900">Richiedi Prodotto</span>
                            </a>
                            <a href="myliquido.html#maintenance-service" onclick="window.closeUserMenu()" class="flex items-center gap-4 p-3 rounded-lg hover:bg-yellow-50 bg-white border border-gray-100 hover:border-yellow-200 transition-all group shadow-sm">
                                <div class="w-8 h-8 rounded bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
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
                    logoutBtn.addEventListener('click', async () => {
                        try {
                            if (window.firebaseAuthService) {
                                await window.firebaseAuthService.signOut();
                            } else {
                                // Fallback if service not loaded
                                localStorage.removeItem('liquido_user');
                            }
                            closeUserMenu();
                            window.location.reload();
                        } catch (e) {
                            console.error('Logout failed', e);
                        }
                    });
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
                            <a href="myliquido.html" class="block w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold uppercase text-xs tracking-[0.15em] py-4 rounded shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
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
