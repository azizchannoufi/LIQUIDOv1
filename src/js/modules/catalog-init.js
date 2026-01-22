/**
 * Catalog Initialization Module
 * Initializes catalog service and renderers for use in pages
 * 
 * Usage: Include this script after catalog-service.js, brands-renderer.js, and products-renderer.js
 */

(function() {
    'use strict';
    
    let catalogServiceInstance = null;
    let brandsRendererInstance = null;
    let productsRendererInstance = null;
    
    /**
     * Initialize catalog system
     * @returns {Promise<Object>} Object with service and renderers
     */
    async function initCatalog() {
        // Initialize catalog service
        if (!catalogServiceInstance) {
            catalogServiceInstance = new CatalogService();
        }
        
        // Initialize renderers (only if classes are available)
        if (!brandsRendererInstance && typeof BrandsRenderer !== 'undefined') {
            brandsRendererInstance = new BrandsRenderer(catalogServiceInstance);
        }
        
        if (!productsRendererInstance && typeof ProductsRenderer !== 'undefined') {
            productsRendererInstance = new ProductsRenderer(catalogServiceInstance);
        }
        
        const result = {
            service: catalogServiceInstance
        };
        
        if (brandsRendererInstance) {
            result.brandsRenderer = brandsRendererInstance;
        }
        
        if (productsRendererInstance) {
            result.productsRenderer = productsRendererInstance;
        }
        
        return result;
    }
    
    // Make initCatalog available globally
    window.initCatalog = initCatalog;
    
    // Auto-initialize if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.catalogInit = initCatalog();
        });
    } else {
        window.catalogInit = initCatalog();
    }
})();

