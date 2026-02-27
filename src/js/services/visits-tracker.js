/**
 * Visits Tracker Service
 * Tracks website visits and stores them in Firebase Firestore
 */

class VisitsTracker {
    constructor() {
        this.firestore = null;
        this.initialized = false;
        this.visitRecorded = false;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            const { firestore } = await window.firebaseConfig.initializeFirebase();
            this.firestore = firestore;
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing Visits Tracker:', error);
            throw error;
        }
    }

    /**
     * Record a visit to the website
     * @param {string} page - Page path (optional)
     * @returns {Promise<void>}
     */
    async recordVisit(page = null) {
        // Prevent multiple visits in the same session
        if (this.visitRecorded) {
            return;
        }

        try {
            await this.initialize();

            const visitData = {
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                page: page || window.location.pathname,
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct'
            };

            // Record visit in visits collection
            // Change ref('visits').push() to collection('visits').add()
            await this.firestore.collection('visits').add(visitData);

            // Update daily stats
            await this.updateDailyStats(visitData.date);

            // Update total visits counter
            await this.incrementTotalVisits();

            this.visitRecorded = true;
            console.log('Visit recorded:', visitData);
        } catch (error) {
            console.error('Error recording visit:', error);
            // Don't throw - visits tracking shouldn't break the site
        }
    }

    /**
     * Update daily visit statistics
     * @param {string} date - Date string (YYYY-MM-DD)
     * @returns {Promise<void>}
     */
    async updateDailyStats(date) {
        try {
            // Change ref('dailyStats').set() to collection('dailyStats').doc(date).set()
            // Using set with merge or update to increment
            const dailyStatsRef = this.firestore.collection('dailyStats').doc(date);

            // We can use increment directly, much better than reading then writing
            await dailyStatsRef.set({
                date: date,
                count: firebase.firestore.FieldValue.increment(1),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('Error updating daily stats:', error);
        }
    }

    /**
     * Increment total visits counter
     * @returns {Promise<void>}
     */
    async incrementTotalVisits() {
        try {
            // Store total visits in a document stats/general with a field totalVisits
            const statsRef = this.firestore.collection('stats').doc('general');

            await statsRef.set({
                totalVisits: firebase.firestore.FieldValue.increment(1),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('Error incrementing total visits:', error);
        }
    }

    /**
     * Get total visits count
     * @returns {Promise<number>}
     */
    async getTotalVisits() {
        try {
            await this.initialize();
            const statsRef = this.firestore.collection('stats').doc('general');
            const doc = await statsRef.get();

            if (doc.exists) {
                return doc.data().totalVisits || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error getting total visits:', error);
            return 0;
        }
    }

    /**
     * Get visits for a specific date range
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise<Array>}
     */
    async getVisitsByDateRange(startDate, endDate) {
        try {
            await this.initialize();
            // Firestore query
            const visitsRef = this.firestore.collection('visits');
            const snapshot = await visitsRef
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .get();

            const visitsArray = [];
            snapshot.forEach(doc => {
                visitsArray.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return visitsArray;
        } catch (error) {
            console.error('Error getting visits by date range:', error);
            return [];
        }
    }
}

// Create singleton instance
const visitsTracker = new VisitsTracker();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = visitsTracker;
}

// Make available globally
window.visitsTracker = visitsTracker;

