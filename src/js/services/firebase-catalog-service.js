/**
 * Firebase Catalog Service
 * Manages catalog data in Firebase Realtime Database
 */

class FirebaseCatalogService {
    constructor() {
        this.database = null;
        this.initialized = false;
        this.initPromise = null;
    }

    /**
     * Initialize Firebase connection
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                const { database } = await window.firebaseConfig.initializeFirebase();
                this.database = database;
                this.initialized = true;
            } catch (error) {
                console.error('Error initializing Firebase Catalog Service:', error);
                this.initPromise = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    /**
     * Get reference to catalog path
     * @returns {Object} Firebase database reference
     */
    getCatalogRef() {
        if (!this.database) {
            throw new Error('Firebase not initialized. Call initialize() first.');
        }
        return this.database.ref('catalog');
    }

    /**
     * Get all sections
     * @returns {Promise<Array>} Array of sections
     */
    async getSections() {
        await this.initialize();
        const catalogRef = this.getCatalogRef();

        console.log('🔍 Fetching sections from Firebase path: catalog/sections');

        return new Promise((resolve, reject) => {
            catalogRef.child('sections').once('value')
                .then((snapshot) => {
                    const sectionsData = snapshot.val();
                    console.log('📥 Raw sections data from Firebase:', sectionsData);

                    if (!sectionsData) {
                        console.warn('⚠️ No sections data found in Firebase at catalog/sections');
                        resolve([]);
                        return;
                    }

                    // Check if it's an array or object
                    let sections;
                    if (Array.isArray(sectionsData)) {
                        sections = sectionsData;
                        console.log('✓ Sections is an array with', sections.length, 'items');
                    } else if (typeof sectionsData === 'object') {
                        sections = Object.values(sectionsData);
                        console.log('✓ Sections converted from object to array with', sections.length, 'items');
                    } else {
                        console.error('❌ Unexpected sections data type:', typeof sectionsData);
                        sections = [];
                    }

                    console.log('📤 Returning sections:', sections);
                    resolve(sections);
                })
                .catch((error) => {
                    console.error('❌ Error fetching sections from Firebase:', error);
                    reject(error);
                });
        });
    }

    /**
     * Get section by ID
     * @param {string} sectionId - Section ID
     * @returns {Promise<Object|null>} Section object or null
     */
    async getSection(sectionId) {
        const sections = await this.getSections();
        return sections.find(section => section.id === sectionId) || null;
    }

    /**
     * Get all brands from a specific section
     * @param {string} sectionId - Section ID
     * @returns {Promise<Array>} Array of brands
     */
    async getBrandsBySection(sectionId) {
        const section = await this.getSection(sectionId);
        return section ? (section.brands || []) : [];
    }

    /**
     * Get all brands from all sections
     * @returns {Promise<Array>} Array of all brands
     */
    async getAllBrands() {
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
     * Add or update a brand
     * @param {string} sectionId - Section ID
     * @param {Object} brandData - Brand data
     * @returns {Promise<void>}
     */
    async saveBrand(sectionId, brandData) {
        await this.initialize();
        const catalogRef = this.getCatalogRef();

        // Get current sections
        const sections = await this.getSections();
        const sectionIndex = sections.findIndex(s => s.id === sectionId);

        if (sectionIndex === -1) {
            throw new Error(`Section ${sectionId} not found`);
        }

        const section = sections[sectionIndex];
        const brands = section.brands || [];

        // Check if brand already exists
        const existingBrandIndex = brands.findIndex(b => b.name === brandData.name);

        if (existingBrandIndex !== -1) {
            // Update existing brand
            brands[existingBrandIndex] = brandData;
        } else {
            // Add new brand
            brands.push(brandData);
        }

        // Update section
        section.brands = brands;

        // Save to Firebase
        return new Promise((resolve, reject) => {
            catalogRef.child('sections').child(sectionIndex.toString()).set(section)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }

    /**
     * Add or update a product line
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {Object} lineData - Product line data
     * @returns {Promise<void>}
     */
    async saveProductLine(sectionId, brandName, lineData) {
        await this.initialize();

        // Get brand or create it if it doesn't exist
        let brand = await this.getBrandByNameInSection(sectionId, brandName);

        if (!brand) {
            // Create new brand with this line
            brand = {
                name: brandName,
                logo_url: '',
                website: '',
                lines: [lineData]
            };
        } else {
            // Update brand lines
            const lines = brand.lines || [];
            const existingLineIndex = lines.findIndex(l => l.name === lineData.name);

            if (existingLineIndex !== -1) {
                lines[existingLineIndex] = lineData;
            } else {
                lines.push(lineData);
            }

            brand.lines = lines;
        }

        // Save brand
        return await this.saveBrand(sectionId, brand);
    }

    /**
     * Delete a brand
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @returns {Promise<void>}
     */
    async deleteBrand(sectionId, brandName) {
        await this.initialize();
        const sections = await this.getSections();
        const sectionIndex = sections.findIndex(s => s.id === sectionId);

        if (sectionIndex === -1) {
            throw new Error(`Section ${sectionId} not found`);
        }

        const section = sections[sectionIndex];
        const brands = section.brands || [];
        section.brands = brands.filter(b => b.name !== brandName);

        const catalogRef = this.getCatalogRef();
        return new Promise((resolve, reject) => {
            catalogRef.child('sections').child(sectionIndex.toString()).set(section)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }

    /**
     * Delete a product line
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {string} lineName - Product line name
     * @returns {Promise<void>}
     */
    async deleteProductLine(sectionId, brandName, lineName) {
        await this.initialize();
        const sections = await this.getSections();
        const sectionIndex = sections.findIndex(s => s.id === sectionId);

        if (sectionIndex === -1) {
            throw new Error(`Section ${sectionId} not found`);
        }

        const section = sections[sectionIndex];
        const brands = section.brands || [];
        const brandIndex = brands.findIndex(b => b.name === brandName);

        if (brandIndex === -1) {
            throw new Error(`Brand ${brandName} not found in section ${sectionId}`);
        }

        const brand = brands[brandIndex];
        const lines = brand.lines || [];
        brand.lines = lines.filter(l => l.name !== lineName);
        brands[brandIndex] = brand;
        section.brands = brands;

        const catalogRef = this.getCatalogRef();
        return new Promise((resolve, reject) => {
            catalogRef.child('sections').child(sectionIndex.toString()).set(section)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }

    /**
     * Listen to catalog changes (real-time updates)
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    async onCatalogChange(callback) {
        await this.initialize();
        const catalogRef = this.getCatalogRef();
        const handler = catalogRef.on('value', (snapshot) => {
            const catalog = snapshot.val();
            callback(catalog);
        });

        // Return unsubscribe function
        return () => catalogRef.off('value', handler);
    }

    /**
     * Get all product lines from all sections
     * @returns {Promise<Array>} Array of all product lines with section and brand info
     */
    async getAllLinesFromAllSections() {
        await this.initialize();

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
     * Get all products from a specific line
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {string} lineName - Product line name
     * @returns {Promise<Array>} Array of products
     */
    async getProductsByLine(sectionId, brandName, lineName) {
        await this.initialize();
        const catalogRef = this.getCatalogRef();

        return new Promise((resolve, reject) => {
            catalogRef.child('sections').once('value')
                .then((snapshot) => {
                    const sections = snapshot.val();
                    if (!sections) {
                        resolve([]);
                        return;
                    }

                    const sectionArray = Object.values(sections);
                    const section = sectionArray.find(s => s.id === sectionId);
                    if (!section || !section.brands) {
                        resolve([]);
                        return;
                    }

                    const brand = section.brands.find(b => b.name === brandName);
                    if (!brand || !brand.lines) {
                        resolve([]);
                        return;
                    }

                    const line = brand.lines.find(l => l.name === lineName);
                    if (!line || !line.products) {
                        resolve([]);
                        return;
                    }

                    const products = Object.values(line.products).map(product => ({
                        ...product,
                        sectionId: sectionId,
                        sectionName: section.name,
                        brandName: brandName,
                        brandLogo: brand.logo_url || '',
                        lineName: lineName,
                        lineImage: line.image_url || ''
                    }));

                    resolve(products);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    /**
     * Save a product to a specific line
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {string} lineName - Product line name
     * @param {Object} productData - Product data (must include images[] array for multiple images)
     * @returns {Promise<string>} Product ID
     */
    async saveProduct(sectionId, brandName, lineName, productData) {
        await this.initialize();
        const catalogRef = this.getCatalogRef();

        // Get current sections
        const sections = await this.getSections();
        const sectionIndex = sections.findIndex(s => s.id === sectionId);

        if (sectionIndex === -1) {
            throw new Error(`Section ${sectionId} not found`);
        }

        const section = sections[sectionIndex];
        const brands = section.brands || [];
        const brandIndex = brands.findIndex(b => b.name === brandName);

        if (brandIndex === -1) {
            throw new Error(`Brand ${brandName} not found in section ${sectionId}`);
        }

        const brand = brands[brandIndex];
        const lines = brand.lines || [];
        const lineIndex = lines.findIndex(l => l.name === lineName);

        if (lineIndex === -1) {
            throw new Error(`Line ${lineName} not found in brand ${brandName}`);
        }

        const line = lines[lineIndex];
        if (!line.products) {
            line.products = {};
        }

        // Generate product ID from name or use existing
        const productId = productData.id || productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // Ensure images array exists
        const images = productData.images || [];
        const imageUrl = productData.imageUrl || (images.length > 0 ? images[0] : '');

        // Prepare product data
        const productToSave = {
            id: productId,
            name: productData.name,
            description: productData.description || '',
            flavorProfile: productData.flavorProfile || '',
            imageUrl: imageUrl,
            images: images
        };

        // Save product
        line.products[productId] = productToSave;
        lines[lineIndex] = line;
        brand.lines = lines;
        brands[brandIndex] = brand;
        section.brands = brands;

        // Save to Firebase
        return new Promise((resolve, reject) => {
            catalogRef.child('sections').child(sectionIndex.toString()).set(section)
                .then(() => resolve(productId))
                .catch((error) => reject(error));
        });
    }

    /**
     * Delete a product from a specific line
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {string} lineName - Product line name
     * @param {string} productId - Product ID
     * @returns {Promise<void>}
     */
    async deleteProduct(sectionId, brandName, lineName, productId) {
        await this.initialize();
        const catalogRef = this.getCatalogRef();

        const sections = await this.getSections();
        const sectionIndex = sections.findIndex(s => s.id === sectionId);

        if (sectionIndex === -1) {
            throw new Error(`Section ${sectionId} not found`);
        }

        const section = sections[sectionIndex];
        const brands = section.brands || [];
        const brandIndex = brands.findIndex(b => b.name === brandName);

        if (brandIndex === -1) {
            throw new Error(`Brand ${brandName} not found in section ${sectionId}`);
        }

        const brand = brands[brandIndex];
        const lines = brand.lines || [];
        const lineIndex = lines.findIndex(l => l.name === lineName);

        if (lineIndex === -1) {
            throw new Error(`Line ${lineName} not found in brand ${brandName}`);
        }

        const line = lines[lineIndex];
        if (line.products && line.products[productId]) {
            delete line.products[productId];
            // If products object is empty, we can optionally remove it
            if (Object.keys(line.products).length === 0) {
                delete line.products;
            }
        }

        lines[lineIndex] = line;
        brand.lines = lines;
        brands[brandIndex] = brand;
        section.brands = brands;

        return new Promise((resolve, reject) => {
            catalogRef.child('sections').child(sectionIndex.toString()).set(section)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }

    /**
     * Get all products from a specific section
     * @param {string} sectionId - Section ID
     * @returns {Promise<Array>} Array of all products in section
     */
    async getAllProductsBySection(sectionId) {
        await this.initialize();
        const catalogRef = this.getCatalogRef();

        return new Promise((resolve, reject) => {
            catalogRef.child('sections').once('value')
                .then((snapshot) => {
                    const sections = snapshot.val();
                    if (!sections) {
                        resolve([]);
                        return;
                    }

                    const sectionArray = Object.values(sections);
                    const section = sectionArray.find(s => s.id === sectionId);
                    if (!section || !section.brands) {
                        resolve([]);
                        return;
                    }

                    const allProducts = [];

                    for (const brand of section.brands) {
                        if (!brand.lines) continue;

                        for (const line of brand.lines) {
                            if (!line.products) continue;

                            const products = Object.values(line.products);
                            for (const product of products) {
                                allProducts.push({
                                    ...product,
                                    sectionId: sectionId,
                                    sectionName: section.name,
                                    brandName: brand.name,
                                    brandLogo: brand.logo_url || '',
                                    lineName: line.name,
                                    lineImage: line.image_url || ''
                                });
                            }
                        }
                    }

                    resolve(allProducts);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    /**
     * Get all products from all sections
     * @returns {Promise<Array>} Array of all products with section, brand, and line info
     */
    async getAllProducts() {
        await this.initialize();
        const sections = await this.getSections();
        const allProducts = [];

        for (const section of sections) {
            const products = await this.getAllProductsBySection(section.id);
            allProducts.push(...products);
        }

        return allProducts;
    }
}

// Create singleton instance
const firebaseCatalogService = new FirebaseCatalogService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseCatalogService;
}

