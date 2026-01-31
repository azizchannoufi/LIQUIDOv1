/**
 * Brands Page Script
 * Handles dynamic loading of brands on brands.html
 * 
 * Include scripts in this order:
 * 1. catalog-service.js
 * 2. brands-renderer.js
 * 3. catalog-init.js
 * 4. brands-page.js
 */

(async function () {
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

    if (!catalog || !catalog.service || !catalog.brandsRenderer) {
        console.error('Catalog initialization failed:', catalog);
        return;
    }

    const { service, brandsRenderer } = catalog;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sectionId = urlParams.get('section') || null;
    const searchQuery = urlParams.get('search') || null;

    // Get container element
    const brandsContainer = document.getElementById('brands-grid-container') ||
        document.querySelector('.brands-grid-container') ||
        document.querySelector('section.px-6 > div.grid');

    if (!brandsContainer) {
        console.error('Brands container not found');
        return;
    }

    // Render brands based on filters
    // Par défaut, afficher uniquement les marques de type "dispositivi" (devices)
    if (searchQuery) {
        await brandsRenderer.searchAndRenderBrands(searchQuery, brandsContainer);
    } else if (sectionId) {
        await brandsRenderer.renderBrandsBySection(sectionId, brandsContainer);
    } else {
        // Afficher uniquement les devices par défaut
        await brandsRenderer.renderBrandsBySection('cat_dispositivi', brandsContainer);
    }

    // Setup search functionality
    const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="Cerca"]');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            searchTimeout = setTimeout(async () => {
                if (query.length > 0) {
                    await brandsRenderer.searchAndRenderBrands(query, brandsContainer);
                } else {
                    await brandsRenderer.renderAllBrands(brandsContainer);
                }
            }, 300);
        });
    }

    // Setup section filter buttons
    const filterButtons = document.querySelectorAll('.section-filter-btn, [data-section-id]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const sectionId = e.currentTarget.dataset.sectionId;

            // Render brands based on filter
            if (sectionId === 'all') {
                await brandsRenderer.renderAllBrands(brandsContainer);
            } else {
                await brandsRenderer.renderBrandsBySection(sectionId, brandsContainer);
            }

            // Update active state with smooth transition
            filterButtons.forEach(b => {
                b.classList.remove('bg-primary', 'text-black');
                b.classList.add('bg-white/5', 'dark:bg-white/5', 'bg-gray-100', 'text-gray-700', 'dark:text-white/70');
            });
            e.currentTarget.classList.remove('bg-white/5', 'dark:bg-white/5', 'bg-gray-100', 'text-gray-700', 'dark:text-white/70', 'hover:bg-white/10', 'dark:hover:bg-white/10', 'hover:bg-gray-200');
            e.currentTarget.classList.add('bg-primary', 'text-black');
        });
    });
})();

