/**
 * SumUp Service
 * Client-side service for interacting with SumUp API through Express backend
 */

class SumUpService {
  constructor() {
    // Use absolute URL if backend is on different port
    // Default to port 3001 if frontend is on 3000
    const currentPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const backendPort = window.SUMUP_API_PORT || '3001';
    const isDifferentPort = currentPort !== backendPort;
    
    if (isDifferentPort) {
      // Backend is on different port, use absolute URL
      this.apiBaseUrl = `http://localhost:${backendPort}/api/sumup`;
      console.log(`🔗 SumUp API configured for backend on port ${backendPort}`);
    } else {
      // Same port, use relative URL
      this.apiBaseUrl = '/api/sumup';
    }
  }

  /**
   * Get list of transactions
   * @param {Object} params - Query parameters (limit, order, status, payment_type, start_date, end_date)
   * @returns {Promise<Object>} Response with transactions data
   */
  async getTransactions(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.apiBaseUrl}/transactions${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get a specific transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction data
   */
  async getTransaction(transactionId) {
    try {
      const url = `${this.apiBaseUrl}/transactions/${transactionId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Get list of checkouts
   * @param {Object} params - Query parameters (limit, order, status)
   * @returns {Promise<Object>} Response with checkouts data
   */
  async getCheckouts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.apiBaseUrl}/checkouts${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching checkouts:', error);
      throw error;
    }
  }

  /**
   * Get a specific checkout by ID
   * @param {string} checkoutId - Checkout ID
   * @returns {Promise<Object>} Checkout data
   */
  async getCheckout(checkoutId) {
    try {
      const url = `${this.apiBaseUrl}/checkouts/${checkoutId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching checkout:', error);
      throw error;
    }
  }

  /**
   * Format transaction amount
   * @param {number} amount - Amount in minor units
   * @param {string} currency - Currency code
   * @returns {string} Formatted amount
   */
  formatAmount(amount, currency = 'EUR') {
    if (!amount && amount !== 0) return 'N/A';
    
    // SumUp returns amounts in minor units (cents), convert to major units
    const majorAmount = amount / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(majorAmount);
  }

  /**
   * Format transaction date
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status badge class
   * @param {string} status - Transaction status
   * @returns {string} CSS class for status badge
   */
  getStatusClass(status) {
    const statusMap = {
      'SUCCESSFUL': 'bg-green-500/20 text-green-400 border-green-500/30',
      'FAILED': 'bg-red-500/20 text-red-400 border-red-500/30',
      'PENDING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'EXPIRED': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    
    return statusMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SumUpService;
}

// Make available globally
window.sumupService = new SumUpService();

