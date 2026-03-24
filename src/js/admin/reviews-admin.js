/**
 * Reviews Admin Manager
 * Handles loading, adding, editing and deleting manual Google reviews
 * from/to Firestore, and managing the overall rating config.
 */

class ReviewsAdmin {
    constructor() {
        this.firestore = null;
        this.reviews = [];
    }

    async init() {
        try {
            const firebase = await initializeFirebase();
            this.firestore = firebase.firestore;
            await this.loadOverallRating();
            await this.loadReviews();
            this._bindButtons();
        } catch (e) {
            console.error('ReviewsAdmin: init error', e);
            this._showToast('Errore connessione Firebase (Recensioni)', 'error');
        }
    }

    // ── Overall Rating ──────────────────────────────────────────────────────────

    async loadOverallRating() {
        try {
            const doc = await this.firestore.collection('settings').doc('reviewsConfig').get();
            if (doc.exists) {
                const data = doc.data();
                const ratingInput = document.getElementById('overall-rating-input');
                const totalInput = document.getElementById('total-reviews-input');
                if (ratingInput && data.overallRating !== undefined) ratingInput.value = data.overallRating;
                if (totalInput && data.totalReviews !== undefined) totalInput.value = data.totalReviews;
            }
        } catch (e) {
            console.warn('ReviewsAdmin: could not load overall rating', e);
        }
    }

    async saveOverallRating() {
        const ratingInput = document.getElementById('overall-rating-input');
        const totalInput = document.getElementById('total-reviews-input');
        const btn = document.getElementById('save-overall-rating-btn');

        if (!ratingInput || !totalInput) return;

        const overallRating = parseFloat(ratingInput.value) || 5.0;
        const totalReviews = parseInt(totalInput.value) || 0;

        if (btn) { btn.disabled = true; btn.textContent = 'Salvataggio...'; }

        try {
            await this.firestore.collection('settings').doc('reviewsConfig').set(
                { overallRating, totalReviews },
                { merge: true }
            );
            this._showToast('Valutazione globale salvata!', 'success');
        } catch (e) {
            console.error('ReviewsAdmin: save overall rating error', e);
            this._showToast('Errore salvataggio valutazione', 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Salva Rating'; }
        }
    }

    // ── Reviews CRUD ────────────────────────────────────────────────────────────

    async loadReviews() {
        const container = document.getElementById('reviews-list-container');
        if (!container) return;

        container.innerHTML = `<div class="text-center py-6 text-slate-500">Caricamento recensioni...</div>`;

        try {
            const snapshot = await this.firestore.collection('reviews').orderBy('createdAt', 'desc').get();
            this.reviews = [];
            snapshot.forEach(doc => this.reviews.push({ id: doc.id, ...doc.data() }));
            this._renderReviews();
        } catch (e) {
            // Might fail if no documents yet (index issue) — try without orderBy
            try {
                const snapshot = await this.firestore.collection('reviews').get();
                this.reviews = [];
                snapshot.forEach(doc => this.reviews.push({ id: doc.id, ...doc.data() }));
                this._renderReviews();
            } catch (e2) {
                console.error('ReviewsAdmin: load reviews error', e2);
                container.innerHTML = `<div class="text-center py-6 text-red-400">Errore caricamento recensioni.</div>`;
            }
        }
    }

    _renderReviews() {
        const container = document.getElementById('reviews-list-container');
        if (!container) return;

        if (this.reviews.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10 text-slate-500 dark:text-slate-400">
                    <span class="material-symbols-outlined text-4xl mb-2 block opacity-40">reviews</span>
                    Nessuna recensione. Clicca "Aggiungi Recensione" per iniziare.
                </div>`;
            return;
        }

        container.innerHTML = this.reviews.map(review => this._reviewCard(review)).join('');
    }

    _starsHTML(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        let html = '';
        for (let i = 0; i < full; i++) html += `<span class="material-symbols-outlined text-primary text-base" style="font-variation-settings:'FILL' 1">star</span>`;
        if (half) html += `<span class="material-symbols-outlined text-primary text-base" style="font-variation-settings:'FILL' 1">star_half</span>`;
        return html;
    }

    _reviewCard(review) {
        const stars = review.rating || 5;
        return `
        <div class="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        ${(review.author || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span class="font-semibold text-sm dark:text-white">${this._esc(review.author || 'Anonimo')}</span>
                    <span class="text-xs text-slate-400">${this._esc(review.date || '')}</span>
                </div>
                <div class="flex items-center gap-0.5 mb-1">${this._starsHTML(stars)}</div>
                <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">${this._esc(review.text || '')}</p>
            </div>
            <div class="flex sm:flex-col gap-2 shrink-0">
                <button onclick="window.reviewsAdmin.editReview('${review.id}')"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg hover:border-primary hover:text-primary transition-all">
                    <span class="material-symbols-outlined text-sm">edit</span>Modifica
                </button>
                <button onclick="window.reviewsAdmin.deleteReview('${review.id}')"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-slate-300 dark:border-red-900 rounded-lg hover:border-red-500 hover:text-red-400 transition-all">
                    <span class="material-symbols-outlined text-sm">delete</span>Elimina
                </button>
            </div>
        </div>`;
    }

    _esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    openAddModal() {
        this._openModal(null);
    }

    editReview(id) {
        const review = this.reviews.find(r => r.id === id);
        if (review) this._openModal(review);
    }

    async deleteReview(id) {
        if (!confirm('Eliminare questa recensione?')) return;
        try {
            await this.firestore.collection('reviews').doc(id).delete();
            this.reviews = this.reviews.filter(r => r.id !== id);
            this._renderReviews();
            this._showToast('Recensione eliminata', 'success');
        } catch (e) {
            console.error('ReviewsAdmin: delete error', e);
            this._showToast('Errore eliminazione recensione', 'error');
        }
    }

    _openModal(review) {
        // Remove any existing modal
        document.getElementById('review-modal')?.remove();

        const isEdit = !!review;
        const modal = document.createElement('div');
        modal.id = 'review-modal';
        modal.className = 'fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
        modal.innerHTML = `
            <div class="bg-[#1e1e10] border border-[#393928] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-lg font-bold text-white">${isEdit ? 'Modifica' : 'Aggiungi'} Recensione</h3>
                    <button onclick="document.getElementById('review-modal').remove()"
                        class="text-slate-400 hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="field-group">
                        <label class="text-field-label">Nome Autore</label>
                        <input id="rm-author" type="text" class="text-field" placeholder="Es. Mario Rossi" value="${this._esc(review?.author || '')}" />
                    </div>
                    <div class="field-group">
                        <label class="text-field-label">Data (es. 2 mesi fa)</label>
                        <input id="rm-date" type="text" class="text-field" placeholder="Es. 1 settimana fa" value="${this._esc(review?.date || '')}" />
                    </div>
                    <div class="field-group">
                        <label class="text-field-label">Valutazione (1–5)</label>
                        <input id="rm-rating" type="number" min="1" max="5" step="0.5" class="text-field" value="${review?.rating || 5}" />
                    </div>
                    <div class="field-group">
                        <label class="text-field-label">Testo Recensione</label>
                        <textarea id="rm-text" class="text-field" rows="4" placeholder="Testo della recensione...">${this._esc(review?.text || '')}</textarea>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button onclick="document.getElementById('review-modal').remove()"
                        class="px-4 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white text-sm font-bold transition-all">
                        Annulla
                    </button>
                    <button id="rm-save-btn"
                        class="px-6 py-2 rounded-lg bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-all"
                        onclick="window.reviewsAdmin._saveModal('${review?.id || ''}')">
                        ${isEdit ? 'Salva Modifiche' : 'Aggiungi'}
                    </button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('rm-author').focus();
    }

    async _saveModal(existingId) {
        const author = document.getElementById('rm-author')?.value.trim();
        const date = document.getElementById('rm-date')?.value.trim();
        const rating = parseFloat(document.getElementById('rm-rating')?.value) || 5;
        const text = document.getElementById('rm-text')?.value.trim();

        if (!author || !text) {
            this._showToast('Nome e testo sono obbligatori', 'error');
            return;
        }

        const btn = document.getElementById('rm-save-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Salvataggio...'; }

        try {
            const data = {
                author,
                date,
                rating: Math.min(5, Math.max(1, rating)),
                text,
                createdAt: existingId
                    ? (this.reviews.find(r => r.id === existingId)?.createdAt || new Date().toISOString())
                    : new Date().toISOString()
            };

            if (existingId) {
                await this.firestore.collection('reviews').doc(existingId).set(data, { merge: true });
                const idx = this.reviews.findIndex(r => r.id === existingId);
                if (idx !== -1) this.reviews[idx] = { id: existingId, ...data };
            } else {
                const docRef = await this.firestore.collection('reviews').add(data);
                this.reviews.unshift({ id: docRef.id, ...data });
            }

            this._renderReviews();
            document.getElementById('review-modal')?.remove();
            this._showToast(existingId ? 'Recensione aggiornata!' : 'Recensione aggiunta!', 'success');
        } catch (e) {
            console.error('ReviewsAdmin: save modal error', e);
            this._showToast('Errore salvataggio recensione', 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Salva'; }
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    _bindButtons() {
        const addBtn = document.getElementById('add-review-btn');
        if (addBtn) addBtn.addEventListener('click', () => this.openAddModal());

        const saveRatingBtn = document.getElementById('save-overall-rating-btn');
        if (saveRatingBtn) saveRatingBtn.addEventListener('click', () => this.saveOverallRating());
    }

    _showToast(message, type = 'success') {
        const existing = document.getElementById('admin-toast');
        if (existing) existing.remove();

        const colors = { success: 'bg-green-600', error: 'bg-red-600', warning: 'bg-yellow-500 text-black' };
        const icons = { success: 'check_circle', error: 'error', warning: 'warning' };

        const toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = `fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm transition-all ${colors[type] || colors.success}`;
        toast.innerHTML = `<span class="material-symbols-outlined">${icons[type] || 'check_circle'}</span>${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

// Initialize
window.reviewsAdmin = new ReviewsAdmin();
document.addEventListener('DOMContentLoaded', () => {
    window.reviewsAdmin.init();
});
