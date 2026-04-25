/**
 * Google Reviews Service
 * Fetches reviews from Firestore and renders them in a horizontal scrollable carousel.
 */

(function () {
    'use strict';

    // Static fallback reviews (shown if Firestore fetch fails)
    const FALLBACK_REVIEWS = [
        {
            author_name: 'Luca Valentini',
            rating: 5,
            text: 'Il miglior vape shop della zona! Ogni volta che entro vengo accolto con professionalità. La scelta di liquidi e dispositivi è incredibile e i prezzi sono onesti.',
            relative_time_description: '2 settimane fa',
            profile_photo_url: null
        },
        {
            author_name: 'Sara Rinaldi',
            rating: 5,
            text: 'Negozio curatissimo, personale gentile e molto preparato. Mi hanno consigliato il dispositivo perfetto per me. Lo consiglio assolutamente a tutti!',
            relative_time_description: '1 mese fa',
            profile_photo_url: null
        },
        {
            author_name: 'Federico Moretti',
            rating: 5,
            text: 'Vengo qui da due anni e non ho mai avuto motivo di andare altrove. Liquidi di qualità eccellente, staff disponibile e un\'atmosfera davvero unica. 10/10!',
            relative_time_description: '3 mesi fa',
            profile_photo_url: null
        },
        {
            author_name: 'Giada Esposito',
            rating: 5,
            text: 'Personale super disponibile e competente. Mi hanno aiutato a scegliere il liquido giusto per le mie esigenze senza fretta. Tornerò sicuramente!',
            relative_time_description: '2 mesi fa',
            profile_photo_url: null
        },
        {
            author_name: 'Marco Bianchi',
            rating: 5,
            text: 'Assortimento vasto e prezzi competitivi. Ho trovato tutto quello che cercavo e anche qualcosa in più. Staff molto preparato e cordiale.',
            relative_time_description: '1 settimana fa',
            profile_photo_url: null
        }
    ];

    /** Get initials from a name (e.g. "Mario Rossi" → "MR") */
    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    /** Renders star icons for a given rating (1-5) */
    function renderStars(rating) {
        const full = Math.round(rating);
        let stars = '';
        for (let i = 0; i < 5; i++) {
            const filled = i < full
                ? 'font-variation-settings: \'FILL\' 1;'
                : 'font-variation-settings: \'FILL\' 0;';
            stars += `<span class="material-symbols-outlined text-[16px]" style="color:#F8ED70;${filled}">star</span>`;
        }
        return stars;
    }

    /** Generates a consistent pastel avatar color based on name */
    function getAvatarColor(name) {
        const colors = [
            '#F8ED70', '#FFB347', '#87CEEB', '#98FB98', '#DDA0DD',
            '#F0E68C', '#ADD8E6', '#FFA07A', '#90EE90', '#FFB6C1'
        ];
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    /** Renders a single review card as a carousel slide */
    function renderReviewCard(review) {
        const initials = getInitials(review.author_name);
        const stars = renderStars(review.rating);
        const avatarBg = getAvatarColor(review.author_name);
        const text = review.text ? review.text.slice(0, 320) + (review.text.length > 320 ? '...' : '') : '';
        const timeDesc = review.relative_time_description || '';

        const avatarHtml = review.profile_photo_url
            ? `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="size-10 rounded-full object-cover" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div class="size-10 rounded-full flex items-center justify-center text-sm font-black" style="background:${avatarBg};color:#111;display:none;">${initials}</div>`
            : `<div class="size-10 rounded-full flex items-center justify-center text-sm font-black" style="background:${avatarBg};color:#111;">${initials}</div>`;

        return `
            <div class="review-carousel-card bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-black/5 hover:-translate-y-1 transform" style="height:auto;">
                <div class="flex items-center gap-3 mb-3">
                    <div class="relative flex-shrink-0">
                        ${avatarHtml}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-background-dark text-sm truncate">${review.author_name}</h4>
                        <div class="flex items-center gap-1">${stars}</div>
                    </div>
                    <div class="flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Google Review">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    </div>
                </div>
                <p class="text-slate-600 leading-relaxed italic text-sm">"${text}"</p>
                <div class="mt-3">
                    <p class="text-xs text-slate-400">${timeDesc ? 'Recensione Google · ' + timeDesc : 'Recensione Google'}</p>
                </div>
            </div>`;
    }

    /** Updates the rating display in the section header */
    function updateRatingDisplay(rating, totalCount) {
        const ratingDisplay = document.getElementById('google-rating-display');
        const totalDisplay = document.getElementById('google-ratings-total');
        if (ratingDisplay && rating) ratingDisplay.textContent = rating.toFixed(1);
        if (totalDisplay && totalCount) totalDisplay.textContent = `(${totalCount} recensioni)`;
    }

    /** Sets up drag-to-scroll and arrow nav buttons */
    function initCarouselInteractions(track) {
        if (!track) return;

        // --- Drag to scroll ---
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.classList.add('is-dragging');
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        document.addEventListener('mouseup', () => {
            isDown = false;
            track.classList.remove('is-dragging');
        });
        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.classList.remove('is-dragging');
        });
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });

        // --- Arrow buttons ---
        const prevBtn = document.getElementById('reviews-prev-btn');
        const nextBtn = document.getElementById('reviews-next-btn');
        const SCROLL_AMOUNT = 340;

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
            });
        }

        // --- Auto-scroll (pause on hover/drag) ---
        let autoScrollTimer = null;
        let isPaused = false;

        function startAutoScroll() {
            autoScrollTimer = setInterval(() => {
                if (isPaused) return;
                // If at the end, jump back to start
                if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
                    track.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
                }
            }, 4000);
        }

        track.addEventListener('mouseenter', () => { isPaused = true; });
        track.addEventListener('mouseleave', () => { isPaused = false; });
        track.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
        track.addEventListener('touchend', () => {
            setTimeout(() => { isPaused = false; }, 2000);
        });

        startAutoScroll();
    }

    /** Main function: fetches reviews from Firestore and renders carousel */
    async function loadAndRenderReviews() {
        const container = document.getElementById('google-reviews-grid');
        if (!container) return;

        // Show loader
        container.innerHTML = `
            <div style="min-width:100%;display:flex;align-items:center;justify-content:center;padding:2.5rem 0;">
                <div class="flex items-center gap-3 text-slate-400">
                    <div class="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                    <span class="text-sm font-medium">Caricamento recensioni...</span>
                </div>
            </div>`;

        let reviews = [];
        let rating = null;
        let totalCount = null;

        try {
            const initFn = typeof window.initializeFirebase === 'function'
                ? window.initializeFirebase
                : (window.firebaseConfig && typeof window.firebaseConfig.initializeFirebase === 'function'
                    ? window.firebaseConfig.initializeFirebase
                    : null);

            if (initFn) {
                const { firestore } = await initFn();

                // Fetch config (overall rating + total count)
                try {
                    const configDoc = await firestore.collection('settings').doc('reviewsConfig').get();
                    if (configDoc.exists) {
                        const data = configDoc.data();
                        rating = data.overallRating;
                        totalCount = data.totalReviews;
                    }
                } catch (e) {
                    console.warn('Could not fetch reviewsConfig', e);
                }

                // Fetch ALL reviews (no limit) ordered by date descending
                try {
                    const snapshot = await firestore.collection('reviews').orderBy('createdAt', 'desc').get();
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        reviews.push({
                            id: doc.id,
                            author_name: data.author || 'Anonimo',
                            rating: data.rating || 5,
                            text: data.text || '',
                            relative_time_description: data.date || '',
                            profile_photo_url: null
                        });
                    });
                } catch (e) {
                    console.warn('Could not fetch ordered reviews, trying unordered:', e);
                    try {
                        const snapshot = await firestore.collection('reviews').get();
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            reviews.push({
                                id: doc.id,
                                author_name: data.author || 'Anonimo',
                                rating: data.rating || 5,
                                text: data.text || '',
                                relative_time_description: data.date || '',
                                profile_photo_url: null
                            });
                        });
                    } catch (e2) {
                        console.warn('Unordered fetch also failed:', e2);
                    }
                }
            } else {
                console.warn('Firebase initialization function not found');
            }
        } catch (err) {
            console.warn('Error loading reviews from Firestore, using fallback:', err.message);
        }

        // Fall back to static if nothing returned
        if (!reviews || reviews.length === 0) {
            reviews = FALLBACK_REVIEWS;
        }

        // Update header rating
        if (rating) updateRatingDisplay(rating, totalCount);

        // Render all cards as carousel slides
        container.innerHTML = reviews.map(r => renderReviewCard(r)).join('');

        // Boot carousel interactions after render
        initCarouselInteractions(container);
    }

    // Expose globally
    window.googleReviewsService = { loadAndRenderReviews };

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAndRenderReviews);
    } else {
        loadAndRenderReviews();
    }

})();
