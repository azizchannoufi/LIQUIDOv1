/**
 * Category Products Page Script
 * Handles loading and displaying products for a specific category (e.g. Tabaccosi)
 */

(async function () {
    'use strict';

    // Wait for DOM and catalog initialization
    async function init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        // Wait for catalog & search initialization
        if (!window.catalogInit || !window.liquidoSearchService) {
            await new Promise(resolve => {
                const checkDeps = setInterval(() => {
                    if (window.catalogInit && window.liquidoSearchService) {
                        clearInterval(checkDeps);
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
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryName = urlParams.get('category');

        const productsGrid = document.getElementById('products-grid');
        const productsCount = document.getElementById('products-count');
        const noResults = document.getElementById('no-results');
        const lineHeroBg = document.getElementById('line-hero-bg');
        const lineNameEl = document.getElementById('category-name');
        const lineBrandNameEl = document.getElementById('category-badge');
        const breadcrumbCategoryEl = document.getElementById('breadcrumb-category');
        const lineGallery = document.getElementById('line-gallery');

        if (!categoryName) {
            console.error('Missing required URL parameters: category');
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="text-red-400 col-span-full text-center py-12">Categoria non trovata. Torna alla <a href="/liquidi" class="text-primary hover:underline">pagina prodotti</a>.</p>';
            }
            return;
        }

        try {
            // Setup Hero
            if (lineNameEl) lineNameEl.textContent = categoryName;
            if (lineBrandNameEl) lineBrandNameEl.textContent = "Categoria";
            if (breadcrumbCategoryEl) breadcrumbCategoryEl.textContent = categoryName;
            document.title = `${categoryName} | LIQUIDO`;

            // Setup Background image for category Hero
            const bgImages = {
                'tabaccosi': '../assets/images/Categoria/Copia di foglie-di-tabacco.jpg',
                'fruttati': '../assets/images/Categoria/Copia di frutta.jpeg',
                'cremosi': '../assets/images/Categoria/Copia di mix-di-creme.jpg',
                'ghiacciati': '../assets/images/Categoria/Copia di frutta-ice-2.png'
            };
            const catKey = categoryName.toLowerCase();
            if (lineHeroBg && bgImages[catKey]) {
                lineHeroBg.style.backgroundImage = `url('${bgImages[catKey]}')`;
            }

            // Hide unused gallery
            if (lineGallery) {
                lineGallery.classList.add('hidden');
            }

            // Get products via Search Service or filter manually
            const searchResults = await window.liquidoSearchService.search(categoryName, 100);
            
            // Filter out non-products or non-matching if needed.
            let products = [];
            
            // For a "Category" we only want lines/products, preferably lines based on keywords.
            // If the user searches "Tabaccosi", we might just fetch all brands/lines with that tag
            // But search-service already matches description and titles!
            // To render via productsRenderer, we need `line` objects.
            const results = searchResults.filter(r => r.type === 'line' || r.type === 'product');
            
            // The search engine returns original data in `brandData`, `lineData`, `productData`
            products = results.map(r => {
                if (r.type === 'line' && r.lineData) {
                    return {
                        ...r.lineData,
                        brandName: r.brandName,
                        sectionId: r.sectionId
                    };
                }
                if (r.type === 'product' && r.productData) {
                    return {
                        ...r.productData,
                        brandName: r.brandName,
                        name: r.lineName + " - " + (r.productData.name || ''),
                        sectionId: r.sectionId
                    };
                }
                return null;
            }).filter(p => p !== null);

            // Deduplicate lines to avoid showing the same line twice if multiple products match
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const p of products) {
                const uniqueKey = `${p.brandName}-${p.name}`;
                if (!seenIds.has(uniqueKey)) {
                    seenIds.add(uniqueKey);
                    uniqueProducts.push(p);
                }
            }
            products = uniqueProducts;

            // Update products count
            if (productsCount) {
                productsCount.textContent = products.length;
            }

            // Render products
            if (products.length === 0) {
                if (productsGrid) {
                    productsGrid.innerHTML = '';
                }
                if (noResults) {
                    noResults.classList.remove('hidden');
                }
            } else {
                if (noResults) {
                    noResults.classList.add('hidden');
                }
                if (productsGrid) {
                    productsRenderer.renderProductsGrid(products, productsGrid);
                }
            }

        } catch (error) {
            console.error('Error loading category products:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="text-red-400 col-span-full text-center py-12">Erreur lors du chargement des produits: ' + error.message + '</p>';
            }
        }
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init().catch(console.error);
        });
    } else {
        init().catch(console.error);
    }
})();
