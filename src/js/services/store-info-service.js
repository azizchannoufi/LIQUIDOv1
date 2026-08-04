/**
 * Store Info Service
 * Fetches general store information from Firestore (settings/storeInfo)
 * and applies it to the corresponding DOM elements on the public site.
 */

class StoreInfoService {
    constructor() {
        this.firestore = null;
        this.storeInfo = null;
        this.DOC_PATH = { collection: 'settings', doc: 'storeInfo' };
        this.unsubscribe = null;
        this.initialized = false;

        // Try reading cached storeInfo from localStorage immediately
        try {
            const cached = localStorage.getItem('liquido_store_info');
            if (cached) {
                this.storeInfo = JSON.parse(cached);
            }
        } catch (e) {}
    }

    _saveToCache(data) {
        try {
            if (data) {
                localStorage.setItem('liquido_store_info', JSON.stringify(data));
            }
        } catch (e) {}
    }

    async init() {
        // Apply cached store info immediately to prevent any flash of old content
        if (this.storeInfo) {
            this.applyToPage();
        }

        if (this.initialized) {
            return;
        }
        try {
            const firebase = await window.initializeFirebase();
            this.firestore = firebase.firestore;
            this.initialized = true;
            this.listenToInfo();
        } catch (e) {
            console.error('StoreInfoService: init error', e);
        }
    }

    listenToInfo() {
        if (!this.firestore) return;
        try {
            const docRef = this.firestore
                .collection(this.DOC_PATH.collection)
                .doc(this.DOC_PATH.doc);

            if (this.unsubscribe) {
                this.unsubscribe();
            }

            this.unsubscribe = docRef.onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        this.storeInfo = doc.data();
                        this._saveToCache(this.storeInfo);
                        this.applyToPage();
                    }
                },
                (error) => {
                    console.warn('StoreInfoService: listener error, falling back to loadInfo', error);
                    this.loadInfo().then(() => this.applyToPage());
                }
            );
        } catch (e) {
            console.warn('StoreInfoService: listen error', e);
            this.loadInfo().then(() => this.applyToPage());
        }
    }

    async loadInfo() {
        try {
            const docRef = this.firestore
                .collection(this.DOC_PATH.collection)
                .doc(this.DOC_PATH.doc);
            const doc = await docRef.get();
            if (doc.exists) {
                this.storeInfo = doc.data();
                this._saveToCache(this.storeInfo);
            }
        } catch (e) {
            console.warn('StoreInfoService: load settings error', e);
        }
    }

    applyToPage() {
        if (!this.storeInfo) return;

        // Apply Address
        const addressEl = document.getElementById('store-display-address');
        if (addressEl && this.storeInfo.address) {
            addressEl.textContent = this.storeInfo.address;
        }

        // Apply Mon-Fri Hours
        const monFriEl = document.getElementById('store-display-mon-fri');
        if (monFriEl) {
            let hoursText = [];
            if (this.storeInfo.hours_mon_fri_morning_open && this.storeInfo.hours_mon_fri_morning_close) {
                hoursText.push(`${this.storeInfo.hours_mon_fri_morning_open} - ${this.storeInfo.hours_mon_fri_morning_close}`);
            }
            if (this.storeInfo.hours_mon_fri_afternoon_open && this.storeInfo.hours_mon_fri_afternoon_close) {
                hoursText.push(`${this.storeInfo.hours_mon_fri_afternoon_open} - ${this.storeInfo.hours_mon_fri_afternoon_close}`);
            }
            if (hoursText.length > 0) {
                monFriEl.textContent = hoursText.join(' / ');
            }
        }

        // Apply Sat Hours
        const satEl = document.getElementById('store-display-sat');
        if (satEl) {
            let hoursText = [];
            if (this.storeInfo.hours_sat_morning_open && this.storeInfo.hours_sat_morning_close) {
                hoursText.push(`${this.storeInfo.hours_sat_morning_open} - ${this.storeInfo.hours_sat_morning_close}`);
            }
            if (this.storeInfo.hours_sat_afternoon_open && this.storeInfo.hours_sat_afternoon_close) {
                hoursText.push(`${this.storeInfo.hours_sat_afternoon_open} - ${this.storeInfo.hours_sat_afternoon_close}`);
            }
            if (hoursText.length > 0) {
                satEl.textContent = hoursText.join(' / ');
            }
        }

        // Apply Top Nav Hours
        const topNavEl = document.getElementById('store-display-top-nav-hours');
        if (topNavEl) {
            let topNavText = ': ';
            let hasMonFri = false;
            
            if (this.storeInfo.hours_mon_fri_morning_open && this.storeInfo.hours_mon_fri_morning_close) {
                topNavText += `${this.storeInfo.hours_mon_fri_morning_open}-${this.storeInfo.hours_mon_fri_morning_close}`;
                hasMonFri = true;
            }
            if (this.storeInfo.hours_mon_fri_afternoon_open && this.storeInfo.hours_mon_fri_afternoon_close) {
                if (hasMonFri) topNavText += ' / ';
                topNavText += `${this.storeInfo.hours_mon_fri_afternoon_open}-${this.storeInfo.hours_mon_fri_afternoon_close}`;
            }

            let hasSat = false;
            let satText = '';
            if (this.storeInfo.hours_sat_morning_open && this.storeInfo.hours_sat_morning_close) {
                satText += `${this.storeInfo.hours_sat_morning_open}-${this.storeInfo.hours_sat_morning_close}`;
                hasSat = true;
            }
            if (this.storeInfo.hours_sat_afternoon_open && this.storeInfo.hours_sat_afternoon_close) {
                if (hasSat) satText += ' / ';
                satText += `${this.storeInfo.hours_sat_afternoon_open}-${this.storeInfo.hours_sat_afternoon_close}`;
            }

            if (satText) {
                topNavText += ` Sab: ${satText}`;
            }
            
            topNavEl.textContent = topNavText;
        }

        // Apply Topbar Text (Promo)
        const topbarTextEl = document.getElementById('store-display-topbar-text');
        const topNavDefault = document.getElementById('top-nav-default');
        const topNavPromo = document.getElementById('top-nav-promo');
        const publicTopNav = document.getElementById('public-top-nav');
        
        const hasTopbarText = this.storeInfo.topbarText && this.storeInfo.topbarText.trim().length > 0;
        
        if (topbarTextEl && hasTopbarText) {
            topbarTextEl.textContent = this.storeInfo.topbarText;
            if (topNavDefault) topNavDefault.classList.add('hidden');
            if (topNavPromo) {
                topNavPromo.classList.remove('hidden');
                topNavPromo.classList.add('flex');
            }
        } else {
            if (topNavDefault) topNavDefault.classList.remove('hidden');
            if (topNavPromo) {
                topNavPromo.classList.add('hidden');
                topNavPromo.classList.remove('flex');
            }
        }

        if (publicTopNav) {
            publicTopNav.classList.remove('hidden');
        }

        // Apply Phone Text
        const phoneEl = document.getElementById('store-display-phone');
        if (phoneEl && this.storeInfo.phone) {
            phoneEl.textContent = this.storeInfo.phone;
        }

        // Apply Email Text (if applicable)
        const emailEl = document.getElementById('store-display-email');
        if (emailEl && this.storeInfo.email) {
            emailEl.textContent = this.storeInfo.email;
        }

        // Update WhatsApp links
        if (this.storeInfo.phone) {
            const waNumber = this.storeInfo.phone.replace(/\D/g, '');
            document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
                const url = new URL(link.href);
                const textParam = url.searchParams.get('text');
                let newHref = `https://wa.me/${waNumber}`;
                if (textParam) {
                    newHref += `?text=${encodeURIComponent(textParam)}`;
                }
                link.href = newHref;
            });
        }

        // Dispatch window resize event to update sticky header positions
        window.dispatchEvent(new Event('resize'));
    }
}

window.storeInfoService = new StoreInfoService();
