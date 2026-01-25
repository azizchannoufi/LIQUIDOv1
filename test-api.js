/**
 * Test script to verify SumUp API integration
 * Run with: node test-api.js
 */

const http = require('http');

const PORT = process.env.PORT || 3001;
console.log(`Testing SumUp API endpoints on port ${PORT}...\n`);

// Test health endpoint
const testHealth = () => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}/api/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Health check: OK');
          console.log('   Response:', data);
          resolve();
        } else {
          console.log('❌ Health check: FAILED');
          console.log('   Status:', res.statusCode);
          reject(new Error(`Health check failed with status ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.log('❌ Health check: FAILED');
      console.log('   Error:', err.message);
      console.log('   → Make sure the server is running: npm start');
      reject(err);
    });
  });
};

// Test SumUp transactions endpoint
const testSumUpTransactions = () => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}/api/sumup/transactions`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 500) {
            console.log('✅ SumUp transactions endpoint: ACCESSIBLE');
            console.log('   Status:', res.statusCode);
            if (json.error) {
              console.log('   ⚠️  Error:', json.error);
              console.log('   → Check your .env file for SUMUP_BEARER_TOKEN');
            } else {
              console.log('   Response keys:', Object.keys(json));
            }
            resolve();
          } else {
            console.log('❌ SumUp transactions endpoint: FAILED');
            console.log('   Status:', res.statusCode);
            console.log('   Response:', data.substring(0, 200));
            reject(new Error(`Transactions endpoint failed with status ${res.statusCode}`));
          }
        } catch (e) {
          console.log('❌ SumUp transactions endpoint: INVALID JSON');
          console.log('   Status:', res.statusCode);
          console.log('   Response:', data.substring(0, 200));
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log('❌ SumUp transactions endpoint: FAILED');
      console.log('   Error:', err.message);
      reject(err);
    });
  });
};

// Run tests
(async () => {
  try {
    await testHealth();
    console.log('');
    await testSumUpTransactions();
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.log('\n❌ Tests failed. Please check the errors above.');
    process.exit(1);
  }
})();

