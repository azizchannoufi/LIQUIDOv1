/**
 * Store Info Admin
 * Loads and saves general store information from/to Firestore (settings/storeInfo).
 * Fields: storeName, phone, email, address,
 *         hours_mon_fri_open, hours_mon_fri_close,
 *         hours_sat_open, hours_sat_close
 */

class StoreInfoAdmin {
    constructor() {
        this.firestore = null;
        this.DOC_PATH = { collection: 'settings', doc: 'storeInfo' };
    }

    // ── Field map: id → Firestore key ────────────────────────────────────────────
    get FIELDS() {
        return [
            { id: 'store-info-name',            key: 'storeName' },
            { id: 'store-info-phone',           key: 'phone' },
            { id: 'store-info-email',           key: 'email' },
            { id: 'store-info-address',         key: 'address' },
            { id: 'store-info-topbar-text',     key: 'topbarText' },
            { id: 'store-info-mon-fri-morning-open',    key: 'hours_mon_fri_morning_open' },
            { id: 'store-info-mon-fri-morning-close',   key: 'hours_mon_fri_morning_close' },
            { id: 'store-info-mon-fri-afternoon-open',  key: 'hours_mon_fri_afternoon_open' },
            { id: 'store-info-mon-fri-afternoon-close', key: 'hours_mon_fri_afternoon_close' },
            { id: 'store-info-sat-morning-open',        key: 'hours_sat_morning_open' },
            { id: 'store-info-sat-morning-close',       key: 'hours_sat_morning_close' },
            { id: 'store-info-sat-afternoon-open',      key: 'hours_sat_afternoon_open' },
            { id: 'store-info-sat-afternoon-close',     key: 'hours_sat_afternoon_close' },
        ];
    }

    async init() {
        try {
            const firebase = await initializeFirebase();
            this.firestore = firebase.firestore;
            await this.load();
            this._bindSave();
        } catch (e) {
            console.error('StoreInfoAdmin: init error', e);
            AdminToast.error('Errore connessione Firebase (Info Negozio)');
        }
    }

    // ── Load ─────────────────────────────────────────────────────────────────────

    async load() {
        try {
            const docRef = this.firestore
                .collection(this.DOC_PATH.collection)
                .doc(this.DOC_PATH.doc);
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                this.FIELDS.forEach(({ id, key }) => {
                    const el = document.getElementById(id);
                    if (el && data[key] !== undefined) el.value = data[key];
                });
            }
        } catch (e) {
            console.warn('StoreInfoAdmin: load error', e);
            AdminToast.warning('Impossibile caricare le info del negozio');
        }
    }

    // ── Save ─────────────────────────────────────────────────────────────────────

    async save() {
        const btn = document.getElementById('save-store-info-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span> Salvataggio...`;
        }

        try {
            const data = {};
            this.FIELDS.forEach(({ id, key }) => {
                const el = document.getElementById(id);
                if (el) data[key] = el.value.trim();
            });

            await this.firestore
                .collection(this.DOC_PATH.collection)
                .doc(this.DOC_PATH.doc)
                .set(data, { merge: true });

            AdminToast.success('Informazioni negozio salvate!');
        } catch (e) {
            console.error('StoreInfoAdmin: save error', e);
            AdminToast.error('Errore durante il salvataggio');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<span class="material-symbols-outlined text-sm">save</span> Salva Modifiche`;
            }
        }
    }

    // ── Bind ─────────────────────────────────────────────────────────────────────

    _bindSave() {
        const btn = document.getElementById('save-store-info-btn');
        if (btn) btn.addEventListener('click', () => this.save());
    }
}

// Initialize
window.storeInfoAdmin = new StoreInfoAdmin();
document.addEventListener('DOMContentLoaded', () => {
    window.storeInfoAdmin.init();
});
