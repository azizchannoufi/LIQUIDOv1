/**
 * Orders List Page Service
 * Manages the orders list page with search, display, and filtering
 */

class OrdersListPageService {
    constructor() {
        this.database = null;
        this.initialized = false;
        this.allOrders = [];
        this.filteredOrders = [];
    }

    async initialize() {
        if (this.initialized && this.database) {
            return;
        }

        try {
            // Wait for firebaseConfig to be available
            if (typeof window.firebaseConfig === 'undefined') {
                console.warn('firebaseConfig not loaded yet, waiting...');
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (typeof window.firebaseConfig !== 'undefined') {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                });
            }
            
            const { database } = await window.firebaseConfig.initializeFirebase();
            
            if (!database) {
                throw new Error('Database not returned from initializeFirebase');
            }
            
            this.database = database;
            this.initialized = true;
            console.log('✅ Orders List Page Service initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Orders List Page Service:', error);
            throw error;
        }
    }

    /**
     * Fetch all orders from Firebase
     * @returns {Promise<Array>} Array of order objects with user info
     */
    async getAllOrders() {
        await this.initialize();

        try {
            const usersRef = this.database.ref('users');
            const snapshot = await usersRef.once('value');
            const usersData = snapshot.val();

            if (!usersData) {
                return [];
            }

            const orders = [];

            // Iterate through all users
            for (const userId of Object.keys(usersData)) {
                const user = usersData[userId];
                const ordersRef = this.database.ref(`users/${userId}/orders`);
                const ordersSnapshot = await ordersRef.once('value');
                const userOrders = ordersSnapshot.val();

                if (userOrders) {
                    // Add each order with user info
                    for (const orderId of Object.keys(userOrders)) {
                        orders.push({
                            orderId: orderId,
                            userId: userId,
                            userName: user.name || 'N/A',
                            userEmail: user.email || 'N/A',
                            userPhone: user.phone || 'N/A',
                            ...userOrders[orderId]
                        });
                    }
                }
            }

            // Sort by creation date (newest first)
            return orders.sort((a, b) => {
                const dateA = a.createdAt || 0;
                const dateB = b.createdAt || 0;
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    /**
     * Format date timestamp to readable string
     * @param {number} timestamp - Firebase timestamp
     * @returns {string} Formatted date string
     */
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get status badge HTML
     * @param {string} status - Order status
     * @returns {string} HTML string
     */
    getStatusBadge(status) {
        const statusColors = {
            'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'confirmed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
            'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
        };

        const color = statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

        return `<span class="px-3 py-1 rounded-full text-xs font-semibold border ${color}">${displayStatus}</span>`;
    }

    /**
     * Filter orders based on search and status
     */
    filterOrders() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;

        this.filteredOrders = this.allOrders.filter(order => {
            const matchesSearch = !searchTerm || 
                (order.productName && order.productName.toLowerCase().includes(searchTerm)) ||
                (order.userName && order.userName.toLowerCase().includes(searchTerm)) ||
                (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm)) ||
                (order.date && order.date.includes(searchTerm));

            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderOrders();
    }

    /**
     * Render orders table
     */
    renderOrders() {
        const tbody = document.getElementById('orders-tbody');
        const table = document.getElementById('orders-table');
        const emptyState = document.getElementById('empty-state');
        const totalCount = document.getElementById('total-orders-count');

        if (!tbody || !table || !emptyState) return;

        // Update total count
        if (totalCount) {
            totalCount.textContent = this.filteredOrders.length;
        }

        // Clear existing rows
        tbody.innerHTML = '';

        if (this.filteredOrders.length === 0) {
            table.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        table.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // Render each order
        this.filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-border-dark/20 transition-colors';

            const orderDate = order.date || 'N/A';
            const orderTime = order.time || 'N/A';
            const createdAt = this.formatDate(order.createdAt);

            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-white font-semibold">#${order.orderId.substring(0, 8)}</span>
                        <span class="text-[#baba9c] text-xs">${createdAt}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-white font-medium">${order.userName}</span>
                        <span class="text-[#baba9c] text-xs">${order.userEmail}</span>
                        ${order.userPhone ? `<span class="text-[#baba9c] text-xs">${order.userPhone}</span>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-white font-medium">${order.productName || 'N/A'}</span>
                        ${order.productDetails && Object.keys(order.productDetails).length > 0 ? 
                            `<span class="text-[#baba9c] text-xs">${Object.entries(order.productDetails).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-white font-medium">${orderDate}</span>
                        <span class="text-[#baba9c] text-xs">${orderTime}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        ${this.getStatusBadge(order.status)}
                        <select class="status-select ml-2 px-2 py-1 rounded bg-border-dark border border-border-dark text-white text-xs focus:ring-1 focus:ring-primary focus:outline-none" 
                                data-order-id="${order.orderId}" 
                                data-user-id="${order.userId}" 
                                value="${order.status || 'pending'}">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-[#baba9c] text-sm">${createdAt}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button class="update-status-btn px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-semibold transition-colors" 
                            data-order-id="${order.orderId}" 
                            data-user-id="${order.userId}">
                        Update
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
        
        // Add event listeners for status updates
        this.setupStatusUpdateListeners();
    }
    
    /**
     * Setup event listeners for status updates
     */
    setupStatusUpdateListeners() {
        const updateButtons = document.querySelectorAll('.update-status-btn');
        updateButtons.forEach(btn => {
            // Remove existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                const userId = e.currentTarget.dataset.userId;
                const select = document.querySelector(`select[data-order-id="${orderId}"]`);
                if (!select) return;
                
                const newStatus = select.value;
                const currentOrder = this.allOrders.find(o => o.orderId === orderId && o.userId === userId);
                
                if (!currentOrder || newStatus === currentOrder.status) {
                    return; // No change
                }
                
                // Disable button during update
                newBtn.disabled = true;
                newBtn.textContent = 'Updating...';
                newBtn.style.opacity = '0.6';
                
                try {
                    await this.updateOrderStatus(userId, orderId, newStatus);
                } catch (error) {
                    console.error('Error updating status:', error);
                    alert('Erreur lors de la mise à jour: ' + error.message);
                } finally {
                    newBtn.disabled = false;
                    newBtn.textContent = 'Update';
                    newBtn.style.opacity = '1';
                }
            });
        });
    }
    
    /**
     * Update order status in Firebase
     * @param {string} userId - User ID
     * @param {string} orderId - Order ID
     * @param {string} newStatus - New status
     */
    async updateOrderStatus(userId, orderId, newStatus) {
        await this.initialize();
        
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        
        try {
            // Use update() method to update only the status field
            const orderRef = this.database.ref(`users/${userId}/orders/${orderId}`);
            
            // Wrap in Promise to ensure proper async handling
            await new Promise((resolve, reject) => {
                orderRef.update({ status: newStatus })
                    .then(() => {
                        console.log(`✅ Status updated successfully: ${userId}/${orderId} -> ${newStatus}`);
                        resolve();
                    })
                    .catch((error) => {
                        console.error('❌ Error updating status:', error);
                        reject(error);
                    });
            });
            
            // Update local data
            const order = this.allOrders.find(o => o.orderId === orderId && o.userId === userId);
            if (order) {
                order.status = newStatus;
            }
            
            // Update filtered orders
            const filteredOrder = this.filteredOrders.find(o => o.orderId === orderId && o.userId === userId);
            if (filteredOrder) {
                filteredOrder.status = newStatus;
            }
            
            // Re-render to show updated status
            this.renderOrders();
            
            // Show success message
            this.showSuccessMessage(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Erreur lors de la mise à jour du statut: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        // Remove existing message if any
        let successDiv = document.getElementById('status-update-success');
        if (successDiv) {
            successDiv.remove();
        }
        
        // Create new success message
        successDiv = document.createElement('div');
        successDiv.id = 'status-update-success';
        successDiv.className = 'fixed top-4 right-4 z-[200] px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg font-semibold flex items-center gap-2';
        successDiv.innerHTML = `
            <span class="material-symbols-outlined">check_circle</span>
            <span>${message}</span>
        `;
        document.body.appendChild(successDiv);
        
        // Animate in
        successDiv.style.opacity = '0';
        successDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            successDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            successDiv.style.opacity = '1';
            successDiv.style.transform = 'translateY(0)';
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            successDiv.style.opacity = '0';
            successDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (successDiv && successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * Initialize and load orders
     */
    async loadOrders() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const table = document.getElementById('orders-table');

        try {
            if (loadingState) loadingState.classList.remove('hidden');
            if (errorState) errorState.classList.add('hidden');
            if (table) table.classList.add('hidden');

            this.allOrders = await this.getAllOrders();
            this.filteredOrders = [...this.allOrders];
            this.renderOrders();

            if (loadingState) loadingState.classList.add('hidden');
        } catch (error) {
            console.error('Error loading orders:', error);
            if (loadingState) loadingState.classList.add('hidden');
            if (errorState) errorState.classList.remove('hidden');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const statusFilter = document.getElementById('status-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterOrders());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterOrders());
        }
    }
}

// Initialize service
const ordersListPageService = new OrdersListPageService();

// Load orders when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ordersListPageService.setupEventListeners();
        ordersListPageService.loadOrders();
    });
} else {
    ordersListPageService.setupEventListeners();
    ordersListPageService.loadOrders();
}

