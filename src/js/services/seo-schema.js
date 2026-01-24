/**
 * SEO Schema.org Service
 * Generates structured data (JSON-LD) for better SEO
 */

(function() {
    'use strict';

    const SEO_SCHEMA = {
        baseUrl: 'https://liquido.vapeshop',
        
        /**
         * Generate Organization schema
         */
        getOrganizationSchema: function() {
            return {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "LIQUIDO Vape Shop",
                "url": this.baseUrl,
                "logo": `${this.baseUrl}/assets/images/Goccia LIQUIDO/GOCCIA Y_W.png`,
                "description": "Negozio vape premium a Monterotondo (Roma) specializzato in liquidi vape, dispositivi vape, servizi pulizia e manutenzione vape.",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "via Adige 43C",
                    "addressLocality": "Monterotondo",
                    "postalCode": "00015",
                    "addressRegion": "RM",
                    "addressCountry": "IT"
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+39-379-134-5367",
                    "contactType": "customer service",
                    "email": "info.vaporoom@gmail.com",
                    "areaServed": ["IT"],
                    "availableLanguage": ["it", "en"]
                },
                "sameAs": [
                    "https://www.instagram.com/liquido.vapeshop/",
                    "https://www.facebook.com/liquido.vapeshop/"
                ]
            };
        },

        /**
         * Generate LocalBusiness schema
         */
        getLocalBusinessSchema: function() {
            return {
                "@context": "https://schema.org",
                "@type": "VapeShop",
                "name": "LIQUIDO Vape Shop",
                "image": `${this.baseUrl}/assets/images/Goccia LIQUIDO/GOCCIA Y_W.png`,
                "description": "Vape shop premium a Monterotondo (Roma): liquidi vape, dispositivi vape, servizi pulizia e manutenzione vape.",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "via Adige 43C",
                    "addressLocality": "Monterotondo",
                    "postalCode": "00015",
                    "addressRegion": "RM",
                    "addressCountry": "IT"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 42.0500,
                    "longitude": 12.6167
                },
                "telephone": "+39-379-134-5367",
                "email": "info.vaporoom@gmail.com",
                "url": this.baseUrl,
                "priceRange": "€€",
                "openingHoursSpecification": [
                    {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        "opens": "10:00",
                        "closes": "21:00"
                    },
                    {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": "Saturday",
                        "opens": "11:00",
                        "closes": "22:00"
                    },
                    {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": "Sunday",
                        "opens": "12:00",
                        "closes": "18:00"
                    }
                ],
                "servesCuisine": false,
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Prodotti Vape",
                    "itemListElement": [
                        {
                            "@type": "OfferCatalog",
                            "name": "Liquidi Vape"
                        },
                        {
                            "@type": "OfferCatalog",
                            "name": "Dispositivi Vape"
                        },
                        {
                            "@type": "OfferCatalog",
                            "name": "Servizi Pulizia e Manutenzione Vape"
                        }
                    ]
                }
            };
        },

        /**
         * Generate FAQPage schema
         */
        getFAQPageSchema: function() {
            return {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Quali sono i migliori liquidi vape disponibili a Monterotondo?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Presso LIQUIDO vape shop a Monterotondo (Roma) troverai una selezione premium di liquidi vape delle migliori marche: Dinner Lady, Vaporesso, GeekVape, Voopoo e molti altri. I nostri liquidi vape sono selezionati per garantire qualità, sicurezza e sapore eccezionale."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Offrite servizi di pulizia e manutenzione vape a Monterotondo?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì, presso LIQUIDO vape shop a Monterotondo (Roma) offriamo servizi completi di pulizia dispositivi vape e manutenzione vape. I nostri servizi includono: pulizia completa del dispositivo vape, pulizia del tank, cambio coil, sostituzione del cotone dell'atomizzatore, e manutenzione generale."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Dove si trova il vostro negozio vape a Monterotondo?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il nostro vape shop LIQUIDO si trova a Monterotondo (Roma) in via Adige 43C, CAP 00015. Siamo facilmente raggiungibili da Roma e dalle zone limitrofe. Il nostro negozio vape è aperto dal lunedì al venerdì dalle 10:00 alle 21:00, sabato dalle 11:00 alle 22:00, e domenica dalle 12:00 alle 18:00."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come pulire correttamente il mio dispositivo vape?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per pulire correttamente il tuo dispositivo vape, smonta tutte le parti (tank, coil, drip tip) e sciacquale con acqua calda. Per una pulizia più approfondita, puoi utilizzare alcol isopropilico per rimuovere residui di liquidi vape. Asciuga accuratamente tutte le parti prima di riassemblare."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come conservare correttamente i liquidi vape?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per conservare correttamente i liquidi vape, è importante mantenerli in un luogo fresco e asciutto, lontano dalla luce diretta del sole. La temperatura ideale è tra i 15°C e i 25°C. Conserva i liquidi vape in posizione verticale con il tappo ben chiuso per evitare l'ossidazione."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quali servizi offrite oltre alla vendita di liquidi e dispositivi vape?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Oltre alla vendita di liquidi vape e dispositivi vape, il nostro vape shop a Monterotondo offre: servizi di pulizia dispositivi vape, manutenzione vape professionale, pulizia tank, cambio coil, sostituzione cotone atomizzatore, consulenza personalizzata, assistenza tecnica, e possibilità di ordinare prodotti speciali su richiesta."
                        }
                    }
                ]
            };
        },

        /**
         * Inject schema into page
         */
        injectSchema: function(schema) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        },

        /**
         * Initialize schemas based on current page
         */
        init: function() {
            const path = window.location.pathname;
            
            // Always add Organization schema
            this.injectSchema(this.getOrganizationSchema());
            
            // Add LocalBusiness schema on relevant pages
            if (path.includes('index.html') || path.includes('contact.html') || path.includes('about.html')) {
                this.injectSchema(this.getLocalBusinessSchema());
            }
            
            // Add FAQPage schema on FAQ page
            if (path.includes('faq.html')) {
                this.injectSchema(this.getFAQPageSchema());
            }
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SEO_SCHEMA.init());
    } else {
        SEO_SCHEMA.init();
    }

    // Export for manual use if needed
    window.SEOSchema = SEO_SCHEMA;
})();

