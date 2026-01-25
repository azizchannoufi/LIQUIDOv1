/**
 * Brands Renderer Module
 * Handles dynamic rendering of brand cards and listings
 */

class BrandsRenderer {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }

    /**
     * Render brand card HTML
     * @param {Object} brand - Brand object
     * @param {string} sectionName - Section name for context
     * @returns {string} HTML string
     */
    renderBrandCard(brand, sectionName = '') {
        const hasLines = brand.lines && brand.lines.length > 0;
        const logoUrl = brand.logo_url || '';
        const website = brand.website ? `href="${brand.website}" target="_blank"` : '';

        return `
            <div class="brand-card-hover group bg-white/[0.02] border border-white/5 p-10 flex flex-col items-center text-center">
                <div class="w-full aspect-square mb-10 bg-white dark:bg-white border border-white/5 flex items-center justify-center p-8 grayscale group-hover:grayscale-0 transition-all duration-700">
                    ${logoUrl ? `
                    <img src="${logoUrl}" alt="${brand.name} Logo" class="w-full h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                    ` : ''}
                    <div class="${logoUrl ? 'hidden' : 'flex'} flex-col items-center justify-center text-gray-400 dark:text-white/30 w-full h-full">
                        <span class="material-symbols-outlined text-4xl mb-2">image</span>
                        <span class="text-xs">${brand.name}</span>
                    </div>
                </div>
                <div class="space-y-4 flex-grow">
                    ${sectionName ? `<span class="text-primary text-[9px] font-black uppercase tracking-[0.25em]">${sectionName}</span>` : ''}
                    <h3 class="text-3xl font-black italic uppercase text-background-dark dark:text-white group-hover:text-primary transition-colors">
                        ${brand.name}
                    </h3>
                    ${hasLines ? `
                        <p class="text-gray-600 dark:text-white/40 text-sm leading-relaxed px-2 font-medium">
                            ${brand.lines.length} ${brand.lines.length === 1 ? 'ligne' : 'lignes'} de produits disponibles
                        </p>
                    ` : `
                        <p class="text-gray-600 dark:text-white/40 text-sm leading-relaxed px-2 font-medium">
                            Marque partenaire
                        </p>
                    `}
                </div>
                <div class="mt-10 w-full">
                    ${hasLines ? `
                        <button 
                            class="brand-catalog-btn w-full py-4 border border-white/10 dark:border-white/10 border-black/10 text-background-dark dark:text-white group-hover:bg-primary group-hover:border-primary group-hover:text-black dark:group-hover:text-black font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                            data-brand="${brand.name}"
                            data-section="${sectionName}"
                        >
                            View Catalog
                            <span class="material-symbols-outlined text-sm">arrow_right_alt</span>
                        </button>
                    ` : `
                        ${website ? `
                            <a ${website} class="w-full py-4 border border-white/10 dark:border-white/10 border-black/10 text-background-dark dark:text-white group-hover:bg-primary group-hover:border-primary group-hover:text-black dark:group-hover:text-black font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                                Visit Website
                                <span class="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                        ` : `
                            <button class="w-full py-4 border border-white/10 dark:border-white/10 border-black/10 text-gray-400 dark:text-white/50 font-black text-[11px] uppercase tracking-[0.2em] cursor-not-allowed">
                                Coming Soon
                            </button>
                        `}
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Render brands grid
     * @param {Array} brands - Array of brand objects
     * @param {string} sectionName - Section name
     * @param {HTMLElement} container - Container element
     */
    renderBrandsGrid(brands, sectionName, container) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        if (!brands || brands.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-600 dark:text-white/40 text-lg">Aucune marque disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = brands
            .map(brand => this.renderBrandCard(brand, sectionName))
            .join('');

        // Attach event listeners for catalog buttons
        container.querySelectorAll('.brand-catalog-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const brandName = e.currentTarget.dataset.brand;
                const section = e.currentTarget.dataset.section;
                this.handleBrandCatalogClick(brandName, section);
            });
        });
    }

    /**
     * Handle brand catalog button click
     * @param {string} brandName - Brand name
     * @param {string} sectionName - Section name
     */
    handleBrandCatalogClick(brandName, sectionName) {
        // Navigate to products page with brand filter
        const params = new URLSearchParams({
            brand: brandName,
            section: sectionName
        });
        window.location.href = `products.html?${params.toString()}`;
    }

    /**
     * Render brands by section
     * @param {string} sectionId - Section ID
     * @param {HTMLElement} container - Container element
     */
    async renderBrandsBySection(sectionId, container) {
        try {
            const section = await this.catalogService.getSection(sectionId);
            if (!section) {
                container.innerHTML = '<p class="text-gray-600 dark:text-white/40">Section non trouvée</p>';
                return;
            }

            const brands = await this.catalogService.getBrandsBySection(sectionId);
            this.renderBrandsGrid(brands, section.name, container);
        } catch (error) {
            console.error('Error rendering brands:', error);
            container.innerHTML = '<p class="text-red-400">Erreur lors du chargement des marques</p>';
        }
    }

    /**
     * Render all brands from all sections
     * @param {HTMLElement} container - Container element
     */
    async renderAllBrands(container) {
        try {
            const sections = await this.catalogService.getSections();
            const allBrands = await this.catalogService.getAllBrands();
            this.renderBrandsGrid(allBrands, '', container);
        } catch (error) {
            console.error('Error rendering all brands:', error);
            container.innerHTML = '<p class="text-red-400">Erreur lors du chargement des marques</p>';
        }
    }

    /**
     * Filter and render brands based on search query
     * @param {string} query - Search query
     * @param {HTMLElement} container - Container element
     */
    async searchAndRenderBrands(query, container) {
        try {
            const brands = await this.catalogService.searchBrands(query);
            this.renderBrandsGrid(brands, '', container);
        } catch (error) {
            console.error('Error searching brands:', error);
            container.innerHTML = '<p class="text-red-400">Erreur lors de la recherche</p>';
        }
    }

    /**
     * Render brands carousel for homepage
     * @param {Array} brands - Array of brand objects
     * @param {HTMLElement} container - Container element
     */
    renderBrandsCarousel(brands, container) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        if (!brands || brands.length === 0) {
            container.innerHTML = '<p class="text-gray-600 dark:text-white/40 text-center">Aucune marque disponible</p>';
            return;
        }

        const brandsPerSlide = 6;
        const totalSlides = Math.ceil(brands.length / brandsPerSlide);
        
        let carouselHTML = `
            <div class="relative">
                <div class="brands-carousel-wrapper overflow-hidden">
                    <div class="brands-carousel-track flex transition-transform duration-500 ease-in-out" style="transform: translateX(0);">
        `;

        for (let i = 0; i < totalSlides; i++) {
            const slideBrands = brands.slice(i * brandsPerSlide, (i + 1) * brandsPerSlide);
            carouselHTML += `
                <div class="brands-carousel-slide min-w-full flex items-center justify-center gap-8 px-4">
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 w-full">
            `;
            
            slideBrands.forEach(brand => {
                const logoUrl = brand.logo_url || '';
                carouselHTML += `
                    <div class="flex flex-col items-center gap-4 group cursor-pointer hover:opacity-100 transition-opacity">
                        ${logoUrl ? `
                        <div class="bg-white dark:bg-white rounded-lg p-3 flex items-center justify-center h-[240px] md:h-[288px] w-[240px] md:w-[288px] shadow-sm border dark:border-white/10">
                            <img class="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all" 
                                 alt="${brand.name} Logo" 
                                 src="${logoUrl}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                        </div>
                        <div class="${logoUrl ? 'hidden' : 'flex'} items-center justify-center h-[192px] md:h-[240px] bg-white dark:bg-white rounded-lg p-3 border dark:border-white/10 text-gray-400 dark:text-white/30">
                            <span class="material-symbols-outlined text-2xl">image</span>
                        </div>
                        ` : `
                        <div class="flex items-center justify-center h-[192px] md:h-[240px] bg-white dark:bg-white rounded-lg p-3 border dark:border-white/10 text-gray-400 dark:text-white/30">
                            <span class="material-symbols-outlined text-2xl">image</span>
                        </div>
                        `}
                        <span class="text-[10px] font-black tracking-widest uppercase text-gray-600 dark:text-white/40 group-hover:text-primary">${brand.name}</span>
                    </div>
                `;
            });
            
            carouselHTML += `
                    </div>
                </div>
            `;
        }

        carouselHTML += `
                    </div>
                </div>
        `;

        if (totalSlides > 1) {
            carouselHTML += `
                <button class="brands-carousel-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 dark:bg-white/10 bg-gray-200 hover:bg-white/20 dark:hover:bg-white/20 hover:bg-gray-300 p-3 rounded-full transition-all z-10">
                    <span class="material-symbols-outlined text-background-dark dark:text-white">chevron_left</span>
                </button>
                <button class="brands-carousel-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 dark:bg-white/10 bg-gray-200 hover:bg-white/20 dark:hover:bg-white/20 hover:bg-gray-300 p-3 rounded-full transition-all z-10">
                    <span class="material-symbols-outlined text-background-dark dark:text-white">chevron_right</span>
                </button>
                <div class="flex justify-center gap-2 mt-8">
            `;
            
            for (let i = 0; i < totalSlides; i++) {
                carouselHTML += `
                    <button class="brands-carousel-dot w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-white/30'} cursor-pointer transition-all hover:bg-white/50" data-slide="${i}"></button>
                `;
            }
            
            carouselHTML += `</div>`;
        }

        carouselHTML += `</div>`;
        container.innerHTML = carouselHTML;

        if (totalSlides > 1) {
            this.initBrandsCarousel(container);
        }
    }

    /**
     * Initialize brands carousel functionality
     * @param {HTMLElement} container - Container element
     */
    initBrandsCarousel(container) {
        const track = container.querySelector('.brands-carousel-track');
        const slides = container.querySelectorAll('.brands-carousel-slide');
        const prevBtn = container.querySelector('.brands-carousel-prev');
        const nextBtn = container.querySelector('.brands-carousel-next');
        const dots = container.querySelectorAll('.brands-carousel-dot');
        
        let currentSlide = 0;
        const totalSlides = slides.length;

        const updateCarousel = () => {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('bg-primary', index === currentSlide);
                dot.classList.toggle('bg-white/30', index !== currentSlide);
            });
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateCarousel();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateCarousel();
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateCarousel();
            });
        });

        // Auto-play carousel
        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }, 5000);
    }

    /**
     * Load and render brands carousel from database
     * @param {HTMLElement} container - Container element
     */
    async renderBrandsCarouselFromDB(container) {
        try {
            const brands = await this.catalogService.getAllBrands();
            this.renderBrandsCarousel(brands, container);
        } catch (error) {
            console.error('Error loading brands for carousel:', error);
            container.innerHTML = '<p class="text-gray-600 dark:text-white/40 text-center">Erreur lors du chargement des marques</p>';
        }
    }

    /**
     * Render lines carousel for homepage
     * @param {Array} lines - Array of line objects with brandName, brandLogo, sectionId, sectionName
     * @param {HTMLElement} container - Container element
     */
    renderLinesCarousel(lines, container) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        // Filter lines that have valid images (very strict filtering)
        const linesWithImages = lines.filter(line => {
            const imageUrl = line.image_url;
            
            // Very strict validation
            if (!imageUrl) return false;
            if (typeof imageUrl !== 'string') return false;
            const trimmedUrl = imageUrl.trim();
            if (trimmedUrl === '' || trimmedUrl === 'null' || trimmedUrl === 'undefined') return false;
            
            // Check if it's a valid URL format
            const isValidUrl = trimmedUrl.startsWith('http://') || 
                              trimmedUrl.startsWith('https://') || 
                              trimmedUrl.startsWith('/') || 
                              trimmedUrl.startsWith('data:image');
            
            return isValidUrl;
        });
        
        if (linesWithImages.length === 0) {
            container.innerHTML = '<p class="text-gray-600 dark:text-white/40 text-center py-12">Aucune ligne avec image disponible pour le moment.</p>';
            return;
        }

        // Display 1 image per slide on mobile, 2 on tablet, 1 on desktop for maximum size
        const linesPerSlide = 1;
        const totalSlides = Math.ceil(linesWithImages.length / linesPerSlide);
        
        let carouselHTML = `
            <div class="relative">
                <div class="lines-carousel-wrapper overflow-hidden">
                    <div class="lines-carousel-track flex transition-transform duration-500 ease-in-out" style="transform: translateX(0);">
        `;

        for (let i = 0; i < totalSlides; i++) {
            const slideLines = linesWithImages.slice(i * linesPerSlide, (i + 1) * linesPerSlide);
            
            // Filter out any lines without valid images in this slide (double-check)
            const validSlideLines = slideLines.filter(line => {
                const imageUrl = line.image_url;
                if (!imageUrl || typeof imageUrl !== 'string') return false;
                const trimmedUrl = imageUrl.trim();
                return trimmedUrl !== '' && 
                       trimmedUrl !== 'null' && 
                       trimmedUrl !== 'undefined' &&
                       (trimmedUrl.startsWith('http://') || 
                        trimmedUrl.startsWith('https://') || 
                        trimmedUrl.startsWith('/') || 
                        trimmedUrl.startsWith('data:image'));
            });
            
            // Skip empty slides
            if (validSlideLines.length === 0) {
                continue;
            }
            
            carouselHTML += `
                <div class="lines-carousel-slide min-w-full flex items-center justify-center">
                    <div class="w-full">
            `;
            
            validSlideLines.forEach(line => {
                const imageUrl = line.image_url;
                const brandName = line.brandName || '';
                const lineName = line.name || '';
                const sectionId = line.sectionId || '';
                
                // Create navigation URL
                const params = new URLSearchParams({
                    brand: brandName,
                    line: lineName
                });
                if (sectionId) {
                    params.set('section', sectionId);
                }
                const navUrl = `products.html?${params.toString()}`;
                
                carouselHTML += `
                    <a href="${navUrl}" class="group lines-carousel-item block cursor-pointer w-full mb-0">
                        <div class="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border-0 hover:border-primary/50 transition-all duration-300">
                            <div class="aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] relative overflow-hidden w-full">
                                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                     alt="${lineName} - ${brandName}" 
                                     src="${imageUrl}" 
                                     onerror="this.parentElement.parentElement.parentElement.style.display='none';"/>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-300">
                                <p class="text-primary text-xs md:text-sm font-black uppercase tracking-widest mb-2">${brandName}</p>
                                <h3 class="text-2xl md:text-3xl lg:text-4xl font-black text-white group-hover:text-primary transition-colors leading-tight">${lineName}</h3>
                            </div>
                        </div>
                    </a>
                `;
            });
            
            carouselHTML += `
                    </div>
                </div>
            `;
        }

        carouselHTML += `
                    </div>
                </div>
        `;

        if (totalSlides > 1) {
            carouselHTML += `
                <div class="flex justify-center gap-2 mt-6">
            `;
            
            for (let i = 0; i < totalSlides; i++) {
                carouselHTML += `
                    <button class="lines-carousel-dot w-2 h-2 rounded-full ${i === 0 ? 'bg-primary w-8' : 'bg-white/30'} cursor-pointer transition-all hover:bg-white/50" data-slide="${i}"></button>
                `;
            }
            
            carouselHTML += `</div>`;
        }

        carouselHTML += `</div>`;
        container.innerHTML = carouselHTML;

        if (totalSlides > 1) {
            this.initLinesCarousel(container);
        }
    }

    /**
     * Initialize lines carousel functionality
     * @param {HTMLElement} container - Container element
     */
    initLinesCarousel(container) {
        const track = container.querySelector('.lines-carousel-track');
        const slides = container.querySelectorAll('.lines-carousel-slide');
        const dots = container.querySelectorAll('.lines-carousel-dot');
        
        if (!track || slides.length === 0) return;
        
        let currentSlide = 0;
        const totalSlides = slides.length;

        const updateCarousel = () => {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('bg-primary', 'w-8');
                    dot.classList.remove('bg-white/30', 'w-2');
                } else {
                    dot.classList.remove('bg-primary', 'w-8');
                    dot.classList.add('bg-white/30', 'w-2');
                }
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateCarousel();
            });
        });

        // Auto-play carousel
        let autoPlayInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }, 5000);

        // Pause on hover
        const carouselWrapper = container.querySelector('.lines-carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('mouseenter', () => {
                clearInterval(autoPlayInterval);
            });
            carouselWrapper.addEventListener('mouseleave', () => {
                autoPlayInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateCarousel();
                }, 5000);
            });
        }
    }

    /**
     * Load and render lines carousel from database
     * @param {HTMLElement} container - Container element
     */
    async renderLinesCarouselFromDB(container) {
        try {
            const allLines = await this.catalogService.getAllLinesFromAllSections();
            
            // Filter lines with valid images before rendering (very strict filtering)
            const linesWithImages = allLines.filter(line => {
                const imageUrl = line.image_url;
                
                // Very strict validation
                if (!imageUrl) return false;
                if (typeof imageUrl !== 'string') return false;
                const trimmedUrl = imageUrl.trim();
                if (trimmedUrl === '' || trimmedUrl === 'null' || trimmedUrl === 'undefined') return false;
                
                // Check if it's a valid URL format
                const isValidUrl = trimmedUrl.startsWith('http://') || 
                                  trimmedUrl.startsWith('https://') || 
                                  trimmedUrl.startsWith('/') || 
                                  trimmedUrl.startsWith('data:image');
                
                return isValidUrl;
            });
            
            console.log(`Lines carousel: ${linesWithImages.length} lines with images out of ${allLines.length} total lines`);
            
            this.renderLinesCarousel(linesWithImages, container);
        } catch (error) {
            console.error('Error loading lines for carousel:', error);
            container.innerHTML = '<p class="text-gray-600 dark:text-white/40 text-center py-12">Erreur lors du chargement des lignes</p>';
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrandsRenderer;
}

