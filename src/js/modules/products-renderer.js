/**
 * Products Renderer Module
 * Handles dynamic rendering of product lines and listings
 */

class ProductsRenderer {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }

    /**
     * Render product line card HTML
     * @param {Object} line - Product line object
     * @param {string} brandName - Brand name
     * @param {string} brandLogo - Brand logo URL
     * @returns {string} HTML string
     */
    renderProductLineCard(line, brandName, brandLogo = '') {
        const imageUrl = line.image_url || '';
        const sectionId = line.sectionId || '';

        // Create navigation URL to line-products page
        const params = new URLSearchParams({
            brand: brandName,
            line: line.name
        });
        if (sectionId) {
            params.set('section', sectionId);
        }
        const navUrl = `line-products.html?${params.toString()}`;

        return `
            <a href="${navUrl}" 
               class="group product-card bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-primary/50 transition-all duration-300 block cursor-pointer">
                <div class="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden flex items-center justify-center">
                    ${imageUrl ? `
                    <img class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                         src="${imageUrl}" 
                         alt="${line.name} - ${brandName}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                    ` : ''}
                    <div class="${imageUrl ? 'hidden' : 'flex'} flex-col items-center justify-center text-zinc-600 w-full h-full">
                        <span class="material-symbols-outlined text-5xl opacity-30">inventory_2</span>
                    </div>
                </div>
                <div class="p-5">
                    <p class="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">${brandName}</p>
                    <h3 class="text-base font-bold text-white group-hover:text-primary transition-colors mb-4 line-clamp-2">${line.name}</h3>
                    <div class="details-btn w-full py-2.5 rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-xs tracking-widest transition-all uppercase flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-black">
                        Dettagli <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </div>
                </div>
            </a>
        `;
    }

    /**
     * Render product lines grid
     * @param {Array} lines - Array of product line objects (with brandName and brandLogo)
     * @param {HTMLElement} container - Container element
     */
    renderProductLinesGrid(lines, container) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        if (!lines || lines.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-white/40 text-lg">Aucun produit disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = lines
            .map(line => this.renderProductLineCard(line, line.brandName, line.brandLogo))
            .join('');
    }

    /**
     * Render product lines by brand
     * @param {string} brandName - Brand name
     * @param {string} sectionId - Optional section ID
     * @param {HTMLElement} container - Container element
     */
    async renderProductLinesByBrand(brandName, sectionId, container) {
        try {
            const lines = await this.catalogService.getBrandLines(brandName, sectionId);

            if (lines.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <p class="text-white/40 text-lg">Aucun produit disponible pour ${brandName}.</p>
                    </div>
                `;
                return;
            }

            const brand = sectionId
                ? await this.catalogService.getBrandByNameInSection(sectionId, brandName)
                : await this.catalogService.getBrandByName(brandName);

            const linesWithBrand = lines.map(line => ({
                ...line,
                brandName: brandName,
                brandLogo: brand ? brand.logo_url : ''
            }));

            this.renderProductLinesGrid(linesWithBrand, container);
        } catch (error) {
            console.error('Error rendering product lines:', error);
            container.innerHTML = '<p class="text-red-400">Erreur lors du chargement des produits</p>';
        }
    }

    /**
     * Render all product lines from a section
     * @param {string} sectionId - Section ID
     * @param {HTMLElement} container - Container element
     */
    async renderProductLinesBySection(sectionId, container) {
        try {
            const lines = await this.catalogService.getAllLinesBySection(sectionId);
            this.renderProductLinesGrid(lines, container);
        } catch (error) {
            console.error('Error rendering product lines by section:', error);
            container.innerHTML = '<p class="text-red-400">Erreur lors du chargement des produits</p>';
        }
    }

    /**
     * Render brand header with logo and info
     * @param {Object} brand - Brand object
     * @param {HTMLElement} container - Container element
     */
    renderBrandHeader(brand, container) {
        if (!container || !brand) return;

        const logoUrl = brand.logo_url || '/images/brands/placeholder.png';
        const websiteLink = brand.website
            ? `<a href="${brand.website}" target="_blank" class="text-primary hover:underline">${brand.website}</a>`
            : '';

        container.innerHTML = `
            <div class="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/10">
                <div class="w-32 h-32 bg-white/5 rounded-xl flex items-center justify-center p-4">
                    ${logoUrl ? `
                    <img src="${logoUrl}" alt="${brand.name} Logo" class="w-full h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                    ` : ''}
                    <div class="${logoUrl ? 'hidden' : 'flex'} items-center justify-center text-white/30 w-full h-full">
                        <span class="material-symbols-outlined text-3xl">image</span>
                    </div>
                </div>
                <div class="flex-1 text-center md:text-left">
                    <h2 class="text-4xl font-black italic uppercase mb-2">${brand.name}</h2>
                    ${websiteLink ? `<p class="text-white/60">Site web: ${websiteLink}</p>` : ''}
                    ${brand.lines && brand.lines.length > 0
                ? `<p class="text-white/40 text-sm mt-2">${brand.lines.length} ${brand.lines.length === 1 ? 'ligne' : 'lignes'} de produits</p>`
                : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render product card for "Nuovi Arrivi" section
     * @param {Object} line - Product line object
     * @param {string} brandName - Brand name
     * @param {string} sectionName - Section name
     * @returns {string} HTML string
     */
    renderNuoviArriviCard(line, brandName, sectionName = '') {
        const imageUrl = line.image_url || '';
        const sectionId = line.sectionId || '';
        const sectionLabel = sectionName || (line.sectionName || '');
        const description = line.description || line.flavorProfile || '';

        // Create navigation URL to line-products page
        const params = new URLSearchParams({
            brand: brandName,
            line: line.name
        });
        if (sectionId) {
            params.set('section', sectionId);
        }
        const navUrl = `line-products.html?${params.toString()}`;

        return `
            <div class="group bg-charcoal border border-white/5 rounded-sm overflow-hidden hover:border-primary/40 transition-all duration-500">
                <div class="aspect-[4/5] overflow-hidden bg-black relative">
                    ${imageUrl ? `
                    <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                         data-alt="${line.name}" 
                         src="${imageUrl}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                    ` : ''}
                    <div class="${imageUrl ? 'hidden' : 'flex'} items-center justify-center text-white/30 w-full h-full">
                        <span class="material-symbols-outlined text-5xl opacity-30">inventory_2</span>
                    </div>
                    <div class="absolute top-4 left-4 bg-primary text-background-dark text-[10px] font-black px-3 py-1 uppercase tracking-widest">Nuovo Arrivo</div>
                </div>
                <div class="p-8 space-y-4">
                    <div class="flex justify-between items-start">
                        <h3 class="text-bold-modern text-xl group-hover:text-primary transition-colors uppercase">${line.name}</h3>
                        ${sectionLabel ? `<span class="text-white/20 text-[10px] font-black uppercase tracking-widest">${sectionLabel}</span>` : ''}
                    </div>
                    ${description ? `<p class="text-sm text-slate-500 line-clamp-2 leading-relaxed">${description}</p>` : ''}
                    <div class="pt-6 flex items-center justify-between border-t border-white/5">
                        <a href="${navUrl}" 
                           class="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group/btn hover:text-primary transition-colors">
                            Visualizza Prodotto 
                            <span class="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render latest products in "Nuovi Arrivi" format
     * @param {Array} lines - Array of product line objects (with brandName, sectionName)
     * @param {HTMLElement} container - Container element
     * @param {number} limit - Maximum number of products to display
     */
    renderNuoviArrivi(lines, container, limit = 4) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        if (!lines || lines.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-white/40 text-lg">Nessun prodotto disponibile al momento.</p>
                </div>
            `;
            return;
        }

        const limitedLines = lines.slice(0, limit);
        container.innerHTML = limitedLines
            .map(line => this.renderNuoviArriviCard(line, line.brandName, line.sectionName))
            .join('');
    }

    /**
     * Render carousel card for "Nuovi Arrivi" section
     * @param {Object} line - Product line object
     * @param {string} brandName - Brand name
     * @param {string} sectionName - Section name
     * @returns {string} HTML string
     */
    renderNuoviArriviCarouselCard(line, brandName, sectionName = '') {
        const imageUrl = line.image_url || '';
        const sectionId = line.sectionId || '';
        const sectionLabel = sectionName || (line.sectionName || '');
        const description = line.description || line.flavorProfile || '';

        // Create navigation URL to line-products page
        const params = new URLSearchParams({
            brand: brandName,
            line: line.name
        });
        if (sectionId) {
            params.set('section', sectionId);
        }
        const navUrl = `line-products.html?${params.toString()}`;

        return `
            <div class="w-full flex-shrink-0 px-2">
                <div class="relative group overflow-hidden rounded-lg bg-gradient-to-br from-zinc-900 to-black border border-white/10 hover:border-primary/50 transition-all duration-500">
                    <!-- Large Image -->
                    <div class="aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-black relative">
                        ${imageUrl ? `
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                             data-alt="${line.name}" 
                             src="${imageUrl}"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                        ` : ''}
                        <div class="${imageUrl ? 'hidden' : 'flex'} items-center justify-center text-white/30 w-full h-full">
                            <span class="material-symbols-outlined text-8xl opacity-30">inventory_2</span>
                        </div>
                        <!-- Gradient Overlay -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
                        
                        <!-- Content Overlay -->
                        <div class="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                            <div class="max-w-3xl">
                                ${sectionLabel ? `<span class="inline-block bg-primary text-background-dark text-[10px] font-black px-4 py-2 uppercase tracking-widest mb-4">Nuovo Arrivo • ${sectionLabel}</span>` : '<span class="inline-block bg-primary text-background-dark text-[10px] font-black px-4 py-2 uppercase tracking-widest mb-4">Nuovo Arrivo</span>'}
                                <h3 class="text-4xl lg:text-6xl text-bold-modern uppercase text-white mb-4 group-hover:text-primary transition-colors">${line.name}</h3>
                                <p class="text-lg text-white/80 font-medium mb-2">${brandName}</p>
                                ${description ? `<p class="text-sm text-white/60 leading-relaxed mb-6 line-clamp-2 max-w-2xl">${description}</p>` : ''}
                                <a href="${navUrl}" 
                                   class="inline-flex items-center gap-3 bg-primary hover:bg-white text-background-dark px-8 py-4 rounded-sm font-black text-xs uppercase tracking-widest transition-all accent-glow-strong">
                                    Scopri di più
                                    <span class="material-symbols-outlined text-lg">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render carousel for "Nuovi Arrivi" section
     * @param {Array} lines - Array of product line objects (with brandName, sectionName)
     * @param {HTMLElement} carouselContainer - Carousel container element
     * @param {HTMLElement} indicatorsContainer - Indicators container element
     * @param {number} limit - Maximum number of products to display
     */
    renderNuoviArriviCarousel(lines, carouselContainer, indicatorsContainer, limit = 4) {
        if (!carouselContainer) {
            console.error('Carousel container element not found');
            return;
        }

        if (!lines || lines.length === 0) {
            carouselContainer.innerHTML = `
                <div class="w-full flex items-center justify-center py-20">
                    <p class="text-background-dark/40 text-lg">Nessun prodotto disponibile al momento.</p>
                </div>
            `;
            return;
        }

        const limitedLines = lines.slice(0, limit);

        // Render carousel slides
        carouselContainer.innerHTML = limitedLines
            .map(line => this.renderNuoviArriviCarouselCard(line, line.brandName, line.sectionName))
            .join('');

        // Render indicators
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = limitedLines
                .map((_, index) => `
                    <button 
                        class="carousel-indicator w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-primary w-8' : 'bg-black/20 hover:bg-black/40'}" 
                        data-index="${index}"
                        aria-label="Go to slide ${index + 1}">
                    </button>
                `)
                .join('');
        }

        // Initialize carousel functionality
        this.initializeCarousel(carouselContainer, indicatorsContainer, limitedLines.length);
    }

    /**
     * Initialize carousel navigation and auto-play
     * @param {HTMLElement} carouselContainer - Carousel container element
     * @param {HTMLElement} indicatorsContainer - Indicators container element
     * @param {number} totalSlides - Total number of slides
     */
    initializeCarousel(carouselContainer, indicatorsContainer, totalSlides) {
        let currentIndex = 0;
        let autoPlayInterval;

        const updateCarousel = (index) => {
            currentIndex = index;
            const offset = -index * 100;
            carouselContainer.style.transform = `translateX(${offset}%)`;

            // Update indicators
            if (indicatorsContainer) {
                const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
                indicators.forEach((indicator, i) => {
                    if (i === index) {
                        indicator.classList.add('bg-primary', 'w-8');
                        indicator.classList.remove('bg-black/20', 'w-3');
                    } else {
                        indicator.classList.remove('bg-primary', 'w-8');
                        indicator.classList.add('bg-black/20', 'w-3');
                    }
                });
            }
        };

        const nextSlide = () => {
            const newIndex = (currentIndex + 1) % totalSlides;
            updateCarousel(newIndex);
        };

        const prevSlide = () => {
            const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel(newIndex);
        };

        const startAutoPlay = () => {
            autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        };

        const stopAutoPlay = () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
        };

        // Navigation buttons
        const prevButton = document.getElementById('nuovi-arrivi-prev');
        const nextButton = document.getElementById('nuovi-arrivi-next');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                stopAutoPlay();
                prevSlide();
                startAutoPlay();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                stopAutoPlay();
                nextSlide();
                startAutoPlay();
            });
        }

        // Indicator buttons
        if (indicatorsContainer) {
            const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    stopAutoPlay();
                    updateCarousel(index);
                    startAutoPlay();
                });
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                stopAutoPlay();
                prevSlide();
                startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                stopAutoPlay();
                nextSlide();
                startAutoPlay();
            }
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        });

        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoPlay();
        });

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) {
                nextSlide();
            }
            if (touchEndX > touchStartX + 50) {
                prevSlide();
            }
        };

        // Pause on hover
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);

        // Start auto-play
        startAutoPlay();
    }


    /**
     * Render product card HTML for individual product
     * @param {Object} product - Product object with name, images, brandName, lineName, etc.
     * @returns {string} HTML string
     */
    renderProductCard(product) {
        // Get main image - use imageUrl or first image from images array
        const images = product.images || [];
        const imageUrl = product.imageUrl || (images.length > 0 ? images[0] : '');
        const productId = product.id || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const brandName = product.brandName || '';
        const lineName = product.lineName || '';
        const productName = product.name || '';

        // Build URL for product detail page
        const params = new URLSearchParams({
            id: productId,
            brand: brandName,
            line: lineName
        });
        if (product.sectionId) {
            params.set('section', product.sectionId);
        }
        const detailUrl = `product-detail.html?${params.toString()}`;

        return `
            <a href="${detailUrl}" 
               class="group product-card bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-primary/50 transition-all duration-300 block cursor-pointer">
                <div class="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden flex items-center justify-center">
                    ${imageUrl ? `
                    <img class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                         src="${imageUrl}" 
                         alt="${productName} - ${brandName}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                    ` : ''}
                    <div class="${imageUrl ? 'hidden' : 'flex'} flex-col items-center justify-center text-zinc-600 w-full h-full">
                        <span class="material-symbols-outlined text-5xl opacity-30">inventory_2</span>
                    </div>
                </div>
                <div class="p-5">
                    <p class="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">${brandName}${lineName ? ` • ${lineName}` : ''}</p>
                    <h3 class="text-base font-bold text-white group-hover:text-primary transition-colors mb-4 line-clamp-2">${productName}</h3>
                    ${product.flavorProfile ? `<p class="text-zinc-500 text-xs mb-3 line-clamp-1">${product.flavorProfile}</p>` : ''}
                    <div class="details-btn w-full py-2.5 rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-xs tracking-widest transition-all uppercase flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-black">
                        Dettagli <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </div>
                </div>
            </a>
        `;
    }

    /**
     * Render products grid
     * @param {Array} products - Array of product objects
     * @param {HTMLElement} container - Container element
     */
    renderProductsGrid(products, container) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-white/40 text-lg">Aucun produit disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products
            .map(product => this.renderProductCard(product))
            .join('');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsRenderer;
}

