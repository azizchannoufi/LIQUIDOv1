/**
 * Firebase Configuration and Initialization
 * Uses Firebase CDN (legacy SDK for Realtime Database)
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBN9mxhu4i7hEoMxeLy-6e7dBOWRV-K78",
    authDomain: "liquidovapeshop.firebaseapp.com",
    databaseURL: "https://liquidovapeshop-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "liquidovapeshop",
    storageBucket: "liquidovapeshop.firebasestorage.app",
    messagingSenderId: "410966783440",
    appId: "1:410966783440:web:ab8b96fdf4b81a790775d5",
    measurementId: "G-9VDR2HHTYJ"
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

