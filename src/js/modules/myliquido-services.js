/**
 * MyLiquido Services Module
 * Handles the two premium services: product request and maintenance service
 */

class MyLiquidoServices {
    constructor() {
        this.database = null;
        this.initialized = false;
        this.initPromise = null;
        this.WHATSAPP_NUMBER = '393444414036';
    }

    /**
     * Initialize Firebase Database connection
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                const { database } = await window.firebaseConfig.initializeFirebase();
                this.database = database;
                this.initialized = true;
            } catch (error) {
                console.error('Error initializing MyLiquido Services:', error);
                this.initPromise = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    /**
     * Service 1: Request special product
     * @param {string} userId - User ID
     * @param {string} productImageUrl - URL of uploaded product image
     * @param {string} message - User message
     * @param {Object} userProfile - User profile data
     * @returns {Promise<string>} WhatsApp URL
     */
    async requestSpecialProduct(userId, productImageUrl, message, userProfile) {
        await this.initialize();

        try {
            // Save request to Firebase
            const requestData = {
                productImage: productImageUrl,
                message: message,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'pending'
            };

            const requestRef = this.database.ref(`users/${userId}/services/product-requests`).push();
            await requestRef.set(requestData);

            // Generate WhatsApp message
            const whatsappMessage = this._formatProductRequestMessage(
                productImageUrl,
                message,
                userProfile
            );

            // Generate WhatsApp URL
            const whatsappUrl = this._generateWhatsAppUrl(whatsappMessage);

            return whatsappUrl;
        } catch (error) {
            console.error('Error requesting special product:', error);
            throw new Error('Errore durante la richiesta. Riprova.');
        }
    }

    /**
     * Service 2: Request maintenance service
     * @param {string} userId - User ID
     * @param {string} date - Selected date
     * @param {string} time - Selected time
     * @param {string} description - Service description
     * @param {Object} userProfile - User profile data
     * @returns {Promise<string>} WhatsApp URL
     */
    async requestMaintenanceService(userId, date, time, description, userProfile) {
        await this.initialize();

        try {
            // Save request to Firebase
            const requestData = {
                date: date,
                time: time,
                description: description,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'pending'
            };

            const requestRef = this.database.ref(`users/${userId}/services/maintenance-requests`).push();
            await requestRef.set(requestData);

            // Generate WhatsApp message
            const whatsappMessage = this._formatMaintenanceRequestMessage(
                date,
                time,
                description,
                userProfile
            );

            // Generate WhatsApp URL
            const whatsappUrl = this._generateWhatsAppUrl(whatsappMessage);

            return whatsappUrl;
        } catch (error) {
            console.error('Error requesting maintenance service:', error);
            throw new Error('Errore durante la prenotazione. Riprova.');
        }
    }

    /**
     * Service 3: Create product order for loyal customers
     * @param {string} userId - User ID
     * @param {Object} productInfo - Product information (name, details, etc.)
     * @param {string} date - Selected pickup date
     * @param {string} time - Selected pickup time
     * @param {Object} userProfile - User profile data
     * @returns {Promise<string>} WhatsApp URL
     */
    async createProductOrder(userId, productInfo, date, time, userProfile) {
        await this.initialize();

        try {
            // Save order to Firebase
            const orderData = {
                productName: productInfo.name || 'N/A',
                productDetails: productInfo.details || {},
                date: date,
                time: time,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'pending'
            };

            const orderRef = this.database.ref(`users/${userId}/orders`).push();
            await orderRef.set(orderData);

            // Generate WhatsApp message
            const whatsappMessage = this._formatProductOrderMessage(
                productInfo,
                date,
                time,
                userProfile
            );

            // Generate WhatsApp URL
            const whatsappUrl = this._generateWhatsAppUrl(whatsappMessage);

            return whatsappUrl;
        } catch (error) {
            console.error('Error creating product order:', error);
            throw new Error('Errore durante la creazione dell\'ordine. Riprova.');
        }
    }

    /**
     * Format product request message for WhatsApp
     * @param {string} imageUrl - Product image URL
     * @param {string} message - User message
     * @param {Object} userProfile - User profile
     * @returns {string} Formatted message
     */
    _formatProductRequestMessage(imageUrl, message, userProfile) {
        return `Ciao! Vorrei richiedere un prodotto speciale.

[Image: ${imageUrl}]

Messaggio: ${message}

Cliente: ${userProfile.name || 'N/A'}
Email: ${userProfile.email || 'N/A'}`;
    }

    /**
     * Format maintenance request message for WhatsApp
     * @param {string} date - Selected date
     * @param {string} time - Selected time
     * @param {string} description - Service description
     * @param {Object} userProfile - User profile
     * @returns {string} Formatted message
     */
    _formatMaintenanceRequestMessage(date, time, description, userProfile) {
        return `Ciao! Vorrei prenotare un servizio di manutenzione per la mia vape.

Data: ${date}
Ora: ${time}

Descrizione: ${description}

Cliente: ${userProfile.name || 'N/A'}
Email: ${userProfile.email || 'N/A'}
Telefono: ${userProfile.phone || 'N/A'}`;
    }

    /**
     * Format product order message for WhatsApp
     * @param {Object} productInfo - Product information
     * @param {string} date - Selected pickup date
     * @param {string} time - Selected pickup time
     * @param {Object} userProfile - User profile
     * @returns {string} Formatted message
     */
    _formatProductOrderMessage(productInfo, date, time, userProfile) {
        const productName = productInfo.name || 'Prodotto';
        const productDesc = productInfo.description || '';
        
        return `Ciao! Vorrei ordinare un prodotto come cliente fedele.

Prodotto: ${productName}
${productDesc ? `Descrizione: ${productDesc}` : ''}

Data di ritiro: ${date}
Ora di ritiro: ${time}

Cliente: ${userProfile.name || 'N/A'}
Email: ${userProfile.email || 'N/A'}
Telefono: ${userProfile.phone || 'N/A'}`;
    }

    /**
     * Generate WhatsApp URL with encoded message
     * @param {string} message - Message to send
     * @returns {string} WhatsApp URL
     */
    _generateWhatsAppUrl(message) {
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    }

    /**
     * Validate date is in the future
     * @param {string} date - Date string (YYYY-MM-DD)
     * @returns {boolean} True if date is valid and in the future
     */
    validateFutureDate(date) {
        if (!date) {
            return false;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        return selectedDate >= today;
    }

    /**
     * Validate time format (HH:MM)
     * @param {string} time - Time string
     * @returns {boolean} True if time is valid
     */
    validateTime(time) {
        if (!time) {
            return false;
        }

        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
}

// Create singleton instance
const myLiquidoServices = new MyLiquidoServices();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = myLiquidoServices;
}

// Make available globally
window.myLiquidoServices = myLiquidoServices;

