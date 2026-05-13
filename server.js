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

const fs = require('fs');
const admin = require('firebase-admin');

// 1. Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.warn('⚠️ Could not initialize Firebase Admin:', error.message);
  }
}
const db = admin.firestore();

// SSR Route for Products
app.get('/produit/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    let product = null;

    // Fetch all sections to find the product
    const snapshot = await db.collection('sections').get();
    snapshot.forEach(doc => {
      const section = doc.data();
      const brands = section.brands || [];
      brands.forEach(brand => {
        const lines = brand.lines || [];
        lines.forEach(line => {
          if (line.products) {
            Object.values(line.products).forEach(p => {
              if (p.id === slug || p.slug === slug || (p.name && p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug)) {
                product = { ...p, brandName: brand.name, lineName: line.name };
              }
            });
          }
        });
      });
    });

    // If product not found, you could serve a 404 page or redirect
    if (!product) {
      console.warn(`Product not found for slug: ${slug}`);
      return res.status(404).send('Produit introuvable');
    }

    // Read the HTML template
    const htmlPath = path.join(__dirname, 'public', 'product-detail.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const imageUrl = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : '');
    const productPrice = product.price || 0; // Replace with actual price if available

    // Generate JSON-LD
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": [imageUrl],
      "description": product.description || product.flavorProfile || "",
      "brand": {
        "@type": "Brand",
        "name": product.brandName || "LIQUIDO"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://liquido.vapeshop/produit/${slug}`,
        "priceCurrency": "EUR",
        "price": productPrice,
        "availability": "https://schema.org/InStock"
      }
    };

    // Inject SEO tags
    htmlContent = htmlContent
      .replace(/<title>.*<\/title>/, `<title>${product.name} | LIQUIDO Vape Shop</title>`)
      .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${(product.description || product.flavorProfile || '').substring(0, 155)}...">`)
      .replace(/<head>/, `<head>\n<meta property="og:title" content="${product.name}">\n<meta property="og:description" content="${(product.description || product.flavorProfile || '').substring(0, 155)}...">\n<meta property="og:image" content="${imageUrl}">\n<meta property="og:url" content="https://liquido.vapeshop/produit/${slug}">`)
      .replace('</head>', `\n<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>\n</head>`);

    // Inject Initial Data for frontend hydration
    const initialDataScript = `<script>window.__INITIAL_PRODUCT_DATA__ = ${JSON.stringify(product)};</script>`;
    htmlContent = htmlContent.replace('</head>', `${initialDataScript}\n</head>`);

    res.send(htmlContent);

  } catch (error) {
    console.error('Erreur SSR Produit:', error);
    res.status(500).send('Erreur Serveur');
  }
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
