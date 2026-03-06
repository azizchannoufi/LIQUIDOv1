/**
 * LIQUIDO Search Service
 * Searches brands, product lines, products from Firebase
 * + static site pages and FAQ questions.
 */

class LiquidoSearchService {
    constructor() {
        this._cache = null;
        this._loading = false;
        this._loadPromise = null;
    }

    /** Static index: pages & FAQ entries */
    _getStaticIndex() {
        return [
            // ── Pages ──
            { type: 'page', title: 'Home', description: 'Pagina principale di LIQUIDO Vape Shop', url: 'index.html', icon: 'home', keywords: ['home', 'home page', 'liquido', 'vape shop'] },
            { type: 'page', title: 'Liquidi', description: 'Scopri tutti i nostri e-liquid e brand partner', url: 'products.html', icon: 'water_drop', keywords: ['liquidi', 'e-liquid', 'liquido', 'gusti', 'fruttati', 'tabaccosi', 'cremosi', 'ghiacciati', 'prodotti'] },
            { type: 'page', title: 'Dispositivi', description: 'Mod, pod e kit vape disponibili nel nostro store', url: 'brands.html', icon: 'vaping_rooms', keywords: ['dispositivi', 'mod', 'pod', 'kit', 'device', 'vape', 'sigaretta elettronica', 'brand'] },
            { type: 'page', title: 'Chi Siamo', description: 'La storia e i valori di LIQUIDO Vape Shop', url: 'about.html', icon: 'store', keywords: ['chi siamo', 'about', 'storia', 'negozio', 'boutique', 'liquido'] },
            { type: 'page', title: 'Contatti', description: 'Orari, indirizzo e come contattarci', url: 'contact.html', icon: 'location_on', keywords: ['contatti', 'indirizzo', 'orari', 'telefono', 'dove siamo', 'monterotondo'] },
            { type: 'page', title: 'FAQ', description: 'Domande frequenti su vaping, liquidi e dispositivi', url: 'faq.html', icon: 'help', keywords: ['faq', 'domande', 'frequenti', 'aiuto', 'informazioni'] },
            { type: 'page', title: 'MyLiquido', description: 'Accedi al tuo account personale', url: 'myliquido.html', icon: 'account_circle', keywords: ['account', 'accedi', 'registrati', 'myliquido', 'profilo'] },

            // ── FAQ ──
            { type: 'faq', title: 'Quali sono i migliori liquidi vape?', description: 'Scopri la nostra selezione premium di e-liquid', url: 'faq.html', icon: 'quiz', keywords: ['migliori liquidi', 'selezione', 'premium', 'marche'] },
            { type: 'faq', title: 'Come conservare i liquidi vape?', description: 'Consigli per la corretta conservazione', url: 'faq.html', icon: 'quiz', keywords: ['conservare', 'conservazione', 'temperatura', 'scadenza'] },
            { type: 'faq', title: 'Quale livello di nicotina scegliere?', description: 'Guida alla scelta del livello di nicotina', url: 'faq.html', icon: 'quiz', keywords: ['nicotina', 'livello', 'mg', 'principiante', 'fumatore'] },
            { type: 'faq', title: 'Come pulire il dispositivo vape?', description: 'Guida alla pulizia e manutenzione', url: 'faq.html', icon: 'quiz', keywords: ['pulizia', 'pulire', 'manutenzione', 'tank', 'coil'] },
            { type: 'faq', title: 'Differenza tra mod vape e pod vape?', description: 'Scopri le differenze tra i dispositivi', url: 'faq.html', icon: 'quiz', keywords: ['mod', 'pod', 'differenza', 'dispositivo', 'scegliere'] },
            { type: 'faq', title: 'Come iniziare a svapare?', description: 'Guida per principianti al vaping', url: 'faq.html', icon: 'quiz', keywords: ['iniziare', 'principiante', 'primo', 'svapare', 'starter'] },
            { type: 'faq', title: 'Metodi di pagamento accettati', description: 'Contanti, carte di credito e digitali', url: 'faq.html', icon: 'quiz', keywords: ['pagamento', 'carta', 'contanti', 'pos', 'metodi'] },
            { type: 'faq', title: 'Orari e sede del negozio', description: 'Via Adige 43C, Monterotondo (RM)', url: 'contact.html', icon: 'quiz', keywords: ['orari', 'apertura', 'chiusura', 'sede', 'dove', 'indirizzo', 'monterotondo'] },
            { type: 'faq', title: 'Servizi di pulizia e manutenzione vape', description: 'Pulizia professionale in negozio', url: 'faq.html', icon: 'quiz', keywords: ['pulizia', 'manutenzione', 'servizio', 'assistenza', 'tecnico'] },
            { type: 'faq', title: 'Sali di nicotina vs nicotina freebase', description: 'Differenze tra i tipi di nicotina', url: 'faq.html', icon: 'quiz', keywords: ['sali', 'nicotina', 'freebase', 'nicotine salts', 'throat hit'] },
            { type: 'faq', title: 'Liquidi in aereo: regole', description: 'Come viaggiare con la sigaretta elettronica', url: 'faq.html', icon: 'quiz', keywords: ['aereo', 'viaggio', 'bagaglio', 'regole', 'trasportare'] },
        ];
    }

    /** Load all data from Firebase and cache it */
    async _loadFirebaseData() {
        if (this._cache) return this._cache;
        if (this._loadPromise) return this._loadPromise;

        this._loadPromise = (async () => {
            try {
                if (!window.firebaseCatalogService) {
                    console.warn('SearchService: firebaseCatalogService not available');
                    return { sections: [], brands: [], lines: [] };
                }

                const sections = await window.firebaseCatalogService.getSections();
                const brands = [];
                const lines = [];

                for (const section of sections) {
                    const sectionBrands = section.brands || [];
                    for (const brand of sectionBrands) {
                        brands.push({
                            ...brand,
                            sectionId: section.id,
                            sectionName: section.name
                        });

                        const brandLines = brand.lines || brand.products || [];
                        for (const line of brandLines) {
                            lines.push({
                                ...line,
                                brandName: brand.name,
                                sectionId: section.id,
                                sectionName: section.name,
                                image_url: line.image_url || (line.images && line.images[0]) || ''
                            });
                        }
                    }
                }

                this._cache = { sections, brands, lines };
                return this._cache;
            } catch (err) {
                console.error('SearchService: Error loading Firebase data', err);
                return { sections: [], brands: [], lines: [] };
            }
        })();

        return this._loadPromise;
    }

    /**
     * Build the URL for a brand or product line result
     */
    _buildBrandUrl(brand) {
        const isDevice = brand.sectionId && brand.sectionId.toLowerCase().includes('device');
        return isDevice
            ? `brands.html?brand=${encodeURIComponent(brand.name)}`
            : `products.html?brand=${encodeURIComponent(brand.name)}`;
    }

    _buildLineUrl(line) {
        const isDevice = line.sectionId && line.sectionId.toLowerCase().includes('device');
        if (isDevice) {
            return `brand-lines.html?section=${encodeURIComponent(line.sectionId)}&brand=${encodeURIComponent(line.brandName)}`;
        }
        return `brand-lines.html?section=${encodeURIComponent(line.sectionId)}&brand=${encodeURIComponent(line.brandName)}&line=${encodeURIComponent(line.name)}`;
    }

    /**
     * Score a result: how well does `query` match the item?
     */
    _score(query, text) {
        if (!text) return 0;
        const q = query.toLowerCase().trim();
        const t = text.toLowerCase();
        if (t === q) return 10;
        if (t.startsWith(q)) return 8;
        if (t.includes(q)) return 5;
        // word-level
        const words = q.split(/\s+/);
        const matched = words.filter(w => t.includes(w)).length;
        return matched / words.length * 3;
    }

    _scoreItem(query, fields) {
        return fields.reduce((max, f) => Math.max(max, this._score(query, f)), 0);
    }

    /**
     * Main search function
     * @param {string} query
     * @param {number} limit max results
     * @returns {Promise<Array>} results
     */
    async search(query, limit = 12) {
        if (!query || query.trim().length < 2) return [];

        const q = query.trim();
        const results = [];

        // ── 1. Static index (pages + FAQ) ──
        for (const item of this._getStaticIndex()) {
            const score = this._scoreItem(q, [
                item.title,
                item.description,
                ...(item.keywords || [])
            ]);
            if (score > 0) {
                results.push({ ...item, _score: score + (item.type === 'page' ? 0.1 : 0) });
            }
        }

        // ── 2. Firebase data ──
        try {
            const { brands, lines } = await this._loadFirebaseData();

            for (const brand of brands) {
                const score = this._scoreItem(q, [brand.name, brand.description || '']);
                if (score > 0) {
                    const isDevice = brand.sectionId && brand.sectionId.toLowerCase().includes('device');
                    results.push({
                        type: 'brand',
                        title: brand.name,
                        description: isDevice ? 'Dispositivi' : 'Liquidi',
                        url: this._buildBrandUrl(brand),
                        icon: isDevice ? 'vaping_rooms' : 'water_drop',
                        image: brand.logo_url || '',
                        sectionName: brand.sectionName,
                        _score: score + 0.5 // slight boost for Firebase results
                    });
                }
            }

            for (const line of lines) {
                const score = this._scoreItem(q, [
                    line.name,
                    line.brandName,
                    line.description || '',
                    line.flavorProfile || ''
                ]);
                if (score > 0) {
                    results.push({
                        type: 'line',
                        title: line.name,
                        description: `${line.brandName} · ${line.sectionName || ''}`,
                        url: this._buildLineUrl(line),
                        icon: 'category',
                        image: line.image_url || '',
                        _score: score
                    });
                }
            }
        } catch (e) {
            console.warn('SearchService: Firebase search failed', e);
        }

        // Sort by score descending, remove duplicates by URL
        const seen = new Set();
        return results
            .sort((a, b) => b._score - a._score)
            .filter(r => {
                if (seen.has(r.url + r.title)) return false;
                seen.add(r.url + r.title);
                return true;
            })
            .slice(0, limit);
    }
}

window.liquidoSearchService = new LiquidoSearchService();
