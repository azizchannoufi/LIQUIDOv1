/**
 * Google Reviews Service
 * Fetches real Google reviews from the backend proxy (/api/google-reviews)
 * and renders them into the reviews section on the homepage.
 */

(function () {
    'use strict';

    const API_URL = '/api/google-reviews';

    // Static fallback reviews (shown if API call fails)
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
        }
    ];

    /**
     * Get initials from a name (e.g. "Mario Rossi" → "MR")
     */
    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    /**
     * Renders star icons for a given rating (1-5)
     */
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

    /**
     * Generates a consistent avatar color based on name
     */
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

    /**
     * Returns text color for an avatar background
     */
    function getAvatarTextColor(bgColor) {
        // For yellow, use dark text
        if (bgColor === '#F8ED70' || bgColor === '#F0E68C') return '#111111';
        return '#111111';
    }

    /**
     * Renders a single review card HTML
     */
    function renderReviewCard(review, delayClass = '') {
        const initials = getInitials(review.author_name);
        const stars = renderStars(review.rating);
        const avatarBg = getAvatarColor(review.author_name);
        const avatarText = getAvatarTextColor(avatarBg);
        const text = review.text ? review.text.slice(0, 280) + (review.text.length > 280 ? '...' : '') : '';
        const timeDesc = review.relative_time_description || '';

        const avatarHtml = review.profile_photo_url
            ? `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="size-10 rounded-full object-cover" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div class="size-10 rounded-full flex items-center justify-center text-sm font-black" style="background:${avatarBg};color:${avatarText};display:none;">${initials}</div>`
            : `<div class="size-10 rounded-full flex items-center justify-center text-sm font-black" style="background:${avatarBg};color:${avatarText};">${initials}</div>`;

        return `
            <div class="review-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-black/5 scroll-animate-stagger ${delayClass} hover:-translate-y-1 transform">
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
                <div class="flex items-center justify-between mt-3">
                    <p class="text-xs text-slate-400">${timeDesc ? 'Recensione Google · ' + timeDesc : 'Recensione Google'}</p>
                </div>
            </div>`;
    }

    /**
     * Updates the rating display in the section header
     */
    function updateRatingDisplay(rating, totalCount) {
        const ratingDisplay = document.getElementById('google-rating-display');
        const totalDisplay = document.getElementById('google-ratings-total');

        if (ratingDisplay && rating) {
            ratingDisplay.textContent = rating.toFixed(1);
        }
        if (totalDisplay && totalCount) {
            totalDisplay.textContent = `(${totalCount} recensioni)`;
        }
    }

    /**
     * Main function: fetches reviews and renders them
     */
    async function loadAndRenderReviews() {
        const container = document.getElementById('google-reviews-grid');
        if (!container) return;

        // Show loading skeleton
        container.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-10">
                <div class="flex items-center gap-3 text-slate-400">
                    <div class="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                    <span class="text-sm font-medium">Caricamento recensioni...</span>
                </div>
            </div>`;

        let reviews = [];
        let rating = null;
        let totalCount = null;

        try {
            const response = await fetch(API_URL, { method: 'GET' });
            if (response.ok) {
                const json = await response.json();
                if (json.success && json.data) {
                    reviews = json.data.reviews || [];
                    rating = json.data.rating;
                    totalCount = json.data.user_ratings_total;
                }
            }
        } catch (err) {
            console.warn('Google Reviews API unavailable, using static fallback:', err.message);
        }

        // Fall back to static reviews if API failed or returned nothing
        if (!reviews || reviews.length === 0) {
            reviews = FALLBACK_REVIEWS;
        }

        // Only show top 3
        const displayReviews = reviews.slice(0, 3);

        // Update rating in header
        if (rating) updateRatingDisplay(rating, totalCount);

        // Render review cards
        const delayClasses = ['delay-0', 'delay-100', 'delay-200'];
        container.innerHTML = displayReviews
            .map((r, i) => renderReviewCard(r, delayClasses[i] || ''))
            .join('');

        // Trigger scroll animations for newly inserted cards
        container.querySelectorAll('.scroll-animate-stagger').forEach(el => {
            // Small delay so the browser repaints before adding class
            setTimeout(() => el.classList.add('animate-in'), 100);
        });
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
