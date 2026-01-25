/**
 * SumUp API Routes
 * Handles all SumUp API requests through Express backend
 */

const express = require('express');
const router = express.Router();

let sumupAPI;
try {
  const SumUpAPI = require('../services/sumup-api');
  sumupAPI = new SumUpAPI();
} catch (error) {
  console.error('❌ Error initializing SumUp API service:', error);
  // Return error for all routes if service can't be initialized
  router.use('*', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'SumUp API service not initialized. Check server configuration and .env file.'
    });
  });
  module.exports = router;
  return;
}

/**
 * GET /api/sumup/transactions
 * Get list of transactions from SumUp
 * Query params: limit, order, status, payment_type, start_date, end_date
 */
router.get('/transactions', async (req, res) => {
  try {
    const {
      limit,
      order,
      status,
      payment_type,
      start_date,
      end_date
    } = req.query;

    const transactions = await sumupAPI.getTransactions({
      limit: limit ? parseInt(limit) : undefined,
      order,
      status,
      payment_type,
      start_date,
      end_date
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to fetch transactions',
      details: error.response?.data || null
    });
  }
});

/**
 * GET /api/sumup/transactions/:id
 * Get a specific transaction by ID
 */
router.get('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await sumupAPI.getTransaction(id);

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to fetch transaction',
      details: error.response?.data || null
    });
  }
});

/**
 * GET /api/sumup/checkouts
 * Get list of checkouts from SumUp
 */
router.get('/checkouts', async (req, res) => {
  try {
    const { limit, order, status } = req.query;
    
    const checkouts = await sumupAPI.getCheckouts({
      limit: limit ? parseInt(limit) : undefined,
      order,
      status
    });

    res.json({
      success: true,
      data: checkouts
    });
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to fetch checkouts',
      details: error.response?.data || null
    });
  }
});

/**
 * GET /api/sumup/checkouts/:id
 * Get a specific checkout by ID
 */
router.get('/checkouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const checkout = await sumupAPI.getCheckout(id);

    res.json({
      success: true,
      data: checkout
    });
  } catch (error) {
    console.error('Error fetching checkout:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to fetch checkout',
      details: error.response?.data || null
    });
  }
});

module.exports = router;

