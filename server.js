// Express server for LIQUIDO with SumUp API integration
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure CORS to allow requests from frontend on port 3000
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// API Routes
try {
  const sumupRoutes = require('./backend/routes/sumup-routes');
  app.use('/api/sumup', sumupRoutes);
  console.log('✅ SumUp routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading SumUp routes:', error);
  // Add a fallback route to show error
  app.use('/api/sumup', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'SumUp routes not loaded. Check server logs for details.'
    });
  });
}

// Google Reviews Route
try {
  const googleReviewsRoutes = require('./backend/routes/google-reviews-routes');
  app.use('/api/google-reviews', googleReviewsRoutes);
  console.log('✅ Google Reviews routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading Google Reviews routes:', error);
  app.use('/api/google-reviews', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Google Reviews routes not loaded. Check server logs for details.'
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LIQUIDO server is running' });
});

// Fallback: serve index.html for SPA routing
app.get('*', (req, res) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 LIQUIDO server started');
  console.log(`📁 Server directory: ${__dirname}`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`👨‍💼 Admin page: http://localhost:${PORT}/admin/`);
  console.log(`💳 SumUp API: http://localhost:${PORT}/api/sumup`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});
