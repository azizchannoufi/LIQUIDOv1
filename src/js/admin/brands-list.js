/**
 * Admin Brands List Handler
 * Loads and displays brands dynamically from Firebase
 */

(async function () {
    'use strict';

    const brandsGrid = document.getElementById('admin-brands-grid');
    const brandsCount = document.getElementById('brands-count');
    const paginationDiv = document.getElementById('brands-pagination');
    const loadingDiv = document.getElementById('brands-loading');
    const searchInput = document.getElementById('brand-search-input');

    if (!brandsGrid) return;

    let catalogService;
    let allBrands = [];
    let filteredBrands = [];
    let currentView = 'grid';
    let currentTypeFilter = 'all'; // Track current type filter

    // Wait for catalog initialization
    try {
        // Wait for Firebase config to be available
        if (typeof window.firebaseConfig === 'undefined' || !window.firebaseConfig.initializeFirebase) {
            console.warn('Firebase config not loaded yet, waiting...');
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (typeof window.firebaseConfig !== 'undefined' && window.firebaseConfig.initializeFirebase) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        if (window.catalogInit) {
            const catalog = await window.catalogInit;
            catalogService = catalog.service;
        } else {
            // Create new instance if catalogInit is not available
            catalogService = new CatalogService();
            await catalogService.initFirebase();
        }
    } catch (error) {
        console.error('Error initializing catalog service:', error);
        if (loadingDiv) loadingDiv.classList.add('hidden');
        brandsGrid.innerHTML = '<p class="col-span-full text-center text-red-400 py-12">Erreur d\'initialisation: ' + error.message + '</p>';
        brandsGrid.classList.remove('hidden');
        return;
    }

    async function loadAllBrands() {
        try {
            console.log('🔄 Starting to load brands from Firebase...');

            // Show loading
            if (loadingDiv) loadingDiv.classList.remove('hidden');
            if (brandsGrid) brandsGrid.classList.add('hidden');

            // Get sections from Firebase
            const sections = await catalogService.getSections();
            console.log('📦 Sections loaded:', sections);

            if (!sections || sections.length === 0) {
                console.warn('⚠️ No sections found in Firebase');
                throw new Error('Aucune section trouvée dans Firebase. Veuillez initialiser la base de données.');
            }

            allBrands = [];

            // Collect brands with section info
            for (const section of sections) {
                console.log(`📂 Loading brands from section: ${section.name} (${section.id})`);
                const brands = await catalogService.getBrandsBySection(section.id);
                console.log(`  ✓ Found ${brands.length} brands in ${section.name}:`, brands);

                for (const brand of brands) {
                    // IMPORTANT: Check if brand with SAME NAME AND TYPE already exists
                    // This allows brands like Kiwi and Elfbar to appear twice (once as liquid, once as device)
                    const existing = allBrands.find(b => b.name === brand.name && b.type === brand.type);

                    if (existing) {
                        // Same brand with same type in multiple sections - add section info
                        if (!existing.sections) existing.sections = [];
                        existing.sections.push({ id: section.id, name: section.name });
                        console.log(`  ↪️ Brand "${brand.name}" (${brand.type}) already exists, added to section ${section.name}`);
                    } else {
                        // New brand OR same brand with different type - add as separate entry
                        allBrands.push({
                            ...brand,
                            sections: [{ id: section.id, name: section.name }],
                            sectionId: section.id // Primary section for editing
                        });
                        console.log(`  ➕ Added brand "${brand.name}" with type: ${brand.type}`);
                    }
                }
            }

            console.log(`✅ Total brands loaded: ${allBrands.length}`, allBrands);

            filteredBrands = allBrands;
            renderBrands(filteredBrands);
            updateCount(filteredBrands.length);

            // Hide loading, show grid
            if (loadingDiv) loadingDiv.classList.add('hidden');
            if (brandsGrid) brandsGrid.classList.remove('hidden');

            console.log('✨ Brands rendering complete');
        } catch (error) {
            console.error('❌ Error loading brands:', error);
            if (loadingDiv) loadingDiv.classList.add('hidden');

            let errorMessage = error.message;
            if (error.message.includes('not initialized')) {
                errorMessage = 'Firebase n\'est pas initialisé. Veuillez d\'abord initialiser Firebase avec init-firebase.html';
            } else if (error.message.includes('not found')) {
                errorMessage = 'Les données du catalogue n\'ont pas été trouvées. Veuillez initialiser Firebase avec init-firebase.html';
            }

            brandsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                        <span class="material-symbols-outlined text-red-400 text-4xl">error</span>
                    </div>
                    <h3 class="text-red-400 text-xl font-bold mb-2">Erreur de chargement</h3>
                    <p class="text-[#baba9c] mb-4">${errorMessage}</p>
                    <a href="../init-firebase.html" class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all">
                        <span class="material-symbols-outlined">refresh</span>
                        Initialiser Firebase
                    </a>
                </div>
            `;
            brandsGrid.classList.remove('hidden');
        }
    }

    function renderBrands(brands) {
        if (!brands || brands.length === 0) {
            brandsGrid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="inline-flex items-center justify-center size-20 rounded-full bg-surface-dark mb-6">
                        <span class="material-symbols-outlined text-4xl text-[#baba9c]">loyalty</span>
                    </div>
                    <p class="text-white text-xl font-bold mb-2">Aucune marque enregistrée</p>
                    <p class="text-[#baba9c] text-sm mb-6">Commencez par ajouter votre première marque</p>
                    <a href="add.html" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined">add</span>
                        Ajouter la première marque
                    </a>
                </div>
            `;
            return;
        }

        if (currentView === 'list') {
            brandsGrid.className = 'flex flex-col gap-4';
            brandsGrid.innerHTML = brands.map(brand => `
                <div class="group flex items-center gap-6 bg-surface-dark border border-border-dark rounded-xl p-6 hover:border-primary/40 transition-all">
                    <div class="w-20 h-20 rounded-lg bg-white flex items-center justify-center border border-white/10 flex-shrink-0 overflow-hidden">
                        ${brand.logo_url
                    ? `<img alt="${brand.name}" class="w-full h-full object-contain" src="${brand.logo_url}" onerror="this.parentElement.innerHTML='<span class=\\'text-white/40 text-xs\\'>No Logo</span>'"/>`
                    : `<span class="text-white/40 text-xs">No Logo</span>`
                }
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-white text-lg font-bold truncate">${brand.name}</h3>
                            ${brand.type ? `
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${brand.type === 'liquid'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }">
                                    <span class="material-symbols-outlined text-[12px]">${brand.type === 'liquid' ? 'water_drop' : 'devices'}</span>
                                    ${brand.type === 'liquid' ? 'Liquide' : 'Dispositif'}
                                </span>
                            ` : ''}
                        </div>
                        <p class="text-[#baba9c] text-sm mb-2">${brand.lines && brand.lines.length > 0 ? `${brand.lines.length} lignes de produits` : brand.products && brand.products.length > 0 ? `${brand.products.length} produits` : 'Aucune ligne'}</p>
                        ${brand.sections && brand.sections.length > 0 ? `
                            <div class="flex flex-wrap gap-2">
                                ${brand.sections.map(s => `<span class="px-2 py-0.5 rounded bg-border-dark text-[#baba9c] text-xs">${s.name}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                            <span class="size-1.5 rounded-full bg-emerald-400"></span>
                            Active
                        </span>
                        <div class="flex gap-2">
                            <a href="add.html?section=${encodeURIComponent(brand.sectionId || '')}&brand=${encodeURIComponent(brand.name)}" class="p-2 rounded-lg text-[#baba9c] hover:text-primary hover:bg-primary/10 transition-colors" title="Éditer">
                                <span class="material-symbols-outlined text-[20px]">edit</span>
                            </a>
                            <button class="delete-brand-btn p-2 rounded-lg text-[#baba9c] hover:text-red-400 hover:bg-red-500/10 transition-colors" data-brand="${brand.name}" title="Supprimer">
                                <span class="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            brandsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
            brandsGrid.innerHTML = brands.map(brand => `
                <div class="group relative flex flex-col bg-surface-dark border border-border-dark rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                    <div class="absolute top-4 right-4 z-10">
                        <div class="flex gap-2">
                            <a href="add.html?section=${encodeURIComponent(brand.sectionId || '')}&brand=${encodeURIComponent(brand.name)}" class="bg-background-dark/60 backdrop-blur-sm p-1.5 rounded-lg text-white hover:bg-primary hover:text-background-dark transition-colors" title="Éditer">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </a>
                            <button class="delete-brand-btn bg-background-dark/60 backdrop-blur-sm p-1.5 rounded-lg text-white hover:bg-red-500 hover:text-white transition-colors" data-brand="${brand.name}" title="Supprimer">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                    <div class="h-40 bg-gradient-to-br from-border-dark to-background-dark flex items-center justify-center p-8">
                        <div class="w-full h-full rounded-xl bg-white flex items-center justify-center border border-white/10 overflow-hidden">
                            ${brand.logo_url
                    ? `<img alt="${brand.name}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" src="${brand.logo_url}" onerror="this.parentElement.innerHTML='<span class=\\'text-white/40 text-sm\\'>No Logo</span>'"/>`
                    : `<span class="text-white/40 text-sm">No Logo</span>`
                }
                        </div>
                    </div>
                    <div class="p-5 space-y-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="text-white text-xl font-bold truncate">${brand.name}</h3>
                                ${brand.type ? `
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${brand.type === 'liquid'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }">
                                        <span class="material-symbols-outlined text-[10px]">${brand.type === 'liquid' ? 'water_drop' : 'devices'}</span>
                                        ${brand.type === 'liquid' ? 'L' : 'D'}
                                    </span>
                                ` : ''}
                            </div>
                            <p class="text-[#baba9c] text-sm font-medium mb-2">${brand.lines && brand.lines.length > 0 ? `${brand.lines.length} ${brand.lines.length === 1 ? 'ligne' : 'lignes'}` : brand.products && brand.products.length > 0 ? `${brand.products.length} produit${brand.products.length > 1 ? 's' : ''}` : 'Aucune ligne'}</p>
                            ${brand.sections && brand.sections.length > 0 ? `
                                <div class="flex flex-wrap gap-1.5 mt-2">
                                    ${brand.sections.slice(0, 2).map(s => `<span class="px-2 py-0.5 rounded bg-border-dark text-[#baba9c] text-[10px] font-medium">${s.name}</span>`).join('')}
                                    ${brand.sections.length > 2 ? `<span class="px-2 py-0.5 rounded bg-border-dark text-[#baba9c] text-[10px] font-medium">+${brand.sections.length - 2}</span>` : ''}
                                </div>
                            ` : ''}
                        </div>
                        <div class="flex items-center justify-between pt-2 border-t border-border-dark">
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                                <span class="size-1.5 rounded-full bg-emerald-400"></span>
                                Active
                            </span>
                            ${brand.website ? `
                                <a href="${brand.website.startsWith('http') ? brand.website : 'https://' + brand.website}" target="_blank" rel="noopener" class="text-[#baba9c] hover:text-primary transition-colors" title="Visiter le site">
                                    <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Add delete handlers
        brandsGrid.querySelectorAll('.delete-brand-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const brandName = e.currentTarget.dataset.brand;
                if (confirm(`Êtes-vous sûr de vouloir supprimer la marque "${brandName}" ?`)) {
                    try {
                        // Find brand sections
                        const sections = await catalogService.getSections();
                        for (const section of sections) {
                            const brand = section.brands?.find(b => b.name === brandName);
                            if (brand) {
                                await catalogService.deleteBrand(section.id, brandName);
                            }
                        }
                        await loadAllBrands();
                    } catch (error) {
                        console.error('Error deleting brand:', error);
                        alert('Erreur lors de la suppression: ' + error.message);
                    }
                }
            });
        });
    }

    function updateCount(count) {
        if (brandsCount) {
            brandsCount.textContent = count;
        }
        if (paginationDiv) {
            paginationDiv.classList.toggle('hidden', count === 0);
        }
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            applyFilters(query, currentTypeFilter);
        });
    }

    // Apply combined filters (search + type)
    function applyFilters(searchQuery = '', typeFilter = 'all') {
        let filtered = allBrands;

        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(brand => brand.type === typeFilter);
        }

        // Apply search filter
        if (searchQuery !== '') {
            filtered = filtered.filter(brand =>
                brand.name.toLowerCase().includes(searchQuery) ||
                (brand.sections && brand.sections.some(s => s.name.toLowerCase().includes(searchQuery))) ||
                (brand.website && brand.website.toLowerCase().includes(searchQuery)) ||
                (brand.type && brand.type.toLowerCase().includes(searchQuery))
            );
        }

        filteredBrands = filtered;
        renderBrands(filteredBrands);
        updateCount(filteredBrands.length);
    }

    // View switcher
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');

    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            currentView = 'grid';
            gridViewBtn.classList.add('bg-border-dark', 'text-white');
            gridViewBtn.classList.remove('text-[#baba9c]');
            listViewBtn.classList.remove('bg-border-dark', 'text-white');
            listViewBtn.classList.add('text-[#baba9c]');
            renderBrands(filteredBrands);
        });
    }

    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => {
            currentView = 'list';
            listViewBtn.classList.add('bg-border-dark', 'text-white');
            listViewBtn.classList.remove('text-[#baba9c]');
            gridViewBtn.classList.remove('bg-border-dark', 'text-white');
            gridViewBtn.classList.add('text-[#baba9c]');
            renderBrands(filteredBrands);
        });
    }

    // Type filter buttons
    const filterAllBtn = document.getElementById('filter-all-btn');
    const filterLiquidBtn = document.getElementById('filter-liquid-btn');
    const filterDeviceBtn = document.getElementById('filter-device-btn');

    function setActiveFilterButton(activeBtn) {
        [filterAllBtn, filterLiquidBtn, filterDeviceBtn].forEach(btn => {
            if (btn) {
                btn.classList.remove('bg-border-dark', 'text-white');
                btn.classList.add('text-[#baba9c]');
            }
        });
        if (activeBtn) {
            activeBtn.classList.add('bg-border-dark', 'text-white');
            activeBtn.classList.remove('text-[#baba9c]');
        }
    }

    if (filterAllBtn) {
        filterAllBtn.addEventListener('click', () => {
            currentTypeFilter = 'all';
            setActiveFilterButton(filterAllBtn);
            const searchQuery = searchInput?.value.toLowerCase().trim() || '';
            applyFilters(searchQuery, currentTypeFilter);
        });
    }

    if (filterLiquidBtn) {
        filterLiquidBtn.addEventListener('click', () => {
            currentTypeFilter = 'liquid';
            setActiveFilterButton(filterLiquidBtn);
            const searchQuery = searchInput?.value.toLowerCase().trim() || '';
            applyFilters(searchQuery, currentTypeFilter);
        });
    }

    if (filterDeviceBtn) {
        filterDeviceBtn.addEventListener('click', () => {
            currentTypeFilter = 'device';
            setActiveFilterButton(filterDeviceBtn);
            const searchQuery = searchInput?.value.toLowerCase().trim() || '';
            applyFilters(searchQuery, currentTypeFilter);
        });
    }

    // Load brands on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllBrands);
    } else {
        loadAllBrands();
    }
})();


