/**
 * Firebase Data Initialization Utility
 * Use this script to initialize Firebase Realtime Database with data from catalog.json
 * 
 * Usage: Open this file in a browser console or run it once to populate Firebase
 */

(async function() {
    'use strict';
    
    console.log('Starting Firebase data initialization...');
    
    try {
        // Load Firebase config
        const { initializeFirebase } = window.firebaseConfig;
        const { database } = await initializeFirebase();
        
        // Load catalog.json
        const response = await fetch('../src/data/catalog.json');
        const data = await response.json();
        const catalog = data.catalog;
        
        // Save to Firebase
        const catalogRef = database.ref('catalog');
        
        await catalogRef.set(catalog);
        
        console.log('✅ Firebase data initialized successfully!');
        console.log('Catalog structure:', catalog);
        
    } catch (error) {
        console.error('❌ Error initializing Firebase data:', error);
    }
})();

