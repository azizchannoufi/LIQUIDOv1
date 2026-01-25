/**
 * Admin Brands List Handler
 * Loads and displays brands dynamically from Firebase
 */

(async function() {
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
            // Show loading
            if (loadingDiv) loadingDiv.classList.remove('hidden');
            if (brandsGrid) brandsGrid.classList.add('hidden');
            
            const sections = await catalogService.getSections();
            allBrands = [];
            
            // Collect brands with section info
            for (const section of sections) {
                const brands = await catalogService.getBrandsBySection(section.id);
                for (const brand of brands) {
                    // Check if brand already added (can exist in multiple sections)
                    const existing = allBrands.find(b => b.name === brand.name);
                    if (existing) {
                        // Add section to existing brand
                        if (!existing.sections) existing.sections = [];
                        existing.sections.push({ id: section.id, name: section.name });
                    } else {
                        allBrands.push({
                            ...brand,
                            sections: [{ id: section.id, name: section.name }],
                            sectionId: section.id // Primary section for editing
                        });
                    }
                }
            }
            
            filteredBrands = allBrands;
            renderBrands(filteredBrands);
            updateCount(filteredBrands.length);
            
            // Hide loading, show grid
            if (loadingDiv) loadingDiv.classList.add('hidden');
            if (brandsGrid) brandsGrid.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading brands:', error);
            if (loadingDiv) loadingDiv.classList.add('hidden');
            brandsGrid.innerHTML = '<p class="col-span-full text-center text-red-400 py-12">Erreur lors du chargement des marques: ' + error.message + '</p>';
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
                        <h3 class="text-white text-lg font-bold mb-1 truncate">${brand.name}</h3>
                        <p class="text-[#baba9c] text-sm mb-2">${brand.lines && brand.lines.length > 0 ? `${brand.lines.length} lignes de produits` : 'Aucune ligne'}</p>
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
                            <h3 class="text-white text-xl font-bold mb-1 truncate">${brand.name}</h3>
                            <p class="text-[#baba9c] text-sm font-medium mb-2">${brand.lines && brand.lines.length > 0 ? `${brand.lines.length} ${brand.lines.length === 1 ? 'ligne' : 'lignes'}` : 'Aucune ligne'}</p>
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
            if (query === '') {
                filteredBrands = allBrands;
            } else {
                filteredBrands = allBrands.filter(brand => 
                    brand.name.toLowerCase().includes(query) ||
                    (brand.sections && brand.sections.some(s => s.name.toLowerCase().includes(query))) ||
                    (brand.website && brand.website.toLowerCase().includes(query))
                );
            }
            renderBrands(filteredBrands);
            updateCount(filteredBrands.length);
        });
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
    
    // Load brands on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllBrands);
    } else {
        loadAllBrands();
    }
})();


