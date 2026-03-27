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
    }

    async init() {
        try {
            const firebase = await window.initializeFirebase();
            this.firestore = firebase.firestore;
            await this.loadInfo();
        } catch (e) {
            console.error('StoreInfoService: init error', e);
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
        if (monFriEl && this.storeInfo.hours_mon_fri_open && this.storeInfo.hours_mon_fri_close) {
            monFriEl.textContent = `${this.storeInfo.hours_mon_fri_open} - ${this.storeInfo.hours_mon_fri_close}`;
        }

        // Apply Sat Hours
        const satEl = document.getElementById('store-display-sat');
        if (satEl && this.storeInfo.hours_sat_open && this.storeInfo.hours_sat_close) {
            satEl.textContent = `${this.storeInfo.hours_sat_open} - ${this.storeInfo.hours_sat_close}`;
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
            // strip non-numeric characters for WhatsApp link
            const waNumber = this.storeInfo.phone.replace(/\D/g, '');
            document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
                // If it contains a text parameter, keep it
                const url = new URL(link.href);
                const textParam = url.searchParams.get('text');
                let newHref = `https://wa.me/${waNumber}`;
                if (textParam) {
                    newHref += `?text=${encodeURIComponent(textParam)}`;
                }
                link.href = newHref;
            });
        }
    }
}

window.storeInfoService = new StoreInfoService();
