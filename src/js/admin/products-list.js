/**
 * Admin Products List Handler
 * Loads and displays products (lines) dynamically from Firebase with CRUD operations
 */

(async function() {
    'use strict';
    
    const tbody = document.querySelector('tbody');
    const searchInput = document.querySelector('input[placeholder*="Search products"]');
    const loadingDiv = document.getElementById('products-loading');
    const errorDiv = document.getElementById('products-error');
    const table = document.getElementById('products-table');
    
    if (!tbody) return;
    
    // Show loading state
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');
    if (table) table.classList.add('hidden');
    
    let catalogService;
    let allProducts = [];
    let filteredProducts = [];
    
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
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-400">Erreur d\'initialisation: ' + error.message + '</td></tr>';
        return;
    }
    
    async function loadAllProducts() {
        try {
            // Show loading
            if (loadingDiv) loadingDiv.classList.remove('hidden');
            if (errorDiv) errorDiv.classList.add('hidden');
            if (table) table.classList.add('hidden');
            
            const sections = await catalogService.getSections();
            allProducts = [];
            
            for (const section of sections) {
                const brands = await catalogService.getBrandsBySection(section.id);
                for (const brand of brands) {
                    const lines = brand.lines || [];
                    for (const line of lines) {
                        allProducts.push({
                            ...line,
                            sectionId: section.id,
                            sectionName: section.name,
                            brandName: brand.name || 'N/A'
                        });
                    }
                }
            }
            
            filteredProducts = allProducts;
            renderProducts(filteredProducts);
            
            // Hide loading, show table
            if (loadingDiv) loadingDiv.classList.add('hidden');
            if (table) table.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading products:', error);
            if (loadingDiv) loadingDiv.classList.add('hidden');
            if (table) table.classList.add('hidden');
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                errorDiv.innerHTML = `<div class="text-red-400">Erreur lors du chargement des produits: ${error.message}</div>`;
            }
        }
    }
    
    function renderProducts(products) {
        const paginationDiv = document.getElementById('products-pagination');
        const productsCount = document.getElementById('products-count');
        
        // Update count
        if (productsCount) {
            productsCount.textContent = products.length;
        }
        if (paginationDiv) {
            paginationDiv.classList.toggle('hidden', products.length === 0);
        }
        
        if (!products || products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center">
                        <p class="text-white text-lg mb-4">Aucun produit enregistré</p>
                        <a href="add.html" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-xl font-bold hover:scale-105 transition-all">
                            <span class="material-symbols-outlined">add</span>
                            Ajouter le premier produit
                        </a>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr class="hover:bg-white/5 transition-colors group">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-border-dark flex-shrink-0 bg-cover bg-center border border-border-dark/50" style="background-image: url('${product.image_url || ''}')">
                            ${!product.image_url ? '<span class="text-[#baba9c] text-xs">No img</span>' : ''}
                        </div>
                        <div>
                            <p class="text-white font-bold text-sm">${product.name}</p>
                            <p class="text-[#baba9c] text-xs">${product.brandName || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-white text-sm">${product.brandName || 'N/A'}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full bg-border-dark text-[#baba9c] text-[11px] font-bold uppercase tracking-wider">${product.sectionName || 'N/A'}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="size-2 rounded-full bg-primary animate-pulse"></div>
                        <span class="text-primary text-xs font-bold uppercase tracking-tighter">Active</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex justify-end gap-2">
                        <button class="edit-product-btn p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors" 
                                data-section="${product.sectionId}" 
                                data-brand="${product.brandName}" 
                                data-line="${product.name}">
                            <span class="material-symbols-outlined">edit_square</span>
                        </button>
                        <button class="delete-product-btn p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors" 
                                data-section="${product.sectionId}" 
                                data-brand="${product.brandName}" 
                                data-line="${product.name}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners
        tbody.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.section;
                const brandName = e.currentTarget.dataset.brand;
                const lineName = e.currentTarget.dataset.line;
                window.location.href = `add.html?section=${encodeURIComponent(sectionId)}&brand=${encodeURIComponent(brandName)}&line=${encodeURIComponent(lineName)}`;
            });
        });
        
        tbody.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const sectionId = e.currentTarget.dataset.section;
                const brandName = e.currentTarget.dataset.brand;
                const lineName = e.currentTarget.dataset.line;
                
                if (confirm(`Êtes-vous sûr de vouloir supprimer la ligne "${lineName}" de la marque "${brandName}" ?`)) {
                    try {
                        await catalogService.deleteProductLine(sectionId, brandName, lineName);
                        await loadAllProducts();
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        alert('Erreur lors de la suppression: ' + error.message);
                    }
                }
            });
        });
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(query) ||
                (product.brandName && product.brandName.toLowerCase().includes(query))
            );
            renderProducts(filteredProducts);
        });
    }
    
    // Load products on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllProducts);
    } else {
        loadAllProducts();
    }
})();

