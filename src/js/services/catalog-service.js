/**
 * Catalog Service
 * Manages catalog data loading and retrieval
 * Supports both Firebase Realtime Database and JSON fallback
 */

class CatalogService {
    constructor() {
        this.catalog = null;
        this.loadPromise = null;
        this.useFirebase = true; // Set to false to use JSON fallback
        this.firebaseService = null;
    }

    /**
     * Initialize Firebase service if available
     * @returns {Promise<void>}
     */
    async initFirebase() {
        if (!this.useFirebase || this.firebaseService) {
            return;
        }

        try {
            // Check if Firebase service is available
            if (typeof FirebaseCatalogService !== 'undefined') {
                this.firebaseService = new FirebaseCatalogService();
                await this.firebaseService.initialize();
            } else if (window.firebaseCatalogService) {
                this.firebaseService = window.firebaseCatalogService;
                await this.firebaseService.initialize();
            } else {
                // Firebase not available, fallback to JSON
                this.useFirebase = false;
            }
        } catch (error) {
            console.warn('Firebase initialization failed, falling back to JSON:', error);
            this.useFirebase = false;
        }
    }

    /**
     * Load catalog data from Firebase or JSON file
     * @returns {Promise<Object>} Catalog data
     */
    async loadCatalog() {
        if (this.catalog) {
            return this.catalog;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        // Try Firebase first
        await this.initFirebase();

        if (this.useFirebase && this.firebaseService) {
            this.loadPromise = (async () => {
                try {
                    const sections = await this.firebaseService.getSections();
                    this.catalog = { sections };
                    return this.catalog;
                } catch (error) {
                    console.warn('Firebase load failed, falling back to JSON:', error);
                    this.useFirebase = false;
                    try {
                        return await this.loadFromJSON();
                    } catch (jsonError) {
                        console.warn('JSON fallback also failed, using empty catalog:', jsonError);
                        this.catalog = { sections: [] };
                        return this.catalog;
                    }
                }
            })();
        } else {
            this.loadPromise = (async () => {
                try {
                    return await this.loadFromJSON();
                } catch (error) {
                    console.warn('JSON load failed, using empty catalog:', error);
                    this.catalog = { sections: [] };
                    return this.catalog;
                }
            })();
        }

        return this.loadPromise;
    }

    /**
     * Load catalog from JSON file (fallback)
     * @returns {Promise<Object>} Catalog data
     */
    async loadFromJSON() {
        // Try different paths based on current location
        const currentPath = window.location.pathname;
        let basePath = '';
        
        if (currentPath.includes('/admin/')) {
            basePath = '../../';
        } else if (currentPath.includes('/public/')) {
            basePath = '../';
        } else {
            basePath = './';
        }
        
        const paths = [
            `${basePath}src/data/catalog.json`,
            '../src/data/catalog.json',
            'src/data/catalog.json',
            './src/data/catalog.json'
        ];
        
        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    this.catalog = data.catalog || data;
                    return this.catalog;
                }
            } catch (error) {
                // Try next path
                continue;
            }
        }
        
        // If all paths fail, return empty catalog structure
        console.warn('Could not load catalog.json, using empty catalog structure');
        this.catalog = { sections: [] };
        return this.catalog;
    }

    /**
     * Get all sections
     * @returns {Promise<Array>} Array of sections
     */
    async getSections() {
        await this.loadCatalog();
        
        if (this.useFirebase && this.firebaseService) {
            try {
                return await this.firebaseService.getSections();
            } catch (error) {
                console.warn('Error getting sections from Firebase, using cached catalog:', error);
                return this.catalog?.sections || [];
            }
        }
        
        return this.catalog?.sections || [];
    }

    /**
     * Get section by ID
     * @param {string} sectionId - Section ID
     * @returns {Promise<Object|null>} Section object or null
     */
    async getSection(sectionId) {
        await this.loadCatalog();
        
        if (this.useFirebase && this.firebaseService) {
            try {
                return await this.firebaseService.getSection(sectionId);
            } catch (error) {
                console.warn('Error getting section from Firebase, using cached catalog:', error);
                const sections = await this.getSections();
                return sections.find(section => section.id === sectionId) || null;
            }
        }
        
        const sections = await this.getSections();
        return sections.find(section => section.id === sectionId) || null;
    }

    /**
     * Get all brands from a specific section
     * @param {string} sectionId - Section ID
     * @returns {Promise<Array>} Array of brands
     */
    async getBrandsBySection(sectionId) {
        await this.loadCatalog();
        
        if (this.useFirebase && this.firebaseService) {
            try {
                return await this.firebaseService.getBrandsBySection(sectionId);
            } catch (error) {
                console.warn('Error getting brands from Firebase, using cached catalog:', error);
                const section = await this.getSection(sectionId);
                return section ? (section.brands || []) : [];
            }
        }
        
        const section = await this.getSection(sectionId);
        return section ? (section.brands || []) : [];
    }

    /**
     * Get all brands from all sections
     * @returns {Promise<Array>} Array of all brands
     */
    async getAllBrands() {
        await this.initFirebase();
        
        if (this.useFirebase && this.firebaseService) {
            return await this.firebaseService.getAllBrands();
        }
        
        const sections = await this.getSections();
        return sections.flatMap(section => section.brands || []);
    }

    /**
     * Get brand by name
     * @param {string} brandName - Brand name
     * @returns {Promise<Object|null>} Brand object or null
     */
    async getBrandByName(brandName) {
        const brands = await this.getAllBrands();
        return brands.find(brand => brand.name.toLowerCase() === brandName.toLowerCase()) || null;
    }

    /**
     * Get brand by name from a specific section
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @returns {Promise<Object|null>} Brand object or null
     */
    async getBrandByNameInSection(sectionId, brandName) {
        const brands = await this.getBrandsBySection(sectionId);
        return brands.find(brand => brand.name.toLowerCase() === brandName.toLowerCase()) || null;
    }

    /**
     * Get product lines for a brand
     * @param {string} brandName - Brand name
     * @param {string} sectionId - Optional section ID to narrow search
     * @returns {Promise<Array>} Array of product lines
     */
    async getBrandLines(brandName, sectionId = null) {
        let brand;
        if (sectionId) {
            brand = await this.getBrandByNameInSection(sectionId, brandName);
        } else {
            brand = await this.getBrandByName(brandName);
        }
        return brand ? (brand.lines || []) : [];
    }

    /**
     * Get all product lines from a section
     * @param {string} sectionId - Section ID
     * @returns {Promise<Array>} Array of all product lines in section
     */
    async getAllLinesBySection(sectionId) {
        await this.loadCatalog();
        
        if (this.useFirebase && this.firebaseService) {
            try {
                return await this.firebaseService.getAllLinesBySection(sectionId);
            } catch (error) {
                console.warn('Error getting lines from Firebase, using cached catalog:', error);
                const brands = await this.getBrandsBySection(sectionId);
                return brands.flatMap(brand => 
                    (brand.lines || []).map(line => ({
                        ...line,
                        brandName: brand.name,
                        brandLogo: brand.logo_url
                    }))
                );
            }
        }
        
        const brands = await this.getBrandsBySection(sectionId);
        return brands.flatMap(brand => 
            (brand.lines || []).map(line => ({
                ...line,
                brandName: brand.name,
                brandLogo: brand.logo_url
            }))
        );
    }

    /**
     * Search brands by name
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching brands
     */
    async searchBrands(query) {
        const brands = await this.getAllBrands();
        const lowerQuery = query.toLowerCase();
        return brands.filter(brand => 
            brand.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get brands with product lines only
     * @param {string} sectionId - Optional section ID
     * @returns {Promise<Array>} Array of brands that have product lines
     */
    async getBrandsWithLines(sectionId = null) {
        let brands;
        if (sectionId) {
            brands = await this.getBrandsBySection(sectionId);
        } else {
            brands = await this.getAllBrands();
        }
        return brands.filter(brand => brand.lines && brand.lines.length > 0);
    }

    /**
     * Get all product lines from all sections
     * @returns {Promise<Array>} Array of all product lines with section and brand info
     */
    async getAllLinesFromAllSections() {
        await this.initFirebase();
        
        if (this.useFirebase && this.firebaseService) {
            return await this.firebaseService.getAllLinesFromAllSections();
        }
        
        const sections = await this.getSections();
        const allLines = [];
        
        for (const section of sections) {
            const lines = await this.getAllLinesBySection(section.id);
            for (const line of lines) {
                allLines.push({
                    ...line,
                    sectionId: section.id,
                    sectionName: section.name
                });
            }
        }
        
        return allLines;
    }

    /**
     * Save brand to Firebase
     * @param {string} sectionId - Section ID
     * @param {Object} brandData - Brand data
     * @returns {Promise<void>}
     */
    async saveBrand(sectionId, brandData) {
        await this.initFirebase();
        
        if (!this.useFirebase || !this.firebaseService) {
            throw new Error('Firebase not available. Cannot save brand.');
        }
        
        return await this.firebaseService.saveBrand(sectionId, brandData);
    }

    /**
     * Save product line to Firebase
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {Object} lineData - Product line data
     * @returns {Promise<void>}
     */
    async saveProductLine(sectionId, brandName, lineData) {
        await this.initFirebase();
        
        if (!this.useFirebase || !this.firebaseService) {
            throw new Error('Firebase not available. Cannot save product line.');
        }
        
        return await this.firebaseService.saveProductLine(sectionId, brandName, lineData);
    }

    /**
     * Delete brand from Firebase
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @returns {Promise<void>}
     */
    async deleteBrand(sectionId, brandName) {
        await this.initFirebase();
        
        if (!this.useFirebase || !this.firebaseService) {
            throw new Error('Firebase not available. Cannot delete brand.');
        }
        
        return await this.firebaseService.deleteBrand(sectionId, brandName);
    }

    /**
     * Delete product line from Firebase
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {string} lineName - Product line name
     * @returns {Promise<void>}
     */
    async deleteProductLine(sectionId, brandName, lineName) {
        await this.initFirebase();
        
        if (!this.useFirebase || !this.firebaseService) {
            throw new Error('Firebase not available. Cannot delete product line.');
        }
        
        return await this.firebaseService.deleteProductLine(sectionId, brandName, lineName);
    }
    
    /**
     * Get all brands from all sections
     * @returns {Promise<Array>} Array of brand objects with section info
     */
    async getAllBrands() {
        await this.initFirebase();
        
        if (!this.useFirebase || !this.firebaseService) {
            const sections = await this.getSections();
            const allBrands = [];
            const seen = new Set();
            
            for (const section of sections) {
                const brands = await this.getBrandsBySection(section.id);
                for (const brand of brands) {
                    const key = `${section.id}-${brand.name}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        allBrands.push({
                            ...brand,
                            sectionId: section.id,
                            sectionName: section.name
                        });
                    }
                }
            }
            return allBrands;
        }
        
        return await this.firebaseService.getAllBrands();
    }
}

// Create singleton instance
const catalogService = new CatalogService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = catalogService;
}

