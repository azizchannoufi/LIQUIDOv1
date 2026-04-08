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
            const allBrandsRaw = await this.catalogService.getAllBrands();
            // Filter inactive brands and sort by order
            const allBrands = allBrandsRaw
                .filter(b => b.active !== false)
                .sort((a, b) => (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99));
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
            container.innerHTML = '<p class="text-gray-600 text-center py-4">Nessuna marca disponibile</p>';
            return;
        }

        // Use ALL brands; show logo if available, else show name as text
        const brandsToShow = brands.filter(b => b && b.name);

        if (brandsToShow.length === 0) {
            container.innerHTML = '<p class="text-gray-600 text-center py-4">Nessuna marca disponibile</p>';
            return;
        }

        // Triple the brands for seamless infinite loop
        const duplicatedBrands = [...brandsToShow, ...brandsToShow, ...brandsToShow];

        let carouselHTML = `
            <div class="relative">
                <div class="brands-carousel-wrapper" style="overflow:hidden;">
                    <div class="brands-carousel-track" id="brands-track-inner" style="display:flex; will-change:transform;">
        `;

        duplicatedBrands.forEach(brand => {
            // Prefer loop_logo_url if available, else fallback to logo_url
            const displayLogoUrl = brand.loop_logo_url || brand.logo_url;
            const hasLogo = displayLogoUrl && displayLogoUrl.trim() !== '';
            
            carouselHTML += `
                <div class="brands-carousel-item" style="flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; width:200px; height:100px; margin-right:48px;">
                    ${hasLogo
                    ? `<img style="max-height:80px; max-width:180px; width:auto; height:auto; object-fit:contain; filter:grayscale(1) brightness(0); opacity:0.7; transition:all 0.3s;"
                               alt="${brand.name}"
                               src="${displayLogoUrl}"
                               onmouseover="this.style.filter='grayscale(0) brightness(1)'; this.style.opacity='1';"
                               onmouseout="this.style.filter='grayscale(1) brightness(0)'; this.style.opacity='0.7';"
                               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                          <span style="display:none; font-weight:900; font-size:1rem; text-transform:uppercase; letter-spacing:0.1em; color:#333;">${brand.name}</span>`
                    : `<span style="font-weight:900; font-size:1rem; text-transform:uppercase; letter-spacing:0.1em; color:#333; text-align:center; padding:0 8px;">${brand.name}</span>`
                }
                </div>
            `;
        });

        carouselHTML += `
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = carouselHTML;

        // Initialize animation after DOM is ready
        setTimeout(() => {
            const track = container.querySelector('#brands-track-inner');
            if (track) {
                const itemWidth = 200 + 48; // width + margin
                const totalWidth = itemWidth * brandsToShow.length;
                const duration = Math.max(10, brandsToShow.length * 3);

                // Use a unique animation name to avoid conflicts with global CSS
                const animName = 'brandsScrollDynamic';

                if (!document.getElementById('brands-carousel-style')) {
                    const style = document.createElement('style');
                    style.id = 'brands-carousel-style';
                    style.textContent = `
                        @keyframes ${animName} {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-${totalWidth}px); }
                        }
                        #brands-track-inner { animation: ${animName} ${duration}s linear infinite; }
                        .brands-carousel-wrapper:hover #brands-track-inner { animation-play-state: paused; }
                    `;
                    document.head.appendChild(style);
                }
            }
        }, 100);
    }

    /**
     * Initialize brands carousel functionality
     * @param {HTMLElement} container - Container element
     */
    initBrandsCarousel(container) {
        // Animation is handled by CSS, no JavaScript needed for infinite scroll
        // The carousel will automatically loop infinitely
    }

    /**
     * Load and render brands carousel from database
     * @param {HTMLElement} container - Container element
     */
    async renderBrandsCarouselFromDB(container) {
        try {
            const allBrands = await this.catalogService.getAllBrands();
            // Filter inactive brands and sort by order for the homepage carousel
            const brands = allBrands
                .filter(b => b.active !== false)
                .sort((a, b) => (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99));
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
                const navUrl = `line-products.html?${params.toString()}`;

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

    /**
     * Render lines in a Zig-Zag layout
     * @param {HTMLElement} container - Container element
     */
    /**
     * Render lines in a Zig-Zag layout (Internal helper or for direct use)
     * @param {Array} lines - Array of line objects
     * @param {HTMLElement} container - Container element
     */
    renderSpecificLinesZigZag(lines, container) {
        // Filter lines with valid images before rendering
        const linesWithImages = lines.filter(line => {
            const imageUrl = line.image_url;
            if (!imageUrl) return false;
            if (typeof imageUrl !== 'string') return false;
            const trimmedUrl = imageUrl.trim();
            if (trimmedUrl === '' || trimmedUrl === 'null' || trimmedUrl === 'undefined') return false;
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

        let html = '<div class="flex flex-col gap-20 py-10">';

        linesWithImages.forEach((line, index) => {
            const isEven = index % 2 === 0;
            const rowClass = isEven ? 'flex-row' : 'flex-row-reverse';
            const textSlideClass = isEven ? 'from-left' : 'from-right';
            const imageSlideClass = isEven ? 'from-right' : 'from-left';

            const brandName = line.brandName || '';
            const lineName = line.name || '';
            const imageUrl = line.image_url;
            const description = line.description || `Scopri la linea ${lineName} di ${brandName}. Un'esperienza di svapo unica con aromi selezionati e qualità premium.`;

            const params = new URLSearchParams({
                brand: brandName,
                line: lineName
            });
            if (line.sectionId) params.set('section', line.sectionId);
            const navUrl = `line-products.html?${params.toString()}`;

            html += `
                <div class="flex hidden md:flex ${rowClass} items-center justify-between gap-10 lg:gap-20 group relative">
                    <!-- Text Side -->
                    <div class="flex-1 w-full lg:w-1/2 scroll-animate ${textSlideClass}">
                         <div class="space-y-6 ${isEven ? 'text-left' : 'text-right'}">
                            <div class="space-y-2">
                                <h3 class="text-primary text-sm font-black uppercase tracking-[0.2em]">${brandName}</h3>
                                <h2 class="text-4xl lg:text-5xl font-black text-background-dark dark:text-white uppercase leading-none">${lineName}</h2>
                            </div>
                            <p class="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg ${isEven ? 'mr-auto' : 'ml-auto'}">
                                ${description}
                            </p>
                            <div class="${isEven ? '' : 'flex justify-end'}">
                                <a href="${navUrl}" class="inline-flex items-center gap-3 px-8 py-4 bg-background-dark text-white hover:bg-primary hover:text-background-dark transition-all duration-300 uppercase font-black tracking-widest text-xs rounded-sm group-btn">
                                    Vedi Catalogo
                                    <span class="material-symbols-outlined group-btn-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </a>
                            </div>
                         </div>
                    </div>

                    <!-- Image Side -->
                    <div class="flex-1 w-full lg:w-1/2 scroll-animate ${imageSlideClass}">
                        <div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-2xl group-hover:shadow-primary/20 transition-all duration-500">
                            <img src="${imageUrl}" alt="${lineName}" class="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                        </div>
                    </div>
                </div>

                <!-- Mobile View (Always Vertical) -->
                <div class="flex md:hidden flex-col gap-6 group relative scroll-animate from-bottom">
                     <div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
                        <img src="${imageUrl}" alt="${lineName}" class="w-full h-full object-cover">
                     </div>
                     <div class="space-y-4 text-center">
                        <h3 class="text-primary text-xs font-black uppercase tracking-[0.2em]">${brandName}</h3>
                        <h2 class="text-3xl font-black text-background-dark dark:text-white uppercase">${lineName}</h2>
                        <p class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                            ${description}
                        </p>
                        
                     </div>
                </div>
            `;

            if (index < linesWithImages.length - 1) {
                html += `
                    <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-12 lg:my-20 opacity-30"></div>
                `;
            }
        });

        html += '</div>';
        container.innerHTML = html;

        this.initScrollObserver(container);
    }

    /**
     * Render lines in a Zig-Zag layout (fetches all lines)
     * @param {HTMLElement} container - Container element
     */
    async renderLinesZigZag(container) {
        try {
            const allLines = await this.catalogService.getAllLinesFromAllSections();
            this.renderSpecificLinesZigZag(allLines, container);
        } catch (error) {
            console.error('Error rendering zig-zag lines:', error);
            container.innerHTML = '<p class="text-red-400 text-center">Errore nel caricamento delle linee.</p>';
        }
    }

    /**
     * Render a grid of Brand Logos + Names
     * @param {HTMLElement} container - Container element
     */
    /**
     * Render brands in a Zig-Zag layout (similar to lines)
     * @param {HTMLElement} container - Container element
     */
    async renderBrandsZigZag(container) {
        try {
            const allBrands = await this.catalogService.getAllBrands();

            // Filter: liquid brands only, active only, sorted by order
            const brandsToDisplay = allBrands
                .filter(b => b.type === 'liquid' && b.active !== false)
                .sort((a, b) => (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99));

            if (brandsToDisplay.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-12">Nessun marchio trovato.</p>';
                return;
            }

            let html = '<div class="flex flex-col gap-8 py-4">';

            brandsToDisplay.forEach((brand, index) => {
                const isEven = index % 2 === 0;
                const rowClass = isEven ? 'flex-row' : 'flex-row-reverse';
                const textSlideClass = isEven ? 'from-left' : 'from-right';
                const imageSlideClass = isEven ? 'from-right' : 'from-left';

                const brandName = brand.name || 'Brand';
                const logoUrl = brand.logo_url;
                const hasLogo = logoUrl && logoUrl.trim() !== '';

                // Construct a default description if none exists
                const lineCount = brand.lines ? brand.lines.length : 0;
                const description = brand.description || `Scopri l'eccellenza di ${brandName}. ${lineCount > 0 ? `Esplora le nostre ${lineCount} linee esclusive.` : 'Partner ufficiale Liquido.'} Qualità premium e sapori indimenticabili.`;

                // Navigation URL
                const navUrl = `brand-lines.html?brand=${encodeURIComponent(brandName)}`;

                html += `
                    <div class="flex hidden md:flex ${rowClass} items-center justify-between gap-10 lg:gap-20 group relative">
                        <!-- Text Side -->
                        <div class="flex-1 w-full lg:w-1/2 scroll-animate ${textSlideClass}">
                             <div class="space-y-6 ${isEven ? 'text-left' : 'text-right'}">
                                <div class="space-y-2">
                                    <h3 class="text-primary text-sm font-black uppercase tracking-[0.2em]"> Liquidi</h3>
                                    <h2 class="text-4xl lg:text-5xl font-black text-background-dark dark:text-white uppercase leading-none">${brandName}</h2>
                                </div>
                                <p class="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg ${isEven ? 'mr-auto' : 'ml-auto'}">
                                    ${description}
                                </p>
                                <div class="${isEven ? '' : 'flex justify-end'}">
                                    <a href="${navUrl}" class="inline-flex items-center gap-3 px-8 py-4 bg-background-dark text-white hover:bg-primary hover:text-background-dark transition-all duration-300 uppercase font-black tracking-widest text-xs rounded-sm group-btn">
                                        CATALOGO
                                        <span class="material-symbols-outlined group-btn-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </a>
                                </div>
                             </div>
                        </div>

                        <!-- Image Side (Brand Logo/Image) -->
                        <div class="flex-1 w-full lg:w-1/2 scroll-animate ${imageSlideClass}">
                            <div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 bg-white border border-gray-100 flex items-center justify-center">
                                ${hasLogo ?
                        `<img src="${logoUrl}" alt="${brandName}" class="w-full h-full object-cover transition-all duration-500 transform scale-100 group-hover:scale-110">` :
                        `<div class="flex flex-col items-center justify-center text-gray-300"><span class="material-symbols-outlined text-6xl">image_not_supported</span><span class="mt-4 font-bold uppercase tracking-widest text-xs">Logo non disponibile</span></div>`
                    }
                                <div class="absolute inset-0 bg-transparent mix-blend-multiply"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile View (Always Vertical) -->
                    <div class="flex md:hidden flex-col gap-6 group relative scroll-animate from-bottom">
                         <div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg bg-white border border-gray-100 flex items-center justify-center">
                            ${hasLogo ?
                        `<img src="${logoUrl}" alt="${brandName}" class="w-full h-full object-cover">` :
                        `<span class="material-symbols-outlined text-4xl text-gray-300">image_not_supported</span>`
                    }
                         </div>
                         <div class="space-y-4 text-center">
                            <h3 class="text-primary text-xs font-black uppercase tracking-[0.2em]">Brand Liquidi</h3>
                            <h2 class="text-3xl font-black text-background-dark dark:text-white uppercase">${brandName}</h2>
                            <p class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                ${description}
                            </p>
                          
                         </div>
                    </div>
                `;

                if (index < brandsToDisplay.length - 1) {
                    html += `
                        <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6 lg:my-8 opacity-30"></div>
                    `;
                }
            });

            html += '</div>';
            container.innerHTML = html;

            this.initScrollObserver(container);

        } catch (error) {
            console.error('Error rendering brand logos grid:', error);
            container.innerHTML = '<p class="text-center text-red-400">Errore nel caricamento dei marchi.</p>';
        }
    }

    /**
     * Render DEVICE brands in a Zig-Zag layout (alternating text-left/right + image-right/left)
     * Identical to renderBrandsZigZag but filtered on type === 'device'
     * @param {HTMLElement} container - Container element
     */
    async renderDeviceBrandsZigZag(container) {
        try {
            const allBrands = await this.catalogService.getAllBrands();

            // Filter: device brands only, active only, sorted by order
            const brandsToDisplay = allBrands
                .filter(b => b.type === 'device' && b.active !== false)
                .sort((a, b) => (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99));

            if (brandsToDisplay.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-12">Nessun brand dispositivi trovato.</p>';
                return;
            }

            let html = '<div class="flex flex-col gap-8 py-4">';

            brandsToDisplay.forEach((brand, index) => {
                const isEven = index % 2 === 0;
                const rowClass = isEven ? 'flex-row' : 'flex-row-reverse';
                const textSlideClass = isEven ? 'from-left' : 'from-right';
                const imageSlideClass = isEven ? 'from-right' : 'from-left';

                const brandName = brand.name || 'Brand';
                const logoUrl = brand.logo_url;
                const hasLogo = logoUrl && logoUrl.trim() !== '';

                // Get lines — prefer brand.lines, fallback to brand.products (legacy)
                const allLines = brand.lines && brand.lines.length > 0
                    ? brand.lines
                    : (brand.products && brand.products.length > 0 ? brand.products : []);
                const lineCount = allLines.length;

                const description = brand.description || `Scopri i dispositivi ${brandName}. ${lineCount > 0 ? `Esplora le nostre ${lineCount} linee disponibili.` : 'Brand ufficiale partner di Liquido.'} Tecnologia avanzata e qualità costruttiva premium.`;

                const navUrl = `brand-lines.html?brand=${encodeURIComponent(brandName)}`;

                // Image side: prefer logo, then placeholder
                const desktopImageBlock = hasLogo
                        ? `<div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 bg-white border border-gray-100 flex items-center justify-center">
                           <img src="${logoUrl}" alt="${brandName}" class="w-full h-full object-cover transition-all duration-500 transform scale-100 group-hover:scale-110">
                           <div class="absolute inset-0 bg-transparent mix-blend-multiply"></div>
                       </div>`
                        : `<div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-2xl bg-gray-100 flex items-center justify-center">
                           <div class="flex flex-col items-center justify-center text-gray-300">
                               <span class="material-symbols-outlined text-6xl">devices</span>
                               <span class="mt-4 font-bold uppercase tracking-widest text-xs">Image bientôt</span>
                           </div>
                       </div>`;

                const mobileImageBlock = hasLogo
                        ? `<div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg bg-white border border-gray-100 flex items-center justify-center">
                           <img src="${logoUrl}" alt="${brandName}" class="w-full h-full object-cover">
                       </div>`
                        : `<div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg bg-gray-100 flex items-center justify-center">
                           <span class="material-symbols-outlined text-4xl text-gray-300">devices</span>
                       </div>`;

                html += `
                    <div class="flex hidden md:flex ${rowClass} items-center justify-between gap-10 lg:gap-20 group relative">
                        <!-- Text Side -->
                        <div class="flex-1 w-full lg:w-1/2 scroll-animate ${textSlideClass}">
                             <div class="space-y-6 ${isEven ? 'text-left' : 'text-right'}">
                                <div class="space-y-2">
                                    <h3 class="text-primary text-sm font-black uppercase tracking-[0.2em]">DISPOSITIVI</h3>
                                    <h2 class="text-4xl lg:text-5xl font-black text-background-dark dark:text-white uppercase leading-none">${brandName}</h2>
                                </div>
                                <p class="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg ${isEven ? 'mr-auto' : 'ml-auto'}">
                                    ${description}
                                </p>
                                <div class="${isEven ? '' : 'flex justify-end'}">
                                    <a href="${navUrl}" class="inline-flex items-center gap-3 px-8 py-4 bg-background-dark text-white hover:bg-primary hover:text-background-dark transition-all duration-300 uppercase font-black tracking-widest text-xs rounded-sm">
                                        CATALOGO
                                        <span class="material-symbols-outlined transition-transform">arrow_forward</span>
                                    </a>
                                </div>
                             </div>
                        </div>

                        <!-- Image Side -->
                        <div class="flex-1 w-full lg:w-1/2 scroll-animate ${imageSlideClass}">
                            ${desktopImageBlock}
                        </div>
                    </div>

                    <!-- Mobile View (Always Vertical) -->
                    <div class="flex md:hidden flex-col gap-6 group relative scroll-animate from-bottom">
                         ${mobileImageBlock}
                         <div class="space-y-4 text-center">
                            <h3 class="text-primary text-xs font-black uppercase tracking-[0.2em]">DISPOSITIVI</h3>
                            <h2 class="text-3xl font-black text-background-dark dark:text-white uppercase">${brandName}</h2>
                            <p class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                ${description}
                            </p>
                           
                         </div>
                    </div>
                `;

                if (index < brandsToDisplay.length - 1) {
                    html += `
                        <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6 lg:my-8 opacity-30"></div>
                    `;
                }
            });

            html += '</div>';
            container.innerHTML = html;

            this.initScrollObserver(container);

        } catch (error) {
            console.error('Error rendering device brands zig-zag:', error);
            container.innerHTML = '<p class="text-center text-red-400">Errore nel caricamento dei brand dispositivi.</p>';
        }
    }

    initScrollObserver(container) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        if (container) {
            const animatedElements = container.querySelectorAll('.scroll-animate');
            animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    }
}


// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrandsRenderer;
}

