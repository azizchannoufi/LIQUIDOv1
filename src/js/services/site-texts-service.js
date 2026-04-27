/**
 * Site Texts Service
 * Manages all editable text content across the user-facing website.
 * Texts are stored in Firestore under the 'siteTexts' document.
 */

const SITE_TEXTS_DOC = 'settings/siteTexts';

/**
 * Default texts for the entire site.
 * These are used as fallback if no data is saved in Firestore.
 */
const DEFAULT_SITE_TEXTS = {
    // ===== HOME PAGE =====
    home: {
        hero_line1: "Accendi",
        hero_line2: "la tua vibe",
        hero_line3: "ad ogni hit",

        why_title: "PERCHÉ",
        why_title_highlight: "LIQUIDO",

        strength1_title: "Prodotti\nCertificati",
        strength1_desc: "Tutti i nostri articoli sono selezionati per garantire sicurezza, autenticità e un'esperienza di svapo senza compromessi.",

        strength2_title: "Customer\nCare",
        strength2_desc: "Ogni cliente viene seguito con una consulenza personalizzata, pensata per Vapers principianti e per i più esperti.",

        strength3_title: "Ambiente\nElegante",
        strength3_desc: "Ambiente curato, moderno ed elegante, progettato per accogliere calorosamente e valorizzare ogni esperienza.",

        strength4_title: "Servizio\nProfessionale",
        strength4_desc: "Competenza e attenzione al servizio del cliente per capire e risolvere ogni problema con trasparenza e professionalità.",

        new_arrivals_title: "Nuovi",
        new_arrivals_title_highlight: "Arrivi",
        new_arrivals_subtitle: "Selezioni accuratamente scelte dell'ultimo hardware e e-liquid premium da tutto il mondo.",

        reviews_title: "COSA DICONO",
        reviews_title_highlight: "DI NOI",

        faq_title: "Domande",
        faq_title_highlight: "Frequenti",
        faq_subtitle: "Trova le risposte alle domande più comuni su liquidi, dispositivi, procedure e curiosità del mondo dello svapo.",
        
        why_bg_img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2W8yzKRqsy4SEqRz1ttIJAAo9IhiFuUWh-Z5k-5KjdxqkWXSU0iV1kY0W0zl9eMm6Llod9_xa93Le_kmTbyU4v4cTOJdd27q16jhUCyoZKKch1KrEpB-aRRa-uMzIOqLybGrY4JJmtJDKf2gzbtAdUfSM97Sz7TQPjr36nYwz-XCOMwdY-ySeBjryC1kGtupEr73Px7YGdMzBfHAiyUnA2rR1MGFe3mGijldkRk_zkV_wktC8riZZhZtx5pgUZ7h2UUVv794TuA0",
        new_arrivals_bg_img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqzZ1J_0P7oR0k-t4x_0XqZ0o5o0u4Z5Vb5Q4-L8V-pXW_fU-Y4s9W5A1tWz7wWwWz9fVq5H2yH8oG3rV-M3oY0J8-rG5M-6bZ9_f-9c0hM8E7l-F-m-k-R_LwVp6J2hZ8nZ6y-J1bE8U3p6M_u4U6V-kV0-Y-c1oP_iV7uW9yL-0fC4L1-R-r0L",
    },

    // ===== ABOUT PAGE =====
    about: {
        hero_title: "CHI",
        hero_title_highlight: "SIAMO",
        hero_subtitle: "LIQUIDO nasce come il punto di riferimento per chi cerca chiarezza in un mercato spesso frammentato e confuso. In un panorama saturo di informazioni contrastanti, la nostra missione è fare ordine: selezioniamo solo l'eccellenza per offrire un'esperienza di scoperta sicura e certificata. Non siamo solo un negozio, ma il sigillo di qualità che accompagna ogni svapatore verso scelte consapevoli, trasformando la confusione in un percorso di puro piacere e affidabilità.",

        section_subtitle: "Chi Siamo",
        section_title: "Un punto di riferimento affidabile",
        intro_text: "Nasciamo come alternativa ai classici vapeshop creando un legame con la nostra clientela che va oltre la semplice vendita di prodotti.",

        vision_text: "Ci impegniamo a diffondere la cultura del vaping attraverso un'informazione trasparente e un'assistenza dedicata. Crediamo fermamente che il vapore rappresenti l'alternativa più concreta, efficace e gratificante oggi disponibile sul mercato.",
        mission_text: "Ci prendiamo cura di ogni cliente con estrema gentilezza, trasformando la complessità dello svapo in un percorso chiaro e accessibile. Il nostro obiettivo è darti gli strumenti e la consapevolezza necessari per muoverti con totale sicurezza tra le infinite opzioni del mercato, sentendoti sempre guidato e ascoltato.",
        values_text: "Crediamo che l'ascolto sia la chiave per garantirti la miglior esperienza possibile, nel pieno rispetto delle tue scelte. Il tuo stile di svapo è unico, la nostra dedizione è totale. Ci assumiamo la responsabilità di interpretare i tuoi gusti per offrirti un servizio d'eccellenza, capace di spaziare tra le preferenze più diverse.",

        store_title: "IL",
        store_title_highlight: "NEGOZIO",
        store_text1: "LIQUIDO è un’idea! Il nostro negozio, concepito come una boutique dello svapo, unisce estetica ricercata e competenza professionale, offrendo un servizio esperto capace di valorizzare scelte e stile di ogni cliente",
        store_text2: "Che tu sia un appassionato esperto o nuovo all'esperienza, il nostro personale fornisce consulenze personalizzate in un ambiente rilassato, senza pressioni.\n\nVivi le nostre barre aromi complete e la selezione di dispositivi più adatti a te.",
        store_img1: "../assets/images/store_interior.png",
        store_img2: "../assets/images/store_aroma_bar.png",
        store_img3: "../assets/images/store_devices.png",
        reference_img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdyUZIIXwCEgpyrDjoRf19rPiQdhAJwFkGP1ar7ThySbCmZbWvu-v5Lt6Idps77o6W5q7Uzp5a-YxtPlNNGff6DVKX39KwGuCUX0amnaz0lvgyXg1NY9TNkcMR-101s4mOU8BqEsA_4YUIk75FH8WYTmSAkLrxTRmq7jXKwIZG50KqVCMFnXjLdQPEXVz4xnK7CSygN_ZpodGCeGgghG-Y2tETbAswDZhJsRu40CNs8VLl0U0hF5rhuD1iqVTm2i703Qw00A5NLpY",
        hero_bg_img: 'linear-gradient(rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.85) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCQ58EpPEoSjHKLLI06laD1Y0O0AWjSmQPzxaDtsIaGqBDcI-Gcvi-9ceqPi7yTKVGR-Sn2SST0cULQUC3GKriiNwz4r_h3ABCa_LqKO3UYZs2lFXJqtO1qr7E-PmQAKEC1IcT0kay2mEuoIcl-uO-rdnIw3pgqE8seD2QnE6Ca-I3FfauTXj2eeCgvx5_yuhETOOmkRI1ujMECY4Xoo4_mdCxEHeIsa2zzq2Aj6aUwZgGBYA-M_uhhGmS2pLSurECFV2zoFJcLCyg")',
    },

    // ===== CONTACT PAGE =====
    contact: {
        hero_title: "DOVE",
        hero_title_highlight: "SIAMO",
        hero_subtitle: "Vivi l'essenza di LIQUIDO. Visita il nostro negozio per una consulenza personalizzata o contatta il nostro Team.",

        address_street: "Via Adige 43C",
        address_city: "00015 - Monterotondo (RM)",

        hours_mon_fri: "09:00 - 20:15",
        hours_sat: "10:00 - 19:30",
        hours_sun: "Chiuso",

        phone: "+39 379 134 5367",
        whatsapp_number: "393791345367",

        partnership_label: "PARTNER WITH US",
        partnership_title: "COLLABORA CON",
        partnership_title_highlight: "LIQUIDO",
        partnership_text: "Siamo in costante ampliamento delle nostre Partnership Premium. Promuovi il tuo marchio insieme ai migliori brand al mondo o semplicemente collabora con noi.",
    },

    // ===== FOOTER =====
    footer: {
        description: "Il tuo vape shop di riferimento a Monterotondo, dove qualità e professionalità si fondono per offrirti un'esperienza di svapo unica.\nTi guidiamo nella scelta dei migliori liquidi e dispositivi, con consulenza personalizzata e prodotti certificati per elevare la tua esperienza di svapo.",
        address: "Via Adige 43C, 00015 Monterotondo (RM)",
        phone: "+39 379 134 5367",
        hours_weekdays: "Lun-Ven: 09:00 – 20:15",
        hours_saturday: "Sab: 10:00 – 19:30",
        hours_sunday: "Dom: Chiuso",
        copyright: "© 2025 LIQUIDO Vape Shop. Tutti i diritti riservati.",
    }
};

class SiteTextsService {
    constructor() {
        this.firestore = null;
        this.cache = null;
    }

    async _getFirestore() {
        if (this.firestore) return this.firestore;
        const { firestore } = await initializeFirebase();
        this.firestore = firestore;
        return firestore;
    }

    /**
     * Load all site texts from Firestore.
     * Falls back to DEFAULT_SITE_TEXTS if not found.
     */
    async loadTexts() {
        if (this.cache) return this.cache;
        try {
            const db = await this._getFirestore();
            const docRef = db.collection('settings').doc('siteTexts');
            const doc = await docRef.get();
            if (doc.exists) {
                // Deep merge with defaults so any missing keys still get a value
                const saved = doc.data();
                this.cache = this._deepMerge(DEFAULT_SITE_TEXTS, saved);
            } else {
                this.cache = { ...DEFAULT_SITE_TEXTS };
            }
        } catch (e) {
            console.warn('SiteTextsService: Could not load from Firestore, using defaults.', e);
            this.cache = { ...DEFAULT_SITE_TEXTS };
        }
        return this.cache;
    }

    /**
     * Save all site texts to Firestore.
     */
    async saveTexts(texts) {
        const db = await this._getFirestore();
        const docRef = db.collection('settings').doc('siteTexts');
        await docRef.set(texts, { merge: true });
        this.cache = texts;
    }

    /**
     * Apply texts to the current page based on data-text-key attributes.
     * Elements with data-text-key="home.hero_line1" will have their textContent set.
     */
    async applyTextsToPage() {
        const texts = await this.loadTexts();
        document.querySelectorAll('[data-text-key]').forEach(el => {
            const key = el.getAttribute('data-text-key');
            const value = this._getNestedValue(texts, key);
            if (value !== undefined && value !== null) {
                // Support newlines as <br> for elements with data-text-html
                if (el.hasAttribute('data-text-html')) {
                    el.innerHTML = String(value).replace(/\n/g, '<br>');
                } else {
                    el.textContent = value;
                }
            }
        });

        document.querySelectorAll('[data-img-key]').forEach(el => {
            const key = el.getAttribute('data-img-key');
            const value = this._getNestedValue(texts, key);
            if (value) {
                if (el.tagName.toLowerCase() === 'img') {
                    el.src = value;
                } else {
                    if (value.includes('url(') || value.includes('gradient(')) {
                        el.style.backgroundImage = value;
                    } else {
                        el.style.backgroundImage = `url('${value}')`;
                    }
                }
            }
        });
    }

    _getNestedValue(obj, path) {
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    }

    _deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    getDefaults() {
        return DEFAULT_SITE_TEXTS;
    }
}

// Global singleton
window.siteTextsService = new SiteTextsService();
window.DEFAULT_SITE_TEXTS = DEFAULT_SITE_TEXTS;
