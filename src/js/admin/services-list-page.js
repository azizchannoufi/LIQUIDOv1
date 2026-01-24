/**
 * Services List Page Service
 * Manages the services list page with search, display, and filtering
 */

class ServicesListPageService {
    constructor() {
        this.database = null;
        this.initialized = false;
        this.allServices = [];
        this.filteredServices = [];
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
            console.log('✅ Services List Page Service initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Services List Page Service:', error);
            throw error;
        }
    }

    /**
     * Fetch all services from Firebase
     * @returns {Promise<Array>} Array of service objects with user info
     */
    async getAllServices() {
        await this.initialize();

        try {
            const usersRef = this.database.ref('users');
            const snapshot = await usersRef.once('value');
            const usersData = snapshot.val();

            if (!usersData) {
                return [];
            }

            const services = [];

            // Iterate through all users
            for (const userId of Object.keys(usersData)) {
                const user = usersData[userId];
                
                // Fetch product requests
                const productRequestsRef = this.database.ref(`users/${userId}/services/product-requests`);
                const productRequestsSnapshot = await productRequestsRef.once('value');
                const productRequests = productRequestsSnapshot.val();

                if (productRequests) {
                    for (const requestId of Object.keys(productRequests)) {
                        services.push({
                            serviceId: requestId,
                            userId: userId,
                            serviceType: 'product-request',
                            typeDisplay: 'Product Request',
                            userName: user.name || 'N/A',
                            userEmail: user.email || 'N/A',
                            userPhone: user.phone || 'N/A',
                            ...productRequests[requestId]
                        });
                    }
                }

                // Fetch maintenance requests
                const maintenanceRequestsRef = this.database.ref(`users/${userId}/services/maintenance-requests`);
                const maintenanceRequestsSnapshot = await maintenanceRequestsRef.once('value');
                const maintenanceRequests = maintenanceRequestsSnapshot.val();

                if (maintenanceRequests) {
                    for (const requestId of Object.keys(maintenanceRequests)) {
                        services.push({
                            serviceId: requestId,
                            userId: userId,
                            serviceType: 'maintenance-request',
                            typeDisplay: 'Maintenance Request',
                            userName: user.name || 'N/A',
                            userEmail: user.email || 'N/A',
                            userPhone: user.phone || 'N/A',
                            ...maintenanceRequests[requestId]
                        });
                    }
                }
            }

            // Sort by creation date (newest first)
            return services.sort((a, b) => {
                const dateA = a.createdAt || 0;
                const dateB = b.createdAt || 0;
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error fetching services:', error);
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
     * @param {string} status - Service status
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
     * Get type badge HTML
     * @param {string} type - Service type
     * @returns {string} HTML string
     */
    getTypeBadge(type) {
        const typeColors = {
            'product-request': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'maintenance-request': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
        };

        const color = typeColors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        const displayType = type === 'product-request' ? 'Product Request' : 
                           type === 'maintenance-request' ? 'Maintenance' : 'Unknown';

        return `<span class="px-3 py-1 rounded-full text-xs font-semibold border ${color}">${displayType}</span>`;
    }

    /**
     * Format service details based on type
     * @param {Object} service - Service object
     * @returns {string} Formatted details string
     */
    formatServiceDetails(service) {
        if (service.serviceType === 'product-request') {
            const parts = [];
            if (service.productImage) {
                parts.push('Has Image');
            }
            if (service.message) {
                const messagePreview = service.message.length > 50 
                    ? service.message.substring(0, 50) + '...' 
                    : service.message;
                parts.push(messagePreview);
            }
            return parts.length > 0 ? parts.join(' • ') : 'No details';
        } else if (service.serviceType === 'maintenance-request') {
            const parts = [];
            if (service.date) {
                parts.push(`Date: ${service.date}`);
            }
            if (service.time) {
                parts.push(`Time: ${service.time}`);
            }
            if (service.description) {
                const descPreview = service.description.length > 30 
                    ? service.description.substring(0, 30) + '...' 
                    : service.description;
                parts.push(descPreview);
            }
            return parts.length > 0 ? parts.join(' • ') : 'No details';
        }
        return 'N/A';
    }

    /**
     * Filter services based on search, type, and status
     */
    filterServices() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const typeFilter = document.getElementById('type-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        this.filteredServices = this.allServices.filter(service => {
            const matchesSearch = !searchTerm || 
                (service.userName && service.userName.toLowerCase().includes(searchTerm)) ||
                (service.userEmail && service.userEmail.toLowerCase().includes(searchTerm)) ||
                (service.typeDisplay && service.typeDisplay.toLowerCase().includes(searchTerm)) ||
                (service.message && service.message.toLowerCase().includes(searchTerm)) ||
                (service.description && service.description.toLowerCase().includes(searchTerm));

            const matchesType = typeFilter === 'all' || service.serviceType === typeFilter;
            const matchesStatus = statusFilter === 'all' || service.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });

        this.renderServices();
    }

    /**
     * Render services table
     */
    renderServices() {
        const tbody = document.getElementById('services-tbody');
        const table = document.getElementById('services-table');
        const emptyState = document.getElementById('empty-state');
        const totalCount = document.getElementById('total-services-count');

        if (!tbody || !table || !emptyState) return;

        // Update total count
        if (totalCount) {
            totalCount.textContent = this.filteredServices.length;
        }

        // Clear existing rows
        tbody.innerHTML = '';

        if (this.filteredServices.length === 0) {
            table.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        table.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // Render each service
        this.filteredServices.forEach(service => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-border-dark/20 transition-colors';

            const createdAt = this.formatDate(service.createdAt);
            const details = this.formatServiceDetails(service);

            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-white font-semibold">#${service.serviceId.substring(0, 8)}</span>
                        <span class="text-[#baba9c] text-xs">${createdAt}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-white font-medium">${service.userName}</span>
                        <span class="text-[#baba9c] text-xs">${service.userEmail}</span>
                        ${service.userPhone ? `<span class="text-[#baba9c] text-xs">${service.userPhone}</span>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    ${this.getTypeBadge(service.serviceType)}
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-white text-sm">${details}</span>
                        ${service.productImage ? `<a href="${service.productImage}" target="_blank" class="text-primary text-xs hover:underline mt-1">View Image</a>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        ${this.getStatusBadge(service.status)}
                        <select class="status-select ml-2 px-2 py-1 rounded bg-border-dark border border-border-dark text-white text-xs focus:ring-1 focus:ring-primary focus:outline-none" 
                                data-service-id="${service.serviceId}" 
                                data-user-id="${service.userId}"
                                data-service-type="${service.serviceType}"
                                value="${service.status || 'pending'}">
                            <option value="pending" ${service.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${service.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="completed" ${service.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${service.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-[#baba9c] text-sm">${createdAt}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button class="update-status-btn px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-semibold transition-colors" 
                            data-service-id="${service.serviceId}" 
                            data-user-id="${service.userId}"
                            data-service-type="${service.serviceType}">
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
                e.preventDefault();
                e.stopPropagation();
                
                const serviceId = e.currentTarget.dataset.serviceId;
                const userId = e.currentTarget.dataset.userId;
                const serviceType = e.currentTarget.dataset.serviceType;
                const select = document.querySelector(`select[data-service-id="${serviceId}"]`);
                
                if (!select) {
                    console.error('Select element not found for service:', serviceId);
                    return;
                }
                
                const newStatus = select.value;
                const currentService = this.allServices.find(s => s.serviceId === serviceId && s.userId === userId);
                
                if (!currentService) {
                    console.error('Service not found:', serviceId, userId);
                    alert('Service introuvable');
                    return;
                }
                
                if (newStatus === currentService.status) {
                    console.log('Status unchanged, skipping update');
                    return; // No change
                }
                
                // Disable button during update
                newBtn.disabled = true;
                newBtn.textContent = 'Updating...';
                newBtn.style.opacity = '0.6';
                newBtn.style.cursor = 'not-allowed';
                
                try {
                    console.log(`Updating service status: ${userId}/${serviceId} -> ${newStatus}`);
                    await this.updateServiceStatus(userId, serviceId, serviceType, newStatus);
                } catch (error) {
                    console.error('Error updating status:', error);
                    alert('Erreur lors de la mise à jour: ' + error.message);
                } finally {
                    newBtn.disabled = false;
                    newBtn.textContent = 'Update';
                    newBtn.style.opacity = '1';
                    newBtn.style.cursor = 'pointer';
                }
            });
        });
    }
    
    /**
     * Update service status in Firebase
     * @param {string} userId - User ID
     * @param {string} serviceId - Service ID
     * @param {string} serviceType - Service type (product-request or maintenance-request)
     * @param {string} newStatus - New status
     */
    async updateServiceStatus(userId, serviceId, serviceType, newStatus) {
        await this.initialize();
        
        if (!this.database) {
            throw new Error('Database not initialized');
        }
        
        try {
            // Determine the correct path based on service type
            const servicePath = serviceType === 'product-request' 
                ? `users/${userId}/services/product-requests/${serviceId}`
                : `users/${userId}/services/maintenance-requests/${serviceId}`;
            
            const serviceRef = this.database.ref(servicePath);
            
            // Wrap in Promise to ensure proper async handling
            await new Promise((resolve, reject) => {
                serviceRef.update({ status: newStatus })
                    .then(() => {
                        console.log(`✅ Service status updated successfully: ${userId}/${serviceId} -> ${newStatus}`);
                        resolve();
                    })
                    .catch((error) => {
                        console.error('❌ Error updating service status:', error);
                        reject(error);
                    });
            });
            
            // Update local data
            const service = this.allServices.find(s => s.serviceId === serviceId && s.userId === userId);
            if (service) {
                service.status = newStatus;
            }
            
            // Update filtered services
            const filteredService = this.filteredServices.find(s => s.serviceId === serviceId && s.userId === userId);
            if (filteredService) {
                filteredService.status = newStatus;
            }
            
            // Re-render to show updated status
            this.renderServices();
            
            // Show success message
            this.showSuccessMessage(`Service status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating service status:', error);
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
     * Initialize and load services
     */
    async loadServices() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const table = document.getElementById('services-table');

        try {
            if (loadingState) loadingState.classList.remove('hidden');
            if (errorState) errorState.classList.add('hidden');
            if (table) table.classList.add('hidden');

            this.allServices = await this.getAllServices();
            this.filteredServices = [...this.allServices];
            this.renderServices();

            if (loadingState) loadingState.classList.add('hidden');
        } catch (error) {
            console.error('Error loading services:', error);
            if (loadingState) loadingState.classList.add('hidden');
            if (errorState) errorState.classList.remove('hidden');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const typeFilter = document.getElementById('type-filter');
        const statusFilter = document.getElementById('status-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterServices());
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterServices());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterServices());
        }
    }
}

// Initialize service
const servicesListPageService = new ServicesListPageService();

// Load services when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        servicesListPageService.setupEventListeners();
        servicesListPageService.loadServices();
    });
} else {
    servicesListPageService.setupEventListeners();
    servicesListPageService.loadServices();
}

