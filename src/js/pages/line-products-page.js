/**
 * Line Products Page Script
 * Handles loading and displaying products for a specific line
 */

(async function () {
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

            // Build the Image Gallery if line.images is present and has more than 1 image
            // We can also show it if there's only 1 image, just for completeness
            const lineGalleryContainer = document.getElementById('line-gallery-container');
            const lineGallerySection = document.getElementById('line-gallery');
            const imagesToLoad = line.images && line.images.length > 0
                ? line.images
                : (line.image_url ? [line.image_url] : []);

            if (imagesToLoad.length > 0 && lineGallerySection && lineGalleryContainer) {
                lineGallerySection.classList.remove('hidden');

                let galleryHTML = '';
                imagesToLoad.forEach((imgUrl, idx) => {
                    galleryHTML += `
                        <div class="group relative w-full aspect-square overflow-hidden bg-gray-50 border border-border-dark cursor-pointer rounded-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300" onclick="window.openLineImageModal('${imgUrl}')">
                            <img src="${imgUrl}" alt="Galleria ${idx + 1}" class="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700" />
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span class="material-symbols-outlined text-white text-3xl">zoom_in</span>
                            </div>
                        </div>
                    `;
                });
                lineGalleryContainer.innerHTML = galleryHTML;
            }

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

    // Modal Functions for Line Gallery
    window.openLineImageModal = function (url) {
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        if (!imageModal || !modalImage) return;

        modalImage.src = url;
        imageModal.classList.remove('hidden');
        imageModal.classList.add('flex');

        setTimeout(() => {
            imageModal.classList.remove('opacity-0');
            imageModal.classList.add('opacity-100');
        }, 10);

        document.body.style.overflow = 'hidden';
    };

    window.closeLineImageModal = function () {
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        if (!imageModal || !modalImage) return;

        imageModal.classList.remove('opacity-100');
        imageModal.classList.add('opacity-0');

        setTimeout(() => {
            imageModal.classList.remove('flex');
            imageModal.classList.add('hidden');
            modalImage.src = '';
            document.body.style.overflow = '';
        }, 300);
    };

    // Initialize Modal event listeners
    function initModalListeners() {
        const closeModalBtn = document.getElementById('close-modal');
        const imageModal = document.getElementById('image-modal');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', window.closeLineImageModal);
        }
        if (imageModal) {
            imageModal.addEventListener('click', function (e) {
                if (e.target === imageModal) {
                    window.closeLineImageModal();
                }
            });
        }
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initModalListeners();
            init().catch(error => {
                console.error('Error initializing line products page:', error);
            });
        });
    } else {
        initModalListeners();
        init().catch(error => {
            console.error('Error initializing line products page:', error);
        });
    }
})();





