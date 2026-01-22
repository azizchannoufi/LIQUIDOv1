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
            
            // Update UI
            updateStatCard('total-products', totalProducts);
            updateStatCard('active-brands', uniqueBrands.size);
            
            // Load recent activity
            await loadRecentActivity(sections);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    function updateStatCard(statId, value) {
        // Find stat card by looking for text content
        const cards = document.querySelectorAll('[class*="rounded-xl"]');
        cards.forEach(card => {
            const text = card.textContent || '';
            if (text.includes('Total Products') && statId === 'total-products') {
                const valueEl = card.querySelector('.text-3xl');
                if (valueEl) {
                    valueEl.textContent = value.toLocaleString();
                }
            } else if (text.includes('Active Brands') && statId === 'active-brands') {
                const valueEl = card.querySelector('.text-3xl');
                if (valueEl) {
                    valueEl.textContent = value.toLocaleString();
                }
            }
        });
    }
    
    async function loadRecentActivity(sections) {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        // Get recent brands (last 5)
        const allBrands = [];
        for (const section of sections) {
            const brands = section.brands || [];
            for (const brand of brands) {
                allBrands.push({
                    name: brand.name,
                    section: section.name,
                    linesCount: (brand.lines || []).length
                });
            }
        }
        
        if (allBrands.length === 0) {
            activityContainer.innerHTML = `
                <div class="py-8 text-center">
                    <p class="text-sm text-slate-400 dark:text-[#baba9c]">No recent activity</p>
                    <p class="text-xs text-slate-500 dark:text-slate-600 mt-2">Activity will appear here as you manage your catalog</p>
                </div>
            `;
            return;
        }
        
        // Show last 5 brands
        const recentBrands = allBrands.slice(-5).reverse();
        activityContainer.innerHTML = recentBrands.map(brand => `
            <div class="py-4 border-b border-slate-100 dark:border-[#393928] last:border-0">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary text-lg">loyalty</span>
                        </div>
                        <div>
                            <p class="text-white text-sm font-bold">${brand.name}</p>
                            <p class="text-slate-400 dark:text-[#baba9c] text-xs">${brand.section} • ${brand.linesCount} ${brand.linesCount === 1 ? 'ligne' : 'lignes'}</p>
                        </div>
                    </div>
                    <span class="text-slate-400 dark:text-[#baba9c] text-xs">Active</span>
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

