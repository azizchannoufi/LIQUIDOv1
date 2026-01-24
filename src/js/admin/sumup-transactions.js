/**
 * SumUp Transactions Page Service
 * Manages the SumUp transactions list page with search, display, and filtering
 */

class SumUpTransactionsService {
  constructor() {
    this.allTransactions = [];
    this.filteredTransactions = [];
    this.currentPage = 1;
    this.pageSize = 50;
  }

  /**
   * Initialize and load transactions
   */
  async init() {
    this.setupEventListeners();
    await this.loadTransactions();
  }

  /**
   * Load transactions from SumUp API
   */
  async loadTransactions() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const table = document.getElementById('transactions-table');
    const emptyState = document.getElementById('empty-state');
    const errorMessage = document.getElementById('error-message');

    try {
      // Show loading state
      if (loadingState) loadingState.classList.remove('hidden');
      if (errorState) errorState.classList.add('hidden');
      if (table) table.classList.add('hidden');
      if (emptyState) emptyState.classList.add('hidden');

      // Fetch transactions from API
      const response = await window.sumupService.getTransactions({
        limit: 100,
        order: 'desc'
      });

      if (response.success && response.data) {
        // Handle both array and object with items property
        this.allTransactions = Array.isArray(response.data) 
          ? response.data 
          : (response.data.items || response.data.data || []);

        this.filteredTransactions = [...this.allTransactions];
        this.renderTransactions();
        this.updateTotalCount();

        if (loadingState) loadingState.classList.add('hidden');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      
      if (loadingState) loadingState.classList.add('hidden');
      if (errorState) errorState.classList.remove('hidden');
      if (errorMessage) {
        let errorText = error.message || 'Failed to load transactions.';
        
        // Provide more helpful error messages
        if (error.message && error.message.includes('404')) {
          errorText = 'API endpoint not found. Make sure the Express server is running on port 3000.';
        } else if (error.message && error.message.includes('non-JSON')) {
          errorText = 'Server returned an invalid response. Make sure the Express server is running and routes are configured correctly.';
        } else if (error.message && error.message.includes('Failed to fetch')) {
          errorText = 'Cannot connect to server. Make sure the Express server is running: npm start';
        }
        
        errorMessage.textContent = errorText;
      }
    }
  }

  /**
   * Filter transactions based on search and status
   */
  filterTransactions() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    const paymentTypeFilter = document.getElementById('payment-type-filter')?.value || 'all';

    this.filteredTransactions = this.allTransactions.filter(transaction => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (transaction.id && transaction.id.toLowerCase().includes(searchTerm)) ||
        (transaction.transaction_code && transaction.transaction_code.toLowerCase().includes(searchTerm)) ||
        (transaction.amount && transaction.amount.toString().includes(searchTerm)) ||
        (transaction.merchant_code && transaction.merchant_code.toLowerCase().includes(searchTerm));

      // Status filter
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

      // Payment type filter
      const matchesPaymentType = paymentTypeFilter === 'all' || transaction.payment_type === paymentTypeFilter;

      return matchesSearch && matchesStatus && matchesPaymentType;
    });

    this.renderTransactions();
    this.updateTotalCount();
  }

  /**
   * Render transactions table
   */
  renderTransactions() {
    const tbody = document.getElementById('transactions-tbody');
    const table = document.getElementById('transactions-table');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');

    if (!tbody || !table || !emptyState) return;

    // Hide loading state
    if (loadingState) loadingState.classList.add('hidden');

    // Clear existing rows
    tbody.innerHTML = '';

    if (this.filteredTransactions.length === 0) {
      table.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    table.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Render each transaction
    this.filteredTransactions.forEach(transaction => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-border-dark/20 transition-colors';

      const transactionId = transaction.id || transaction.transaction_code || 'N/A';
      const date = window.sumupService.formatDate(transaction.timestamp || transaction.date);
      const amount = window.sumupService.formatAmount(transaction.amount, transaction.currency);
      const status = transaction.status || 'UNKNOWN';
      const paymentType = transaction.payment_type || 'N/A';
      const statusClass = window.sumupService.getStatusClass(status);

      row.innerHTML = `
        <td class="px-6 py-4">
          <div class="flex flex-col">
            <span class="text-white font-semibold font-mono text-sm">${transactionId.substring(0, 16)}${transactionId.length > 16 ? '...' : ''}</span>
            ${transaction.transaction_code && transaction.transaction_code !== transactionId ? 
              `<span class="text-[#baba9c] text-xs">${transaction.transaction_code}</span>` : ''}
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="text-white text-sm">${date}</span>
        </td>
        <td class="px-6 py-4">
          <span class="text-white font-semibold">${amount}</span>
        </td>
        <td class="px-6 py-4">
          <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}">${status}</span>
        </td>
        <td class="px-6 py-4">
          <span class="text-[#baba9c] text-sm">${paymentType}</span>
        </td>
        <td class="px-6 py-4 text-right">
          <button class="view-details-btn px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-semibold transition-colors" 
                  data-transaction-id="${transactionId}">
            View Details
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

    // Add event listeners for view details buttons
    this.setupDetailsListeners();
  }

  /**
   * Setup event listeners for view details buttons
   */
  setupDetailsListeners() {
    const viewButtons = document.querySelectorAll('.view-details-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const transactionId = e.currentTarget.dataset.transactionId;
        await this.showTransactionDetails(transactionId);
      });
    });
  }

  /**
   * Show transaction details in modal
   */
  async showTransactionDetails(transactionId) {
    const modal = document.getElementById('transaction-modal');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !modalContent) return;

    try {
      // Show loading in modal
      modalContent.innerHTML = '<div class="text-[#baba9c]">Loading transaction details...</div>';
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      // Fetch transaction details
      const response = await window.sumupService.getTransaction(transactionId);

      if (response.success && response.data) {
        const transaction = response.data;
        this.renderTransactionDetails(transaction, modalContent);
      } else {
        throw new Error('Failed to load transaction details');
      }
    } catch (error) {
      console.error('Error loading transaction details:', error);
      modalContent.innerHTML = `
        <div class="text-red-500">
          <p class="font-semibold">Error loading transaction details</p>
          <p class="text-sm text-[#baba9c] mt-2">${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Render transaction details in modal
   */
  renderTransactionDetails(transaction, container) {
    const formatField = (label, value) => {
      if (value === null || value === undefined) return '';
      return `
        <div class="flex justify-between py-2 border-b border-border-dark">
          <span class="text-[#baba9c] text-sm">${label}</span>
          <span class="text-white text-sm font-medium">${value}</span>
        </div>
      `;
    };

    const statusClass = window.sumupService.getStatusClass(transaction.status);
    const amount = window.sumupService.formatAmount(transaction.amount, transaction.currency);
    const date = window.sumupService.formatDate(transaction.timestamp || transaction.date);

    container.innerHTML = `
      <div class="space-y-4">
        <div class="bg-border-dark/30 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-bold text-white">Transaction Information</h4>
            <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}">${transaction.status || 'UNKNOWN'}</span>
          </div>
          ${formatField('Transaction ID', transaction.id || transaction.transaction_code)}
          ${formatField('Transaction Code', transaction.transaction_code)}
          ${formatField('Amount', amount)}
          ${formatField('Currency', transaction.currency)}
          ${formatField('Date', date)}
          ${formatField('Status', transaction.status)}
          ${formatField('Payment Type', transaction.payment_type)}
          ${formatField('Merchant Code', transaction.merchant_code)}
          ${transaction.vat_amount ? formatField('VAT Amount', window.sumupService.formatAmount(transaction.vat_amount, transaction.currency)) : ''}
          ${transaction.tip_amount ? formatField('Tip Amount', window.sumupService.formatAmount(transaction.tip_amount, transaction.currency)) : ''}
          ${transaction.auth_code ? formatField('Auth Code', transaction.auth_code) : ''}
          ${transaction.entry_mode ? formatField('Entry Mode', transaction.entry_mode) : ''}
          ${transaction.installments_count ? formatField('Installments', transaction.installments_count) : ''}
        </div>
        ${transaction.product_summary ? `
          <div class="bg-border-dark/30 rounded-lg p-4">
            <h4 class="text-lg font-bold text-white mb-4">Product Summary</h4>
            <pre class="text-[#baba9c] text-xs overflow-auto">${JSON.stringify(transaction.product_summary, null, 2)}</pre>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Update total count display
   */
  updateTotalCount() {
    const totalCount = document.getElementById('total-transactions-count');
    if (totalCount) {
      totalCount.textContent = this.filteredTransactions.length;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const paymentTypeFilter = document.getElementById('payment-type-filter');
    const retryBtn = document.getElementById('retry-btn');
    const closeModal = document.getElementById('close-modal');
    const modal = document.getElementById('transaction-modal');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterTransactions());
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterTransactions());
    }

    if (paymentTypeFilter) {
      paymentTypeFilter.addEventListener('change', () => this.filterTransactions());
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadTransactions());
    }

    if (closeModal) {
      closeModal.addEventListener('click', () => {
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }

    // Close modal on outside click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }
  }
}

// Initialize service when DOM is ready
const sumupTransactionsService = new SumUpTransactionsService();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    sumupTransactionsService.init();
  });
} else {
  sumupTransactionsService.init();
}

