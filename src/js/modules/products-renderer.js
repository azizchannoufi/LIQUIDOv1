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
        const productId = `${brandName.toLowerCase().replace(/\s+/g, '-')}-${line.name.toLowerCase().replace(/\s+/g, '-')}`;

        return `
            <a href="product-detail.html?id=${productId}&brand=${encodeURIComponent(brandName)}&line=${encodeURIComponent(line.name)}" 
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
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsRenderer;
}

