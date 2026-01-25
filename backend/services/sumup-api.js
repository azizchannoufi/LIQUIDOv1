/**
 * SumUp API Service
 * Handles HTTP requests to SumUp REST API
 */

const axios = require('axios');

class SumUpAPI {
  constructor() {
    this.baseURL = process.env.SUMUP_BASE_URL || 'https://api.sumup.com';
    this.bearerToken = process.env.SUMUP_BEARER_TOKEN;
    this.merchantCode = process.env.SUMUP_MERCHANT_CODE;

    if (!this.bearerToken) {
      console.warn('⚠️  SUMUP_BEARER_TOKEN not set in environment variables');
    }

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });

    // Add request interceptor to include bearer token
    this.client.interceptors.request.use(
      (config) => {
        if (this.bearerToken) {
          config.headers.Authorization = `Bearer ${this.bearerToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get list of transactions
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of transactions
   */
  async getTransactions(params = {}) {
    try {
      const endpoint = this.merchantCode 
        ? `/v0.1/merchants/${this.merchantCode}/transactions`
        : '/v0.1/me/transactions';

      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getTransactions');
    }
  }

  /**
   * Get a specific transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction object
   */
  async getTransaction(transactionId) {
    try {
      const endpoint = `/v0.1/me/transactions/${transactionId}`;
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getTransaction');
    }
  }

  /**
   * Get list of checkouts
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of checkouts
   */
  async getCheckouts(params = {}) {
    try {
      const endpoint = '/v0.1/checkouts';
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getCheckouts');
    }
  }

  /**
   * Get a specific checkout by ID
   * @param {string} checkoutId - Checkout ID
   * @returns {Promise<Object>} Checkout object
   */
  async getCheckout(checkoutId) {
    try {
      const endpoint = `/v0.1/checkouts/${checkoutId}`;
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getCheckout');
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error
   * @param {string} method - Method name for logging
   * @returns {Error} Formatted error
   */
  handleError(error, method) {
    if (error.response) {
      // API responded with error status
      const { status, data } = error.response;
      const errorMessage = data?.title || data?.message || error.message;
      const errorDetails = {
        status,
        message: errorMessage,
        details: data,
        method
      };
      console.error(`SumUp API Error (${method}):`, errorDetails);
      return new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response
      console.error(`SumUp API Network Error (${method}):`, error.message);
      return new Error('Network error: No response from SumUp API');
    } else {
      // Error in request setup
      console.error(`SumUp API Request Error (${method}):`, error.message);
      return error;
    }
  }
}

module.exports = SumUpAPI;

