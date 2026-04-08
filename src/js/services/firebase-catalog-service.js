/**
 * Firebase Catalog Service
 * Manages catalog data in Firebase Realtime Database
 */

class FirebaseCatalogService {
    constructor() {
        this.firestore = null;
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
                const { firestore } = await window.firebaseConfig.initializeFirebase();
                if (!firestore) {
                    throw new Error('Firestore is not initialized. Make sure firebase-firestore-compat.js is loaded before this script.');
                }
                this.firestore = firestore;
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
     * Get all sections
     * @returns {Promise<Array>} Array of sections
     */
    async getSections() {
        await this.initialize();

        console.log('🔍 Fetching sections from Firestore collection: sections');

        try {
            const snapshot = await this.firestore.collection('sections').get();

            if (snapshot.empty) {
                console.warn('⚠️ No sections found in Firestore');
                return [];
            }

            const sections = snapshot.docs.map(doc => {
                const data = doc.data();
                // Ensure ID is included (it should be in document ID, but also maybe in data)
                return {
                    id: doc.id,
                    ...data
                };
            });

            console.log(`✓ Fetched ${sections.length} sections`);
            return sections;
        } catch (error) {
            console.error('❌ Error fetching sections from Firestore:', error);
            throw error;
        }
    }

    /**
     * Get section by ID
     * @param {string} sectionId - Section ID
     * @returns {Promise<Object|null>} Section object or null
     */
    async getSection(sectionId) {
        await this.initialize();

        try {
            const doc = await this.firestore.collection('sections').doc(sectionId).get();

            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error(`Error getting section ${sectionId}:`, error);
            return null;
        }
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
        return brands.flatMap(brand => {
            // For backward compat: device brands may still have old `products` array
            const lines = brand.lines && brand.lines.length > 0
                ? brand.lines
                : (brand.products && brand.products.length > 0 ? brand.products : []);
            return lines.map(line => ({
                ...line,
                brandName: brand.name,
                brandLogo: brand.logo_url,
                brandType: brand.type || 'liquid',
                // Normalize image_url from the first entry in images[] if missing
                image_url: line.image_url
                    || (line.images && line.images.length > 0 ? line.images[0] : ''),
                images: line.images && line.images.length > 0
                    ? line.images
                    : (line.image_url ? [line.image_url] : [])
            }));
        });
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

        try {
            const sectionRef = this.firestore.collection('sections').doc(sectionId);
            const doc = await sectionRef.get();

            if (!doc.exists) {
                // Try to create it?, or throw? 
                // Previous logic threw if index -1.
                throw new Error(`Section ${sectionId} not found`);
            }

            const section = doc.data();
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

            // Update section in Firestore
            await sectionRef.update({ brands: brands });

        } catch (error) {
            console.error('Error saving brand:', error);
            throw error;
        }
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
     * Update specific fields of a brand (e.g. active status, display order)
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @param {Object} fields - Fields to update (e.g. { active: false, order: 2 })
     * @returns {Promise<void>}
     */
    async updateBrandField(sectionId, brandName, fields) {
        await this.initialize();

        try {
            const sectionRef = this.firestore.collection('sections').doc(sectionId);
            const doc = await sectionRef.get();

            if (!doc.exists) {
                throw new Error(`Section ${sectionId} not found`);
            }

            const section = doc.data();
            const brands = section.brands || [];
            const brandIndex = brands.findIndex(b => b.name === brandName);

            if (brandIndex === -1) {
                throw new Error(`Brand ${brandName} not found in section ${sectionId}`);
            }

            // Merge new fields into the existing brand object
            brands[brandIndex] = { ...brands[brandIndex], ...fields };

            await sectionRef.update({ brands: brands });
        } catch (error) {
            console.error('Error updating brand field:', error);
            throw error;
        }
    }

    /**
     * Delete a brand
     * @param {string} sectionId - Section ID
     * @param {string} brandName - Brand name
     * @returns {Promise<void>}
     */
    async deleteBrand(sectionId, brandName) {
        await this.initialize();

        try {
            const sectionRef = this.firestore.collection('sections').doc(sectionId);
            const doc = await sectionRef.get();

            if (!doc.exists) {
                throw new Error(`Section ${sectionId} not found`);
            }

            const section = doc.data();
            let brands = section.brands || [];

            // Filter out the brand
            const initialLength = brands.length;
            brands = brands.filter(b => b.name !== brandName);

            if (brands.length === initialLength) {
                // Brand not found, maybe no-op or warning?
                console.warn(`Brand ${brandName} not found in section ${sectionId} to delete.`);
            }

            await sectionRef.update({ brands: brands });
        } catch (error) {
            console.error('Error deleting brand:', error);
            throw error;
        }
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

        try {
            const sectionRef = this.firestore.collection('sections').doc(sectionId);
            const doc = await sectionRef.get();

            if (!doc.exists) {
                throw new Error(`Section ${sectionId} not found`);
            }

            const section = doc.data();
            const brands = section.brands || [];
            const brandIndex = brands.findIndex(b => b.name === brandName);

            if (brandIndex === -1) {
                throw new Error(`Brand ${brandName} not found in section ${sectionId}`);
            }

            const brand = brands[brandIndex];
            let lines = brand.lines || [];

            // Filter out the line
            const initialLength = lines.length;
            lines = lines.filter(l => l.name !== lineName);

            if (lines.length === initialLength) {
                console.warn(`Line ${lineName} not found in brand ${brandName}`);
            }

            brand.lines = lines;
            brands[brandIndex] = brand;

            section.brands = brands;

            await sectionRef.update({ brands: brands });
        } catch (error) {
            console.error('Error deleting product line:', error);
            throw error;
        }
    }

    /**
     * Listen to catalog changes (real-time updates)
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    async onCatalogChange(callback) {
        await this.initialize();
        const collectionRef = this.firestore.collection('sections');

        const unsubscribe = collectionRef.onSnapshot((snapshot) => {
            const sections = [];
            snapshot.forEach(doc => {
                sections.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Return in the structure expected by the app (object with sections array)
            // Or if existing app expects the whole catalog object:
            // The original code was retrieving 'catalog' node.
            // If the app expects { sections: [...] } we provide that.
            callback({ sections: sections });
        }, (error) => {
            console.error('Error listening to catalog changes:', error);
        });

        // Return unsubscribe function
        return unsubscribe;
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

        try {
            const doc = await this.firestore.collection('sections').doc(sectionId).get();

            if (!doc.exists) {
                return [];
            }

            const section = doc.data();
            // section.brands should be an array
            const brands = section.brands || [];

            const brand = brands.find(b => b.name === brandName);
            if (!brand || !brand.lines) {
                return [];
            }

            const line = brand.lines.find(l => l.name === lineName);
            if (!line || !line.products) {
                return [];
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

            return products;
        } catch (error) {
            console.error('Error getting products by line:', error);
            throw error;
        }
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

        try {
            const sectionRef = this.firestore.collection('sections').doc(sectionId);
            const doc = await sectionRef.get();

            if (!doc.exists) {
                throw new Error(`Section ${sectionId} not found`);
            }

            const section = doc.data();
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

            await sectionRef.update({ brands: brands });
            return productId;
        } catch (error) {
            console.error('Error saving product:', error);
            throw error;
        }
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

        try {
            const sectionRef = this.firestore.collection('sections').doc(sectionId);
            const doc = await sectionRef.get();

            if (!doc.exists) {
                throw new Error(`Section ${sectionId} not found`);
            }

            const section = doc.data();
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

            await sectionRef.update({ brands: brands });
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    /**
     * Get all products from a specific section
     * @param {string} sectionId - Section ID
     * @returns {Promise<Array>} Array of all products in section
     */
    async getAllProductsBySection(sectionId) {
        await this.initialize();

        try {
            const doc = await this.firestore.collection('sections').doc(sectionId).get();

            if (!doc.exists) {
                return [];
            }

            const section = doc.data();
            // Just returning the internal logic to extract products from brands->lines->products
            const allProducts = [];

            if (section.brands) {
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
            }

            return allProducts;
        } catch (error) {
            console.error('Error getting all products by section:', error);
            throw error;
        }
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

