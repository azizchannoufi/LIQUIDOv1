/**
 * Site Texts Admin Manager
 * Handles loading and saving all editable site texts from/to Firestore.
 */

class SiteTextsAdmin {
    constructor() {
        this.firestore = null;
        this.currentTexts = null;
        this.hasUnsavedChanges = false;
    }

    async init() {
        try {
            const firebase = await initializeFirebase();
            this.firestore = firebase.firestore;
            await this.loadTexts();
        } catch (e) {
            console.error('SiteTextsAdmin: init error', e);
            AdminToast.error('Errore di connessione a Firebase');
        }
    }

    async loadTexts() {
        try {
            const docRef = this.firestore.collection('settings').doc('siteTexts');
            const doc = await docRef.get();
            if (doc.exists) {
                this.currentTexts = this._deepMerge(window.DEFAULT_SITE_TEXTS, doc.data());
            } else {
                this.currentTexts = JSON.parse(JSON.stringify(window.DEFAULT_SITE_TEXTS));
            }
            this.populateForm();
        } catch (e) {
            console.error('SiteTextsAdmin: load error', e);
            this.currentTexts = JSON.parse(JSON.stringify(window.DEFAULT_SITE_TEXTS));
            this.populateForm();
            AdminToast.warning('Testo predefinito caricato (Firebase non raggiungibile)');
        }
    }

    populateForm() {
        // Populate all inputs/textareas that have data-text-field attribute
        document.querySelectorAll('[data-text-field]').forEach(el => {
            const key = el.getAttribute('data-text-field');
            const value = this._getNestedValue(this.currentTexts, key);
            if (value !== undefined && value !== null) {
                el.value = value;
            }
        });
        this.hasUnsavedChanges = false;
        this.updateSaveButtonState();
    }

    collectFormData() {
        const texts = JSON.parse(JSON.stringify(this.currentTexts || window.DEFAULT_SITE_TEXTS));
        document.querySelectorAll('[data-text-field]').forEach(el => {
            const key = el.getAttribute('data-text-field');
            this._setNestedValue(texts, key, el.value);
        });
        return texts;
    }

    async saveTexts() {
        const btn = document.getElementById('save-site-texts-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span> Salvataggio...`;
        }
        try {
            const texts = this.collectFormData();
            await this.firestore.collection('settings').doc('siteTexts').set(texts, { merge: true });
            this.currentTexts = texts;
            this.hasUnsavedChanges = false;
            this.updateSaveButtonState();
            AdminToast.success('Testi aggiornati con successo!');
        } catch (e) {
            console.error('SiteTextsAdmin: save error', e);
            AdminToast.error('Errore durante il salvataggio');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<span class="material-symbols-outlined text-sm">save</span> Salva Modifiche`;
            }
        }
    }

    async resetToDefaults() {
        if (!confirm('Sei sicuro di voler ripristinare tutti i testi predefiniti? Questa azione non può essere annullata.')) return;
        try {
            const defaults = JSON.parse(JSON.stringify(window.DEFAULT_SITE_TEXTS));
            await this.firestore.collection('settings').doc('siteTexts').set(defaults);
            this.currentTexts = defaults;
            this.populateForm();
            AdminToast.success('Testi ripristinati ai valori predefiniti');
        } catch (e) {
            AdminToast.error('Errore durante il ripristino');
        }
    }

    markUnsaved() {
        this.hasUnsavedChanges = true;
        this.updateSaveButtonState();
    }

    updateSaveButtonState() {
        const btn = document.getElementById('save-site-texts-btn');
        if (!btn) return;
        if (this.hasUnsavedChanges) {
            btn.classList.remove('opacity-70');
            btn.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-card-dark');
        } else {
            btn.classList.add('opacity-70');
            btn.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-card-dark');
        }
    }

    // Toast handled by AdminToast global utility (src/js/admin/admin-toast.js)

    _getNestedValue(obj, path) {
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    }

    _setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let cur = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!cur[keys[i]]) cur[keys[i]] = {};
            cur = cur[keys[i]];
        }
        cur[keys[keys.length - 1]] = value;
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
}

// Initialize
window.siteTextsAdmin = new SiteTextsAdmin();
document.addEventListener('DOMContentLoaded', () => {
    window.siteTextsAdmin.init();

    // Listen to all field changes
    document.querySelectorAll('[data-text-field]').forEach(el => {
        el.addEventListener('input', () => window.siteTextsAdmin.markUnsaved());
    });

    // Save button
    const saveBtn = document.getElementById('save-site-texts-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => window.siteTextsAdmin.saveTexts());
    }

    // Reset button
    const resetBtn = document.getElementById('reset-site-texts-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => window.siteTextsAdmin.resetToDefaults());
    }

    // Tab switching
    document.querySelectorAll('[data-tab-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab-btn');
            // Deactivate all tabs
            document.querySelectorAll('[data-tab-btn]').forEach(b => {
                b.classList.remove('bg-primary', 'text-black');
                b.classList.add('text-slate-400', 'hover:text-white');
            });
            document.querySelectorAll('[data-tab-panel]').forEach(p => p.classList.add('hidden'));
            // Activate selected
            btn.classList.add('bg-primary', 'text-black');
            btn.classList.remove('text-slate-400', 'hover:text-white');
            const panel = document.querySelector(`[data-tab-panel="${target}"]`);
            if (panel) panel.classList.remove('hidden');
        });
    });
});
