/**
 * Products Page Script
 * Handles dynamic loading of products on products.html
 * 
 * Include scripts in this order:
 * 1. catalog-service.js
 * 2. products-renderer.js
 * 3. catalog-init.js
 * 4. products-page.js
 */

(async function() {
    // Wait for catalog initialization
    const catalog = await window.catalogInit;
    const { service, productsRenderer } = catalog;
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const brandName = urlParams.get('brand');
    const sectionId = urlParams.get('section');
    const sectionParam = urlParams.get('sectionId');
    
    // Determine which section to use
    const activeSectionId = sectionId || sectionParam || 'cat_liquidi';
    
    // Get container elements
    const productsContainer = document.querySelector('.products-grid-container') || 
                             document.querySelector('div.grid.grid-cols-1');
    
    const brandHeaderContainer = document.querySelector('.brand-header-container');
    
    // Render products
    if (brandName) {
        // Render brand header if container exists
        if (brandHeaderContainer) {
            const brand = sectionId 
                ? await service.getBrandByNameInSection(sectionId, brandName)
                : await service.getBrandByName(brandName);
            
            if (brand) {
                productsRenderer.renderBrandHeader(brand, brandHeaderContainer);
            }
        }
        
        // Render product lines for the brand
        if (productsContainer) {
            await productsRenderer.renderProductLinesByBrand(brandName, sectionId || null, productsContainer);
        }
    } else {
        // Render all products from section
        if (productsContainer) {
            await productsRenderer.renderProductLinesBySection(activeSectionId, productsContainer);
        }
    }
    
    // Setup section tabs
    document.querySelectorAll('[data-section-tab]').forEach(tab => {
        tab.addEventListener('click', async (e) => {
            const sectionId = e.currentTarget.dataset.sectionTab;
            
            // Update active tab
            document.querySelectorAll('[data-section-tab]').forEach(t => {
                t.classList.remove('border-primary', 'text-primary');
                t.classList.add('border-transparent', 'text-zinc-500');
            });
            e.currentTarget.classList.add('border-primary', 'text-primary');
            e.currentTarget.classList.remove('border-transparent', 'text-zinc-500');
            
            // Render products for section
            if (productsContainer) {
                await productsRenderer.renderProductLinesBySection(sectionId, productsContainer);
            }
        });
    });
})();

