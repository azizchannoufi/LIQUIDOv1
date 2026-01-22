/**
 * Dashboard Statistics Handler
 * Loads real-time statistics from Firebase
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
    
    async function loadStatistics() {
        try {
            // Show loading state
            showLoadingState();
            
            const sections = await catalogService.getSections();
            
            // Count total products (lines)
            let totalProducts = 0;
            let totalBrands = 0;
            const uniqueBrands = new Set();
            
            for (const section of sections) {
                const brands = section.brands || [];
                totalBrands += brands.length;
                
                for (const brand of brands) {
                    uniqueBrands.add(brand.name);
                    totalProducts += (brand.lines || []).length;
                }
            }
            
            // Update UI with real data
            updateStatValue('stat-products-value', totalProducts);
            updateStatValue('stat-brands-value', uniqueBrands.size);
            updateStatValue('stat-sections-value', sections.length);
            
            // Update trends (for now, just show static info)
            const productsTrend = document.getElementById('stat-products-trend');
            const brandsTrend = document.getElementById('stat-brands-trend');
            if (productsTrend) productsTrend.textContent = 'Live';
            if (brandsTrend) brandsTrend.textContent = 'Live';
            
            // Load recent activity
            await loadRecentActivity(sections);
        } catch (error) {
            console.error('Error loading statistics:', error);
            showErrorState();
        }
    }
    
    function showLoadingState() {
        const productsValue = document.getElementById('stat-products-value');
        const brandsValue = document.getElementById('stat-brands-value');
        const sectionsValue = document.getElementById('stat-sections-value');
        
        if (productsValue) productsValue.textContent = '...';
        if (brandsValue) brandsValue.textContent = '...';
        if (sectionsValue) sectionsValue.textContent = '...';
    }
    
    function showErrorState() {
        const productsValue = document.getElementById('stat-products-value');
        const brandsValue = document.getElementById('stat-brands-value');
        const sectionsValue = document.getElementById('stat-sections-value');
        
        if (productsValue) productsValue.textContent = 'Error';
        if (brandsValue) brandsValue.textContent = 'Error';
        if (sectionsValue) sectionsValue.textContent = 'Error';
    }
    
    function updateStatValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }
    
    async function loadRecentActivity(sections) {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        // Get all brands with their sections
        const allBrands = [];
        for (const section of sections) {
            const brands = section.brands || [];
            for (const brand of brands) {
                allBrands.push({
                    name: brand.name,
                    section: section.name,
                    sectionId: section.id,
                    linesCount: (brand.lines || []).length,
                    logoUrl: brand.logo_url || ''
                });
            }
        }
        
        if (allBrands.length === 0) {
            activityContainer.innerHTML = `
                <div class="py-8 text-center">
                    <div class="inline-flex items-center justify-center size-16 rounded-full bg-slate-100 dark:bg-[#393928] mb-4">
                        <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-[#baba9c]">inventory_2</span>
                    </div>
                    <p class="text-sm text-slate-400 dark:text-[#baba9c] font-medium">Aucune activité récente</p>
                    <p class="text-xs text-slate-500 dark:text-slate-600 mt-2">Les activités apparaîtront ici lorsque vous gérerez votre catalogue</p>
                </div>
            `;
            return;
        }
        
        // Show last 5 brands (most recent)
        const recentBrands = allBrands.slice(-5).reverse();
        activityContainer.innerHTML = recentBrands.map(brand => `
            <div class="py-4 border-b border-slate-100 dark:border-[#393928] last:border-0 hover:bg-slate-50 dark:hover:bg-[#1a1a0f] transition-colors rounded-lg px-2 -mx-2">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="size-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            ${brand.logoUrl 
                                ? `<img src="${brand.logoUrl}" alt="${brand.name}" class="w-full h-full object-contain" onerror="this.parentElement.innerHTML='<span class=\\'material-symbols-outlined text-primary text-lg\\'>loyalty</span>'"/>`
                                : `<span class="material-symbols-outlined text-primary text-lg">loyalty</span>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white dark:text-white text-sm font-bold truncate">${brand.name}</p>
                            <p class="text-slate-400 dark:text-[#baba9c] text-xs truncate">${brand.section} • ${brand.linesCount} ${brand.linesCount === 1 ? 'ligne' : 'lignes'}</p>
                        </div>
                    </div>
                    <a href="brands/add.html?section=${encodeURIComponent(brand.sectionId)}&brand=${encodeURIComponent(brand.name)}" class="text-slate-400 dark:text-[#baba9c] hover:text-primary transition-colors flex-shrink-0 ml-2" title="Voir">
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>
        `).join('');
    }
    
    // Load statistics on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadStatistics);
    } else {
        loadStatistics();
    }
})();

