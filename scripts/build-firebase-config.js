/**
 * Build Script for Firebase Config
 * Reads .env file and generates firebase-config.js from template
 * 
 * Usage: node scripts/build-firebase-config.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const templatePath = path.join(__dirname, '../src/js/services/firebase-config.template.js');
const outputPath = path.join(__dirname, '../src/js/services/firebase-config.js');
const envPath = path.join(__dirname, '../.env');

// Check if .env exists
if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found!');
    console.log('📝 Please create a .env file in the root directory with the following variables:');
    console.log(`
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
    `);
    process.exit(1);
}

// Read template
let template = fs.readFileSync(templatePath, 'utf8');

// Get environment variables
const envVars = {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
};

// Check if all required variables are set
const missingVars = Object.entries(envVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('❌ Error: Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
}

// Replace placeholders in template
Object.entries(envVars).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), value);
});

// Write output file
fs.writeFileSync(outputPath, template, 'utf8');

console.log('✅ firebase-config.js generated successfully from .env');
console.log(`📁 Output: ${outputPath}`);

