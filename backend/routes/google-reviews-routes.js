/**
 * Google Reviews API Route
 * Proxies requests to Google Places API to keep API key secret.
 * 
 * Uses Google Places API (New) - Details endpoint
 * GET /api/google-reviews
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

// In-memory cache to avoid hitting API limits
let reviewsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * GET /api/google-reviews
 * Returns Google Place reviews for LIQUIDO VAPE SHOP
 */
router.get('/', async (req, res) => {
    try {
        // Return cached data if fresh
        const now = Date.now();
        if (reviewsCache && (now - cacheTimestamp) < CACHE_DURATION_MS) {
            console.log('✅ Returning cached Google reviews');
            return res.json({ success: true, data: reviewsCache, fromCache: true });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID;

        if (!apiKey || !placeId) {
            console.warn('⚠️  GOOGLE_MAPS_API_KEY or GOOGLE_PLACE_ID not set in .env');
            return res.status(503).json({
                success: false,
                error: 'Google Places API not configured. Set GOOGLE_MAPS_API_KEY and GOOGLE_PLACE_ID in .env'
            });
        }

        // Call Google Places API (legacy v1 - widely supported)
        // Fields: reviews, rating, user_ratings_total
        const url = `https://maps.googleapis.com/maps/api/place/details/json`;
        const response = await axios.get(url, {
            params: {
                place_id: placeId,
                fields: 'name,rating,user_ratings_total,reviews',
                language: 'it', // Italian language for reviews
                reviews_sort: 'most_relevant',
                key: apiKey
            },
            timeout: 10000
        });

        if (response.data.status !== 'OK') {
            console.error('Google Places API error:', response.data.status, response.data.error_message);
            return res.status(502).json({
                success: false,
                error: `Google Places API returned: ${response.data.status}`,
                details: response.data.error_message || null
            });
        }

        const placeResult = response.data.result;

        const data = {
            name: placeResult.name,
            rating: placeResult.rating,
            user_ratings_total: placeResult.user_ratings_total,
            reviews: (placeResult.reviews || []).map(r => ({
                author_name: r.author_name,
                author_url: r.author_url,
                profile_photo_url: r.profile_photo_url,
                rating: r.rating,
                relative_time_description: r.relative_time_description,
                text: r.text,
                time: r.time
            }))
        };

        // Cache the result
        reviewsCache = data;
        cacheTimestamp = now;

        console.log(`✅ Fetched ${data.reviews.length} Google reviews (rating: ${data.rating})`);
        return res.json({ success: true, data, fromCache: false });

    } catch (error) {
        console.error('❌ Error fetching Google reviews:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch Google reviews'
        });
    }
});

/**
 * POST /api/google-reviews/clear-cache
 * Clears the in-memory cache (for admin use)
 */
router.post('/clear-cache', (req, res) => {
    reviewsCache = null;
    cacheTimestamp = 0;
    console.log('🗑️  Google reviews cache cleared');
    res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
