/**
 * Line Products Page Script
 * Handles loading and displaying products for a specific line
 */

(async function() {
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
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sectionId = urlParams.get('section');
        const brandName = urlParams.get('brand');
        const lineName = urlParams.get('line');
        
        if (!sectionId || !brandName || !lineName) {
            console.error('Missing required URL parameters: section, brand, line');
            const productsGrid = document.getElementById('products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="text-red-400 col-span-full text-center py-12">Parametri mancanti. Torna alla <a href="products.html" class="text-primary hover:underline">pagina prodotti</a>.</p>';
            }
            return;
        }
        
        // Get DOM elements
        const productsGrid = document.getElementById('products-grid');
        const productsCount = document.getElementById('products-count');
        const noResults = document.getElementById('no-results');
        const lineHero = document.getElementById('line-hero');
        const lineHeroBg = document.getElementById('line-hero-bg');
        const lineNameEl = document.getElementById('line-name');
        const lineBrandNameEl = document.getElementById('line-brand-name');
        const lineDescriptionEl = document.getElementById('line-description');
        const breadcrumbLineEl = document.getElementById('breadcrumb-line');
        
        try {
            // Get line information
            const brand = await service.getBrandByNameInSection(sectionId, brandName);
            if (!brand) {
                throw new Error(`Brand ${brandName} not found`);
            }
            
            const lines = brand.lines || [];
            const line = lines.find(l => l.name === lineName);
            
            if (!line) {
                throw new Error(`Line ${lineName} not found`);
            }
            
            // Update hero section with line image
            if (lineHeroBg && line.image_url) {
                lineHeroBg.style.backgroundImage = `url('${line.image_url}')`;
            }
            
            // Update line information
            if (lineNameEl) {
                lineNameEl.textContent = lineName;
            }
            
            if (lineBrandNameEl) {
                lineBrandNameEl.textContent = brandName;
            }
            
            if (breadcrumbLineEl) {
                breadcrumbLineEl.textContent = lineName;
            }
            
            // Update page title
            document.title = `${lineName} - ${brandName} | LIQUIDO`;
            
            // Load products for this line
            const products = await service.getProductsByLine(sectionId, brandName, lineName);
            
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
            console.error('Error loading line products:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p class="text-red-400 col-span-full text-center py-12">Erreur lors du chargement des produits: ' + error.message + '</p>';
            }
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init().catch(error => {
                console.error('Error initializing line products page:', error);
            });
        });
    } else {
        init().catch(error => {
            console.error('Error initializing line products page:', error);
        });
    }
})();


