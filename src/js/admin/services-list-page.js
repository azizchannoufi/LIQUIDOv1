/**
 * Services List Page Service
 * Manages the services list page with search, display, and filtering
 */

class ServicesListPageService {
    constructor() {
        this.database = null;
        this.firestore = null;
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

            const { database, firestore } = await window.firebaseConfig.initializeFirebase();

            if (!database || !firestore) {
                throw new Error('Database or Firestore not returned from initializeFirebase');
            }

            this.database = database;
            this.firestore = firestore;
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
            // Get all services from Firestore
            const servicesRef = this.firestore.collection('services');
            const servicesSnapshot = await servicesRef.get();
            const services = [];

            servicesSnapshot.forEach(doc => {
                const data = doc.data();
                
                services.push({
                    serviceId: doc.id,
                    userId: data.userId,
                    serviceType: data.serviceType,
                    typeDisplay: data.serviceType === 'product-request' ? 'Richiesta Prodotto' : 'Richiesta Manutenzione',
                    userName: data.userName || 'N/A',
                    userEmail: data.userEmail || 'N/A',
                    userPhone: data.userPhone || 'N/A',
                    ...data,
                    createdAt: data.createdAt ? (data.createdAt.toMillis ? data.createdAt.toMillis() : data.createdAt) : 0
                });
            });

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
        return date.toLocaleDateString('it-IT', {
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

        const statusLabels = {
            'pending': 'In Attesa',
            'confirmed': 'Confermato',
            'completed': 'Completato',
            'cancelled': 'Annullato'
        };

        const color = statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        const displayStatus = statusLabels[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Sconosciuto');

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

        const typeLabels = {
            'product-request': 'Richiesta Prodotto',
            'maintenance-request': 'Richiesta Manutenzione'
        };

        const color = typeColors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        const displayType = typeLabels[type] || 'Sconosciuto';

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
                parts.push('Ha Immagine');
            }
            if (service.message) {
                const messagePreview = service.message.length > 50
                    ? service.message.substring(0, 50) + '...'
                    : service.message;
                parts.push(messagePreview);
            }
            return parts.length > 0 ? parts.join(' • ') : 'Nessun dettaglio';
        } else if (service.serviceType === 'maintenance-request') {
            const parts = [];
            if (service.date) {
                parts.push(`Data: ${service.date}`);
            }
            if (service.time) {
                parts.push(`Ora: ${service.time}`);
            }
            if (service.description) {
                const descPreview = service.description.length > 30
                    ? service.description.substring(0, 30) + '...'
                    : service.description;
                parts.push(descPreview);
            }
            return parts.length > 0 ? parts.join(' • ') : 'Nessun dettaglio';
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
                        ${service.productImage ? `<a href="${service.productImage}" target="_blank" class="text-primary text-xs hover:underline mt-1">Visualizza Immagine</a>` : ''}
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
                            <option value="pending" ${service.status === 'pending' ? 'selected' : ''}>In Attesa</option>
                            <option value="confirmed" ${service.status === 'confirmed' ? 'selected' : ''}>Confermato</option>
                            <option value="completed" ${service.status === 'completed' ? 'selected' : ''}>Completato</option>
                            <option value="cancelled" ${service.status === 'cancelled' ? 'selected' : ''}>Annullato</option>
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
                        Aggiorna
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
                    AdminToast.error('Servizio non trovato');
                    return;
                }

                if (newStatus === currentService.status) {
                    console.log('Status unchanged, skipping update');
                    return; // No change
                }

                // Disable button during update
                newBtn.disabled = true;
                newBtn.textContent = 'Aggiornamento...';
                newBtn.style.opacity = '0.6';
                newBtn.style.cursor = 'not-allowed';

                try {
                    console.log(`Updating service status: ${userId}/${serviceId} -> ${newStatus}`);
                    await this.updateServiceStatus(userId, serviceId, serviceType, newStatus);
                } catch (error) {
                    console.error('Error updating status:', error);
                    AdminToast.error('Errore durante l\'aggiornamento: ' + error.message);
                } finally {
                    newBtn.disabled = false;
                    newBtn.textContent = 'Aggiorna';
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

        if (!this.firestore) {
            throw new Error('Firestore not initialized');
        }

        try {
            const serviceRef = this.firestore.collection('services').doc(serviceId);

            await serviceRef.update({ status: newStatus });
            console.log(`✅ Service status updated successfully: ${serviceId} -> ${newStatus}`);

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
            const statusLabels = {
                'pending': 'In Attesa',
                'confirmed': 'Confermato',
                'completed': 'Completato',
                'cancelled': 'Annullato'
            };
            const displayStatus = statusLabels[newStatus] || newStatus;
            AdminToast.success(`Stato servizio aggiornato: ${displayStatus}`);
        } catch (error) {
            console.error('Error updating service status:', error);
            AdminToast.error('Errore aggiornamento stato servizio: ' + error.message);
            throw error;
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    // Toast handled by AdminToast global utility (src/js/admin/admin-toast.js)

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

