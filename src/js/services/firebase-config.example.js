/**
 * Firebase Configuration and Initialization
 * Uses Firebase CDN (legacy SDK for Realtime Database)
 * 
 * COPY THIS FILE TO firebase-config.js AND ADD YOUR REAL CREDENTIALS
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.region.firebasedatabase.app",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase (using CDN version for compatibility)
let firebaseApp = null;
let firebaseDatabase = null;
let firebaseAnalytics = null;

/**
 * Initialize Firebase
 * @returns {Promise<Object>} Firebase app and database instances
 */
function initializeFirebase() {
    if (firebaseApp) {
        return Promise.resolve({
            app: firebaseApp,
            database: firebaseDatabase,
            analytics: firebaseAnalytics
        });
    }

    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        return Promise.reject(new Error('Firebase SDK not loaded. Please include Firebase scripts.'));
    }

    try {
        // Initialize Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseDatabase = firebase.database();
        
        // Initialize Analytics (optional)
        if (firebase.analytics) {
            firebaseAnalytics = firebase.analytics();
        }

        return Promise.resolve({
            app: firebaseApp,
            database: firebaseDatabase,
            analytics: firebaseAnalytics
        });
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return Promise.reject(error);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeFirebase, firebaseConfig };
}

// Make available globally
window.firebaseConfig = { initializeFirebase, firebaseConfig };


