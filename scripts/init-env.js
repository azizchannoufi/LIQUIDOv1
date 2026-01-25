/**
 * Initialize .env file from existing firebase-config.js
 * This script extracts Firebase config values and creates .env file
 * 
 * Usage: node scripts/init-env.js
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/js/services/firebase-config.js');
const envPath = path.join(__dirname, '../.env');

// Check if firebase-config.js exists
if (!fs.existsSync(configPath)) {
    console.error('❌ Error: firebase-config.js not found!');
    process.exit(1);
}

// Read firebase-config.js
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract values using regex
const extractValue = (key) => {
    const regex = new RegExp(`${key}:\\s*"([^"]+)"`, 'i');
    const match = configContent.match(regex);
    return match ? match[1] : null;
};

const apiKey = extractValue('apiKey');
const authDomain = extractValue('authDomain');
const databaseURL = extractValue('databaseURL');
const projectId = extractValue('projectId');
const storageBucket = extractValue('storageBucket');
const messagingSenderId = extractValue('messagingSenderId');
const appId = extractValue('appId');
const measurementId = extractValue('measurementId');

if (!apiKey || !authDomain || !databaseURL || !projectId) {
    console.error('❌ Error: Could not extract all required values from firebase-config.js');
    process.exit(1);
}

// Create .env content
const envContent = `# Firebase Configuration
# This file contains sensitive data - DO NOT commit to git
# The .env file is already in .gitignore

FIREBASE_API_KEY=${apiKey}
FIREBASE_AUTH_DOMAIN=${authDomain}
FIREBASE_DATABASE_URL=${databaseURL}
FIREBASE_PROJECT_ID=${projectId}
FIREBASE_STORAGE_BUCKET=${storageBucket || ''}
FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId || ''}
FIREBASE_APP_ID=${appId || ''}
FIREBASE_MEASUREMENT_ID=${measurementId || ''}
`;

// Write .env file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ .env file created successfully from firebase-config.js');
console.log(`📁 Location: ${envPath}`);
console.log('⚠️  Remember: .env is in .gitignore and will not be committed to git');

