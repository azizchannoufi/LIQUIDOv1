/**
 * Visits Tracker Service
 * Tracks website visits and stores them in Firebase
 */

class VisitsTracker {
    constructor() {
        this.database = null;
        this.initialized = false;
        this.visitRecorded = false;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            const { database } = await window.firebaseConfig.initializeFirebase();
            this.database = database;
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
                timestamp: Date.now(),
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                page: page || window.location.pathname,
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct'
            };

            // Record visit in visits collection
            const visitsRef = this.database.ref('visits');
            const newVisitRef = visitsRef.push();
            await newVisitRef.set(visitData);

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
            const dailyStatsRef = this.database.ref(`dailyStats/${date}`);
            const snapshot = await dailyStatsRef.once('value');
            const currentCount = snapshot.val()?.count || 0;

            await dailyStatsRef.set({
                date: date,
                count: currentCount + 1,
                lastUpdated: Date.now()
            });
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
            const totalVisitsRef = this.database.ref('stats/totalVisits');
            const snapshot = await totalVisitsRef.once('value');
            const currentTotal = snapshot.val() || 0;

            await totalVisitsRef.set(currentTotal + 1);
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
            const totalVisitsRef = this.database.ref('stats/totalVisits');
            const snapshot = await totalVisitsRef.once('value');
            return snapshot.val() || 0;
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
            const visitsRef = this.database.ref('visits');
            const snapshot = await visitsRef.once('value');
            const visits = snapshot.val();

            if (!visits) {
                return [];
            }

            const visitsArray = Object.keys(visits).map(key => ({
                id: key,
                ...visits[key]
            }));

            return visitsArray.filter(visit => {
                return visit.date >= startDate && visit.date <= endDate;
            });
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

