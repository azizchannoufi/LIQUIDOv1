/**
 * Users List Page Service
 * Manages the users list page with search, display, and communication features
 */

class UsersListPageService {
    constructor() {
        this.database = null;
        this.initialized = false;
        this.allUsers = [];
        this.filteredUsers = [];
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            const { database } = await window.firebaseConfig.initializeFirebase();
            this.database = database;
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing Users List Page Service:', error);
            throw error;
        }
    }

    /**
     * Fetch all registered users from Firebase
     * @returns {Promise<Array>} Array of user objects
     */
    async getAllUsers() {
        await this.initialize();

        try {
            const usersRef = this.database.ref('users');
            const snapshot = await usersRef.once('value');
            const usersData = snapshot.val();

            if (!usersData) {
                return [];
            }

            // Convert object to array and add userId
            const users = Object.keys(usersData).map(userId => ({
                uid: userId,
                ...usersData[userId]
            }));

            // Sort by creation date (newest first)
            return users.sort((a, b) => {
                const dateA = a.createdAt || 0;
                const dateB = b.createdAt || 0;
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error fetching users:', error);
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
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diffMs / (1000 * 60));
                return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            }
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    /**
     * Format phone number for WhatsApp
     * @param {string} phone - Phone number
     * @returns {string} Formatted phone number
     */
    formatPhoneForWhatsApp(phone) {
        if (!phone) return '';
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        // If starts with 0, replace with country code (assuming Italy +39)
        if (cleaned.startsWith('0')) {
            cleaned = '39' + cleaned.substring(1);
        }
        // If doesn't start with country code, add it
        if (!cleaned.startsWith('39') && !cleaned.startsWith('+')) {
            cleaned = '39' + cleaned;
        }
        return cleaned;
    }

    /**
     * Open WhatsApp chat with user
     * @param {string} phone - User phone number
     * @param {string} name - User name
     */
    openWhatsApp(phone, name) {
        if (!phone) {
            alert('Phone number not available for this user');
            return;
        }

        const formattedPhone = this.formatPhoneForWhatsApp(phone);
        const message = encodeURIComponent(`Hello ${name || 'there'}, this is LIQUIDO. How can we help you today?`);
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }

    /**
     * Open email client to send email to user
     * @param {string} email - User email
     * @param {string} name - User name
     */
    openEmail(email, name) {
        if (!email) {
            alert('Email address not available for this user');
            return;
        }

        const subject = encodeURIComponent(`Message from LIQUIDO`);
        const body = encodeURIComponent(`Hello ${name || 'there'},\n\n`);
        const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;
    }

    /**
     * Filter users based on search query
     * @param {string} query - Search query
     */
    filterUsers(query) {
        if (!query || query.trim() === '') {
            this.filteredUsers = [...this.allUsers];
        } else {
            const lowerQuery = query.toLowerCase().trim();
            this.filteredUsers = this.allUsers.filter(user => {
                const name = (user.name || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                const phone = (user.phone || '').toLowerCase();
                return name.includes(lowerQuery) || 
                       email.includes(lowerQuery) || 
                       phone.includes(lowerQuery);
            });
        }
        this.renderUsers();
    }

    /**
     * Render users list in the table
     */
    renderUsers() {
        const tbody = document.getElementById('users-tbody');
        const table = document.getElementById('users-table');
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const emptyState = document.getElementById('empty-state');
        const totalCountEl = document.getElementById('total-users-count');

        if (!tbody) return;

        // Hide all states first
        if (loadingState) loadingState.classList.add('hidden');
        if (errorState) errorState.classList.add('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (table) table.classList.add('hidden');

        // Update total count
        if (totalCountEl) {
            totalCountEl.textContent = this.allUsers.length;
        }

        // Clear existing content
        tbody.innerHTML = '';

        if (this.filteredUsers.length === 0) {
            if (this.allUsers.length === 0) {
                if (emptyState) emptyState.classList.remove('hidden');
            } else {
                // No results from search
                const row = document.createElement('tr');
                row.className = 'text-center';
                row.innerHTML = `
                    <td colspan="5" class="px-6 py-8 text-[#baba9c]">
                        No users found matching your search
                    </td>
                `;
                tbody.appendChild(row);
                if (table) table.classList.remove('hidden');
            }
            return;
        }

        // Show table
        if (table) table.classList.remove('hidden');

        // Render each user
        this.filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-border-dark/20 transition-colors';

            const name = user.name || 'No name';
            const email = user.email || 'No email';
            const phone = user.phone || 'No phone';
            const date = this.formatDate(user.createdAt);

            // Escape HTML and quotes for safe rendering
            const escapeHtml = (str) => {
                if (!str) return '';
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            };

            const safeName = escapeHtml(name);
            const safeEmail = escapeHtml(email);
            const safePhone = escapeHtml(phone);
            const safeNameAttr = name.replace(/'/g, "&#39;").replace(/"/g, "&quot;");

            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div>
                            <div class="text-white font-semibold">${safeName}</div>
                            <div class="text-[#baba9c] text-xs">ID: ${user.uid.substring(0, 8)}...</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-white">${safeEmail}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-white">${safePhone}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-[#baba9c] text-sm">${date}</div>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        ${phone && phone !== 'No phone' ? `
                        <button 
                            data-phone="${safePhone}"
                            data-name="${safeNameAttr}"
                            class="whatsapp-btn flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
                            title="Send WhatsApp message">
                            <span class="material-symbols-outlined text-sm">chat</span>
                            <span>WhatsApp</span>
                        </button>
                        ` : ''}
                        ${email && email !== 'No email' ? `
                        <button 
                            data-email="${safeEmail}"
                            data-name="${safeNameAttr}"
                            class="email-btn flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                            title="Send email">
                            <span class="material-symbols-outlined text-sm">email</span>
                            <span>Email</span>
                        </button>
                        ` : ''}
                    </div>
                </td>
            `;

            // Add event listeners for buttons
            const whatsappBtn = row.querySelector('.whatsapp-btn');
            if (whatsappBtn) {
                whatsappBtn.addEventListener('click', () => {
                    this.openWhatsApp(whatsappBtn.dataset.phone, whatsappBtn.dataset.name);
                });
            }

            const emailBtn = row.querySelector('.email-btn');
            if (emailBtn) {
                emailBtn.addEventListener('click', () => {
                    this.openEmail(emailBtn.dataset.email, emailBtn.dataset.name);
                });
            }

            tbody.appendChild(row);
        });
    }

    /**
     * Initialize and load users
     */
    async loadUsers() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const table = document.getElementById('users-table');

        try {
            if (loadingState) loadingState.classList.remove('hidden');
            if (errorState) errorState.classList.add('hidden');
            if (table) table.classList.add('hidden');

            this.allUsers = await this.getAllUsers();
            this.filteredUsers = [...this.allUsers];
            this.renderUsers();

            if (loadingState) loadingState.classList.add('hidden');
        } catch (error) {
            console.error('Error loading users:', error);
            if (loadingState) loadingState.classList.add('hidden');
            if (errorState) errorState.classList.remove('hidden');
        }
    }
}

// Initialize service
const usersListPageService = new UsersListPageService();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load users
    usersListPageService.loadUsers();

    // Setup search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                usersListPageService.filterUsers(e.target.value);
            }, 300);
        });
    }
});

// Make available globally
window.usersListPageService = usersListPageService;

