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
    let selectedBrands = [];
    let selectedSections = [];
    let allBrands = [];
    let allSections = [];
    
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
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-red-400">Erreur d\'initialisation: ' + error.message + '</td></tr>';
        return;
    }
    
    async function loadAllProducts() {
        try {
            // Show loading
            if (loadingDiv) loadingDiv.classList.remove('hidden');
            if (errorDiv) errorDiv.classList.add('hidden');
            if (table) table.classList.add('hidden');
            
            // Load all products from Firebase
            allProducts = await catalogService.getAllProducts();
            
            // Get sections and brands for filters
            const sections = await catalogService.getSections();
            allSections = sections;
            allBrands = [];
            
            // Collect unique brands from products
            const brandSet = new Set();
            allProducts.forEach(product => {
                if (product.brandName && !brandSet.has(product.brandName)) {
                    brandSet.add(product.brandName);
                    allBrands.push({
                        name: product.brandName,
                        logo_url: product.brandLogo || ''
                    });
                }
            });
            
            // Initialize filters UI
            initFilters();
            
            // Apply current filters
            applyFilters();
            
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
    
    function initFilters() {
        const brandDropdown = document.getElementById('brand-filter-dropdown');
        const categoryDropdown = document.getElementById('category-filter-dropdown');
        const activeFiltersContainer = document.getElementById('active-filters');
        
        // Brand dropdown
        if (brandDropdown) {
            brandDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                showBrandDropdown(brandDropdown);
            });
        }
        
        // Category dropdown
        if (categoryDropdown) {
            categoryDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                showCategoryDropdown(categoryDropdown);
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            closeAllDropdowns();
        });
    }
    
    function showBrandDropdown(button) {
        closeAllDropdowns();
        
        const rect = button.getBoundingClientRect();
        const dropdown = document.createElement('div');
        dropdown.className = 'fixed z-50 mt-2 bg-surface-dark border border-border-dark rounded-xl shadow-xl max-h-64 overflow-y-auto';
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.minWidth = `${rect.width}px`;
        dropdown.id = 'brand-dropdown-menu';
        
        document.body.appendChild(dropdown);
        
        // Add "All Brands" option
        const allOption = document.createElement('button');
        allOption.className = 'w-full text-left px-4 py-2 text-sm text-white hover:bg-primary/20 transition-colors';
        allOption.textContent = 'All Brands';
        allOption.addEventListener('click', () => {
            selectedBrands = [];
            updateActiveFilters();
            applyFilters();
            closeAllDropdowns();
        });
        dropdown.appendChild(allOption);
        
        // Add divider
        const divider = document.createElement('div');
        divider.className = 'h-px bg-border-dark my-1';
        dropdown.appendChild(divider);
        
        // Add brand options
        allBrands.forEach(brand => {
            const option = document.createElement('button');
            option.className = 'w-full text-left px-4 py-2 text-sm text-white hover:bg-primary/20 transition-colors flex items-center justify-between';
            option.innerHTML = `
                <span>${brand.name}</span>
                ${selectedBrands.includes(brand.name) ? '<span class="material-symbols-outlined text-sm text-primary">check</span>' : ''}
            `;
            option.addEventListener('click', () => {
                if (selectedBrands.includes(brand.name)) {
                    selectedBrands = selectedBrands.filter(b => b !== brand.name);
                } else {
                    selectedBrands.push(brand.name);
                }
                updateActiveFilters();
                applyFilters();
                closeAllDropdowns();
            });
            dropdown.appendChild(option);
        });
    }
    
    function showCategoryDropdown(button) {
        closeAllDropdowns();
        
        const rect = button.getBoundingClientRect();
        const dropdown = document.createElement('div');
        dropdown.className = 'fixed z-50 mt-2 bg-surface-dark border border-border-dark rounded-xl shadow-xl';
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.minWidth = `${rect.width}px`;
        dropdown.id = 'category-dropdown-menu';
        
        document.body.appendChild(dropdown);
        
        // Add "All Categories" option
        const allOption = document.createElement('button');
        allOption.className = 'w-full text-left px-4 py-2 text-sm text-white hover:bg-primary/20 transition-colors';
        allOption.textContent = 'All Categories';
        allOption.addEventListener('click', () => {
            selectedSections = [];
            updateActiveFilters();
            applyFilters();
            closeAllDropdowns();
        });
        dropdown.appendChild(allOption);
        
        // Add divider
        const divider = document.createElement('div');
        divider.className = 'h-px bg-border-dark my-1';
        dropdown.appendChild(divider);
        
        // Add section options
        allSections.forEach(section => {
            const option = document.createElement('button');
            option.className = 'w-full text-left px-4 py-2 text-sm text-white hover:bg-primary/20 transition-colors flex items-center justify-between';
            option.innerHTML = `
                <span>${section.name}</span>
                ${selectedSections.includes(section.id) ? '<span class="material-symbols-outlined text-sm text-primary">check</span>' : ''}
            `;
            option.addEventListener('click', () => {
                if (selectedSections.includes(section.id)) {
                    selectedSections = selectedSections.filter(s => s !== section.id);
                } else {
                    selectedSections.push(section.id);
                }
                updateActiveFilters();
                applyFilters();
                closeAllDropdowns();
            });
            dropdown.appendChild(option);
        });
    }
    
    function closeAllDropdowns() {
        const brandDropdown = document.getElementById('brand-dropdown-menu');
        const categoryDropdown = document.getElementById('category-dropdown-menu');
        if (brandDropdown) brandDropdown.remove();
        if (categoryDropdown) categoryDropdown.remove();
    }
    
    function updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('active-filters');
        const brandDropdown = document.getElementById('brand-filter-dropdown');
        const categoryDropdown = document.getElementById('category-filter-dropdown');
        
        if (!activeFiltersContainer) return;
        
        activeFiltersContainer.innerHTML = '';
        
        // Update brand dropdown text
        if (brandDropdown) {
            const brandText = brandDropdown.querySelector('span.text-sm');
            if (selectedBrands.length === 0) {
                brandText.textContent = 'All Brands';
            } else if (selectedBrands.length === 1) {
                brandText.textContent = selectedBrands[0];
            } else {
                brandText.textContent = `${selectedBrands.length} Brands`;
            }
        }
        
        // Update category dropdown text
        if (categoryDropdown) {
            const categoryText = categoryDropdown.querySelector('span.text-sm');
            if (selectedSections.length === 0) {
                categoryText.textContent = 'Category';
            } else if (selectedSections.length === 1) {
                const section = allSections.find(s => s.id === selectedSections[0]);
                categoryText.textContent = section ? section.name : 'Category';
            } else {
                categoryText.textContent = `${selectedSections.length} Categories`;
            }
        }
        
        // Add brand filters
        selectedBrands.forEach(brandName => {
            const chip = document.createElement('button');
            chip.className = 'flex items-center gap-2 h-10 px-4 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all';
            chip.innerHTML = `
                <span class="text-sm font-bold">${brandName}</span>
                <span class="material-symbols-outlined text-sm cursor-pointer">close</span>
            `;
            chip.addEventListener('click', () => {
                selectedBrands = selectedBrands.filter(b => b !== brandName);
                updateActiveFilters();
                applyFilters();
            });
            activeFiltersContainer.appendChild(chip);
        });
        
        // Add section filters
        selectedSections.forEach(sectionId => {
            const section = allSections.find(s => s.id === sectionId);
            if (section) {
                const chip = document.createElement('button');
                chip.className = 'flex items-center gap-2 h-10 px-4 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all';
                chip.innerHTML = `
                    <span class="text-sm font-bold">${section.name}</span>
                    <span class="material-symbols-outlined text-sm cursor-pointer">close</span>
                `;
                chip.addEventListener('click', () => {
                    selectedSections = selectedSections.filter(s => s !== sectionId);
                    updateActiveFilters();
                    applyFilters();
                });
                activeFiltersContainer.appendChild(chip);
            }
        });
    }
    
    function applyFilters() {
        filteredProducts = allProducts.filter(product => {
            // Filter by brands
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.brandName)) {
                return false;
            }
            
            // Filter by sections
            if (selectedSections.length > 0 && !selectedSections.includes(product.sectionId)) {
                return false;
            }
            
            return true;
        });
        
        renderProducts(filteredProducts);
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
                    <td colspan="6" class="px-6 py-12 text-center">
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
        
        tbody.innerHTML = products.map(product => {
            // Get product image - use imageUrl or first image from images array
            const images = product.images || [];
            const imageUrl = product.imageUrl || (images.length > 0 ? images[0] : '');
            const productId = product.id || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            return `
            <tr class="hover:bg-white/5 transition-colors group">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-border-dark flex-shrink-0 bg-cover bg-center border border-border-dark/50" style="background-image: url('${imageUrl}')">
                            ${!imageUrl ? '<span class="text-[#baba9c] text-xs">No img</span>' : ''}
                        </div>
                        <div>
                            <p class="text-white font-bold text-sm">${product.name || 'N/A'}</p>
                            <p class="text-[#baba9c] text-xs">${product.brandName || 'N/A'}${product.lineName ? ` • ${product.lineName}` : ''}</p>
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
                    <span class="text-white text-sm">${product.lineName || 'N/A'}</span>
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
                                data-line="${product.lineName}"
                                data-product-id="${productId}">
                            <span class="material-symbols-outlined">edit_square</span>
                        </button>
                        <button class="delete-product-btn p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors" 
                                data-section="${product.sectionId}" 
                                data-brand="${product.brandName}" 
                                data-line="${product.lineName}"
                                data-product-id="${productId}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
        
        // Add event listeners
        tbody.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.section;
                const brandName = e.currentTarget.dataset.brand;
                const lineName = e.currentTarget.dataset.line;
                const productId = e.currentTarget.dataset.productId;
                window.location.href = `add.html?section=${encodeURIComponent(sectionId)}&brand=${encodeURIComponent(brandName)}&line=${encodeURIComponent(lineName)}&product=${encodeURIComponent(productId)}`;
            });
        });
        
        tbody.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const sectionId = e.currentTarget.dataset.section;
                const brandName = e.currentTarget.dataset.brand;
                const lineName = e.currentTarget.dataset.line;
                const productId = e.currentTarget.dataset.productId;
                
                if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${productId}" de la ligne "${lineName}" ?`)) {
                    try {
                        await catalogService.deleteProduct(sectionId, brandName, lineName, productId);
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
            let searchResults = allProducts.filter(product => 
                product.name.toLowerCase().includes(query) ||
                (product.brandName && product.brandName.toLowerCase().includes(query))
            );
            
            // Apply active filters to search results
            if (selectedBrands.length > 0) {
                searchResults = searchResults.filter(p => selectedBrands.includes(p.brandName));
            }
            if (selectedSections.length > 0) {
                searchResults = searchResults.filter(p => selectedSections.includes(p.sectionId));
            }
            
            filteredProducts = searchResults;
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

