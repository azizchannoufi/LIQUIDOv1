/**
 * Admin Brands List Handler
 * Loads and displays brands dynamically from Firebase
 */

(async function() {
    'use strict';
    
    // Wait for catalog initialization
    let catalogService;
    try {
        if (window.catalogInit) {
            const catalog = await window.catalogInit;
            catalogService = catalog.service;
        } else {
            catalogService = new CatalogService();
        }
    } catch (error) {
        console.error('Error initializing catalog service:', error);
        catalogService = new CatalogService();
    }
    
    const brandsGrid = document.getElementById('admin-brands-grid');
    const brandsCount = document.getElementById('brands-count');
    const paginationDiv = document.getElementById('brands-pagination');
    
    if (!brandsGrid) return;
    
    async function loadAllBrands() {
        try {
            const allBrands = await catalogService.getAllBrands();
            renderBrands(allBrands);
            updateCount(allBrands.length);
        } catch (error) {
            console.error('Error loading brands:', error);
            brandsGrid.innerHTML = '<p class="col-span-full text-center text-red-400 py-12">Erreur lors du chargement des marques</p>';
        }
    }
    
    function renderBrands(brands) {
        if (!brands || brands.length === 0) {
            brandsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-white text-lg mb-4">Aucune marque enregistrée</p>
                    <a href="add.html" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-xl font-bold hover:scale-105 transition-all">
                        <span class="material-symbols-outlined">add</span>
                        Ajouter la première marque
                    </a>
                </div>
            `;
            return;
        }
        
        brandsGrid.innerHTML = brands.map(brand => `
            <div class="group relative flex flex-col bg-surface-dark border border-border-dark rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300">
                <div class="absolute top-4 right-4 z-10">
                    <button class="bg-background-dark/40 backdrop-blur-sm p-1.5 rounded-lg text-white hover:bg-primary hover:text-background-dark transition-colors">
                        <span class="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                </div>
                <div class="h-40 bg-gradient-to-br from-border-dark to-background-dark flex items-center justify-center p-8">
                    <div class="w-full h-full rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                        ${brand.logo_url 
                            ? `<img alt="${brand.name}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" src="${brand.logo_url}" onerror="this.parentElement.innerHTML='<span class=\\'text-white/40 text-sm\\'>No Logo</span>'"/>`
                            : `<span class="text-white/40 text-sm">No Logo</span>`
                        }
                    </div>
                </div>
                <div class="p-5 space-y-4">
                    <div>
                        <h3 class="text-white text-xl font-bold mb-1">${brand.name}</h3>
                        <p class="text-[#baba9c] text-sm font-medium">${brand.lines && brand.lines.length > 0 ? `${brand.lines.length} lignes` : 'Aucune ligne'}</p>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                            <span class="size-1.5 rounded-full bg-emerald-400"></span>
                            Active
                        </span>
                        <div class="flex gap-2">
                            <a href="add.html?brand=${encodeURIComponent(brand.name)}" class="text-[#baba9c] hover:text-primary transition-colors">
                                <span class="material-symbols-outlined text-[20px]">edit</span>
                            </a>
                            <button class="delete-brand-btn text-[#baba9c] hover:text-red-400 transition-colors" data-brand="${brand.name}">
                                <span class="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
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
    
    // Load brands on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllBrands);
    } else {
        loadAllBrands();
    }
})();

