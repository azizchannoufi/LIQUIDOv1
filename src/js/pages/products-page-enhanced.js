/**
 * Enhanced Products Page Script
 * Handles dynamic loading, filtering, and searching of products
 */

(function() {
    'use strict';
    
    // Wait for DOM and catalog initialization
    async function init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        // Wait for catalog initialization
        if (!window.catalogInit) {
            await new Promise(resolve => {
                const checkCatalog = setInterval(() => {
                    if (window.catalogInit) {
                        clearInterval(checkCatalog);
                        resolve();
                    }
                }, 100);
            });
        }
        
        const catalog = await window.catalogInit;
        const { service, productsRenderer } = catalog;
        
        runApp(service, productsRenderer);
    }
    
    async function runApp(service, productsRenderer) {
    
    // State management
    let currentSection = 'cat_liquidi';
    let selectedBrands = new Set();
    let searchQuery = '';
    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 12;
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    const brandParam = urlParams.get('brand');
    const searchParam = urlParams.get('search');
    
    if (sectionParam) {
        currentSection = sectionParam;
    }
    if (brandParam) {
        selectedBrands.add(brandParam);
    }
    if (searchParam) {
        searchQuery = searchParam;
    }
    
    // Get DOM elements
    const productsGrid = document.getElementById('products-grid');
    const productsCount = document.getElementById('products-count');
    const noResults = document.getElementById('no-results');
    const brandFiltersContainer = document.getElementById('brand-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const headerSearch = document.getElementById('header-search');
    const sectionTabs = document.querySelectorAll('.section-tab');
    const paginationContainer = document.getElementById('pagination-container');
    
    // Initialize page
    await initPage();
    
    async function initPage() {
        // Load products for current section
        await loadProducts(currentSection);
        
        // Setup section tabs
        setupSectionTabs();
        
        // Setup brand filters
        await setupBrandFilters();
        
        // Setup search
        setupSearch();
        
        // Setup reset filters
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', resetFilters);
        }
        
        // Update active section tab
        updateActiveTab();
        
        // Apply initial filters
        applyFilters();
    }
    
    async function loadProducts(sectionId) {
        try {
            console.log('Loading products for section:', sectionId);
            allProducts = await service.getAllLinesBySection(sectionId);
            console.log('Products loaded:', allProducts.length);
            filteredProducts = [...allProducts];
            currentPage = 1;
            renderProducts();
            updateProductsCount();
            renderPagination();
        } catch (error) {
            console.error('Error loading products:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="text-red-400 col-span-full text-center py-12">Erreur lors du chargement des produits depuis Firebase</p>';
            }
        }
    }
    
    function renderProducts() {
        if (!productsGrid) return;
        
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '';
            if (noResults) {
                noResults.classList.remove('hidden');
            }
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
            return;
        }
        
        if (noResults) {
            noResults.classList.add('hidden');
        }
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        productsRenderer.renderProductLinesGrid(paginatedProducts, productsGrid);
        renderPagination();
    }
    
    function updateProductsCount() {
        if (productsCount) {
            productsCount.textContent = filteredProducts.length;
        }
    }
    
    function setupSectionTabs() {
        sectionTabs.forEach(tab => {
            tab.addEventListener('click', async (e) => {
                e.preventDefault();
                const sectionId = e.currentTarget.dataset.sectionTab;
                currentSection = sectionId;
                
                // Update active tab
                updateActiveTab();
                
                // Load products for new section
                await loadProducts(sectionId);
                
                // Update brand filters
                await setupBrandFilters();
                
                // Reset brand selection
                selectedBrands.clear();
                updateBrandFiltersUI();
                
                // Apply filters
                applyFilters();
                
                // Update URL
                updateURL();
            });
        });
    }
    
    function updateActiveTab() {
        sectionTabs.forEach(tab => {
            const sectionId = tab.dataset.sectionTab;
            if (sectionId === currentSection) {
                tab.classList.add('border-primary', 'text-primary');
                tab.classList.remove('border-transparent', 'text-zinc-500');
            } else {
                tab.classList.remove('border-primary', 'text-primary');
                tab.classList.add('border-transparent', 'text-zinc-500');
            }
        });
    }
    
    async function setupBrandFilters() {
        if (!brandFiltersContainer) return;
        
        try {
            const brands = await service.getBrandsBySection(currentSection);
            const brandsWithProducts = brands.filter(brand => brand.lines && brand.lines.length > 0);
            
            brandFiltersContainer.innerHTML = '';
            
            if (brandsWithProducts.length === 0) {
                brandFiltersContainer.innerHTML = '<p class="text-zinc-500 text-sm">Nessuna marca disponibile</p>';
                return;
            }
            
            brandsWithProducts.forEach(brand => {
                const label = document.createElement('label');
                label.className = 'flex items-center gap-3 cursor-pointer group';
                label.innerHTML = `
                    <input type="checkbox" 
                           class="brand-filter-checkbox rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary" 
                           value="${brand.name}"
                           ${selectedBrands.has(brand.name) ? 'checked' : ''}/>
                    <span class="text-sm font-medium group-hover:text-primary transition-colors">${brand.name}</span>
                `;
                
                const checkbox = label.querySelector('.brand-filter-checkbox');
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        selectedBrands.add(brand.name);
                    } else {
                        selectedBrands.delete(brand.name);
                    }
                    applyFilters();
                });
                
                brandFiltersContainer.appendChild(label);
            });
        } catch (error) {
            console.error('Error setting up brand filters:', error);
        }
    }
    
    function updateBrandFiltersUI() {
        const checkboxes = brandFiltersContainer.querySelectorAll('.brand-filter-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectedBrands.has(checkbox.value);
        });
    }
    
    function setupSearch() {
        // Header search
        if (headerSearch) {
            let searchTimeout;
            headerSearch.value = searchQuery;
            
            headerSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchQuery = e.target.value.trim().toLowerCase();
                
                searchTimeout = setTimeout(() => {
                    applyFilters();
                    updateURL();
                }, 300);
            });
        }
    }
    
    function applyFilters() {
        filteredProducts = allProducts.filter(product => {
            // Brand filter
            if (selectedBrands.size > 0 && !selectedBrands.has(product.brandName)) {
                return false;
            }
            
            // Search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(searchLower);
                const matchesBrand = product.brandName.toLowerCase().includes(searchLower);
                if (!matchesName && !matchesBrand) {
                    return false;
                }
            }
            
            return true;
        });
        
        currentPage = 1;
        renderProducts();
        updateProductsCount();
    }
    
    function renderPagination() {
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${currentPage === 1 ? 'disabled' : ''} 
                    class="pagination-prev size-10 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    data-page="${currentPage - 1}">
                <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            paginationHTML += `
                <button class="pagination-page size-10 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-primary transition-colors font-bold" data-page="1">1</button>
            `;
            if (startPage > 2) {
                paginationHTML += `<div class="px-2 text-zinc-600">...</div>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-page size-10 flex items-center justify-center rounded-lg ${i === currentPage ? 'bg-primary text-black' : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-primary'} transition-colors font-bold" 
                        data-page="${i}">${i}</button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<div class="px-2 text-zinc-600">...</div>`;
            }
            paginationHTML += `
                <button class="pagination-page size-10 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-primary transition-colors font-bold" 
                        data-page="${totalPages}">${totalPages}</button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button ${currentPage === totalPages ? 'disabled' : ''} 
                    class="pagination-next size-10 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    data-page="${currentPage + 1}">
                <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Attach event listeners
        paginationContainer.querySelectorAll('.pagination-page, .pagination-prev, .pagination-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                    currentPage = page;
                    renderProducts();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }
    
    function resetFilters() {
        selectedBrands.clear();
        searchQuery = '';
        
        if (headerSearch) {
            headerSearch.value = '';
        }
        
        updateBrandFiltersUI();
        applyFilters();
        updateURL();
    }
    
    function updateURL() {
        const params = new URLSearchParams();
        if (currentSection !== 'cat_liquidi') {
            params.set('section', currentSection);
        }
        if (selectedBrands.size > 0) {
            params.set('brand', Array.from(selectedBrands)[0]);
        }
        if (searchQuery) {
            params.set('search', searchQuery);
        }
        
        const newURL = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        
        window.history.pushState({}, '', newURL);
    }
    
        // Handle browser back/forward
        window.addEventListener('popstate', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const sectionParam = urlParams.get('section') || 'cat_liquidi';
            const brandParam = urlParams.get('brand');
            const searchParam = urlParams.get('search') || '';
            
            if (sectionParam !== currentSection) {
                currentSection = sectionParam;
                await loadProducts(currentSection);
                await setupBrandFilters();
                updateActiveTab();
            }
            
            selectedBrands.clear();
            if (brandParam) {
                selectedBrands.add(brandParam);
            }
            
            searchQuery = searchParam;
            if (headerSearch) {
                headerSearch.value = searchQuery;
            }
            
            updateBrandFiltersUI();
            applyFilters();
        });
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init().catch(error => {
                console.error('Error initializing products page:', error);
            });
        });
    } else {
        init().catch(error => {
            console.error('Error initializing products page:', error);
        });
    }
})();

