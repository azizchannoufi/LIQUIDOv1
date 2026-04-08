/**
 * Brands Order Manager
 * Handles the "Ordre d'affichage" tab in admin/brands/index.html
 * Provides up/down reordering for liquid and device brands separately.
 */

(function () {
    'use strict';

    const TOAST_DURATION = 2000;

    // State
    let catalogService = null;
    let liquidBrands = [];  // { name, sectionId, order, active, logo_url }
    let deviceBrands = [];

    // DOM refs (set when load() is called)
    let listLiquidEl, listDeviceEl, loadingEl, contentEl, toastEl, toastMsgEl;

    // ──────────────────────────────────────────────────────────────────────
    // Boot: wait for catalogService to be ready
    // ──────────────────────────────────────────────────────────────────────
    async function getService() {
        if (catalogService) return catalogService;

        if (typeof window.firebaseConfig === 'undefined' || !window.firebaseConfig.initializeFirebase) {
            await new Promise(resolve => {
                const t = setInterval(() => {
                    if (window.firebaseConfig?.initializeFirebase) { clearInterval(t); resolve(); }
                }, 100);
            });
        }

        if (window.catalogInit) {
            const catalog = await window.catalogInit;
            catalogService = catalog.service;
        } else {
            catalogService = new CatalogService();
            await catalogService.initFirebase();
        }
        return catalogService;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Load all brands from Firebase, split by type
    // ──────────────────────────────────────────────────────────────────────
    async function load() {
        listLiquidEl  = document.getElementById('order-list-liquid');
        listDeviceEl  = document.getElementById('order-list-device');
        loadingEl     = document.getElementById('ordre-loading');
        contentEl     = document.getElementById('ordre-content');
        toastEl       = document.getElementById('ordre-toast');
        toastMsgEl    = document.getElementById('ordre-toast-msg');

        if (!listLiquidEl) return;

        showLoading(true);

        try {
            const svc = await getService();

            // Recupera tutte le sezioni e i brand con il loro sectionId
            const sections = await svc.getSections();
            const raw = [];

            for (const section of sections) {
                const brands = await svc.getBrandsBySection(section.id);
                for (const brand of brands) {
                    raw.push({ ...brand, sectionId: section.id });
                }
            }

            // Split and sort by order (undefined → 99)
            const sortByOrder = (a, b) =>
                (a.order !== undefined ? a.order : 99) - (b.order !== undefined ? b.order : 99);

            liquidBrands = raw.filter(b => b.type === 'liquid').sort(sortByOrder);
            deviceBrands = raw.filter(b => b.type === 'device').sort(sortByOrder);

            // Normalize orders to 0-based integers
            liquidBrands.forEach((b, i) => { b.order = i; });
            deviceBrands.forEach((b, i) => { b.order = i; });

            renderList('liquid');
            renderList('device');

            showLoading(false);
        } catch (err) {
            console.error('brands-order: load error', err);
            showLoading(false);
            if (listLiquidEl) listLiquidEl.innerHTML = `<p class="text-red-400 text-sm">Errore: ${err.message}</p>`;
            if (listDeviceEl) listDeviceEl.innerHTML = '';
        }
    }

    function showLoading(on) {
        if (loadingEl) loadingEl.classList.toggle('hidden', !on);
        if (contentEl) {
            if (on) {
                contentEl.classList.add('hidden');
            } else {
                contentEl.classList.remove('hidden');
                // Make sure the grid layout works
                contentEl.style.display = 'grid';
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Render one list (liquid | device)
    // ──────────────────────────────────────────────────────────────────────
    function renderList(type) {
        const el = type === 'liquid' ? listLiquidEl : listDeviceEl;
        const brands = type === 'liquid' ? liquidBrands : deviceBrands;

        if (!el) return;

        if (brands.length === 0) {
            el.innerHTML = `
                <div class="flex flex-col items-center py-12 text-center">
                    <span class="material-symbols-outlined text-4xl text-[#393928] mb-3">${type === 'liquid' ? 'water_drop' : 'devices'}</span>
                    <p class="text-[#baba9c] text-sm">Aucun brand ${type === 'liquid' ? 'liquide' : 'dispositif'} trouvé.</p>
                </div>`;
            return;
        }

        el.innerHTML = brands.map((brand, idx) => {
            const isFirst = idx === 0;
            const isLast  = idx === brands.length - 1;
            const isInactive = brand.active === false;
            const logoHTML = brand.logo_url
                ? `<img src="${brand.logo_url}" alt="${brand.name}" class="w-10 h-10 object-contain rounded" onerror="this.style.display='none'">`
                : `<div class="w-10 h-10 rounded bg-[#393928] flex items-center justify-center"><span class="material-symbols-outlined text-[#baba9c] text-sm">${type === 'liquid' ? 'water_drop' : 'devices'}</span></div>`;

            return `
            <div class="order-row flex items-center gap-4 bg-surface-dark border border-border-dark rounded-xl px-4 py-3"
                 data-brand="${brand.name}" data-section="${brand.sectionId}" data-type="${type}" data-idx="${idx}">

                <!-- Position badge -->
                <div class="w-8 h-8 flex-shrink-0 rounded-full bg-border-dark flex items-center justify-center">
                    <span class="text-[#baba9c] text-xs font-black">${idx + 1}</span>
                </div>

                <!-- Logo -->
                <div class="flex-shrink-0">${logoHTML}</div>

                <!-- Name + status -->
                <div class="flex-1 min-w-0">
                    <p class="text-white font-bold text-sm truncate">${brand.name}</p>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isInactive ? 'text-red-400' : 'text-emerald-400'}">
                        <span class="size-1.5 rounded-full ${isInactive ? 'bg-red-400' : 'bg-emerald-400'}"></span>
                        ${isInactive ? 'Inattivo' : 'Attivo'}
                    </span>
                </div>

                <!-- Up / Down buttons -->
                <div class="flex flex-col gap-1 flex-shrink-0">
                    <button
                        class="move-up-btn w-7 h-7 flex items-center justify-center rounded bg-border-dark hover:bg-primary hover:text-background-dark text-[#baba9c] transition-all ${isFirst ? 'opacity-30 pointer-events-none' : 'cursor-pointer'}"
                        data-brand="${brand.name}" data-section="${brand.sectionId}" data-type="${type}" data-idx="${idx}"
                        title="Sposta su">
                        <span class="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>
                    <button
                        class="move-down-btn w-7 h-7 flex items-center justify-center rounded bg-border-dark hover:bg-primary hover:text-background-dark text-[#baba9c] transition-all ${isLast ? 'opacity-30 pointer-events-none' : 'cursor-pointer'}"
                        data-brand="${brand.name}" data-section="${brand.sectionId}" data-type="${type}" data-idx="${idx}"
                        title="Sposta giù">
                        <span class="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>
                </div>
            </div>`;
        }).join('');

        // Attach move handlers
        el.querySelectorAll('.move-up-btn').forEach(btn => {
            btn.addEventListener('click', () => move(btn.dataset.type, parseInt(btn.dataset.idx), -1));
        });
        el.querySelectorAll('.move-down-btn').forEach(btn => {
            btn.addEventListener('click', () => move(btn.dataset.type, parseInt(btn.dataset.idx), +1));
        });
    }

    // ──────────────────────────────────────────────────────────────────────
    // Move a brand up (-1) or down (+1), then save to Firebase
    // ──────────────────────────────────────────────────────────────────────
    async function move(type, idx, direction) {
        const brands = type === 'liquid' ? liquidBrands : deviceBrands;
        const targetIdx = idx + direction;

        if (targetIdx < 0 || targetIdx >= brands.length) return;

        // Swap in array
        [brands[idx], brands[targetIdx]] = [brands[targetIdx], brands[idx]];

        // Re-assign order values
        brands.forEach((b, i) => { b.order = i; });

        // Optimistic re-render
        renderList(type);

        // Save the two affected brands to Firebase
        const svc = await getService();
        const toSave = [brands[idx], brands[targetIdx]];

        // Mark rows as saving
        markRows(type, [idx, targetIdx], 'saving');

        try {
            await Promise.all(toSave.map(b =>
                svc.updateBrandField(b.sectionId, b.name, { order: b.order })
            ));
            showToast(`Ordine aggiornato — ${brands[targetIdx].name}`);
        } catch (err) {
            console.error('brands-order: save error', err);
            showToast('Errore durante il salvataggio', true);
            // Revert swap
            [brands[idx], brands[targetIdx]] = [brands[targetIdx], brands[idx]];
            brands.forEach((b, i) => { b.order = i; });
            renderList(type);
        }
    }

    function markRows(type, indices, cls) {
        const el = type === 'liquid' ? listLiquidEl : listDeviceEl;
        if (!el) return;
        el.querySelectorAll('.order-row').forEach(row => {
            const idx = parseInt(row.dataset.idx);
            if (indices.includes(idx)) row.classList.add(cls);
        });
    }

    // ──────────────────────────────────────────────────────────────────────
    // Toast notification
    // ──────────────────────────────────────────────────────────────────────
    let toastTimer = null;
    function showToast(msg, isError = false) {
        if (!toastEl || !toastMsgEl) return;
        toastMsgEl.textContent = msg;
        toastEl.querySelector('.material-symbols-outlined').textContent = isError ? 'error' : 'check_circle';
        toastEl.querySelector('.material-symbols-outlined').className =
            `material-symbols-outlined text-sm ${isError ? 'text-red-400' : 'text-primary'}`;
        toastEl.classList.remove('hidden');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.add('hidden'), TOAST_DURATION);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Expose globally so the HTML tab can call load()
    // ──────────────────────────────────────────────────────────────────────
    window.brandsOrderManager = { load };

})();
