/**
 * Users List Service
 * Fetches and displays registered users from Firebase Realtime Database
 */

class UsersListService {
    constructor() {
        this.database = null;
        this.initialized = false;
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
            console.error('Error initializing Users List Service:', error);
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
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    /**
     * Render users list in the sidebar
     * @param {Array} users - Array of user objects
     */
    renderUsersList(users) {
        const usersCountEl = document.getElementById('users-count');
        const usersListEl = document.getElementById('users-list');

        if (!usersCountEl || !usersListEl) {
            console.error('Users list elements not found');
            return;
        }

        // Update count
        usersCountEl.textContent = users.length;

        // Clear existing content
        usersListEl.innerHTML = '';

        if (users.length === 0) {
            usersListEl.innerHTML = '<div class="text-slate-400 dark:text-[#baba9c] text-center py-2">No users yet</div>';
            return;
        }

        // Show first 5 users (most recent)
        const displayUsers = users.slice(0, 5);
        
        displayUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'flex flex-col gap-1 p-2 rounded bg-slate-50 dark:bg-[#12120a] border border-slate-200 dark:border-[#393928]';
            
            const name = user.name || 'No name';
            const email = user.email || 'No email';
            const date = this.formatDate(user.createdAt);

            userItem.innerHTML = `
                <div class="font-semibold text-slate-700 dark:text-white truncate">${name}</div>
                <div class="text-slate-500 dark:text-[#baba9c] text-xs truncate">${email}</div>
                <div class="text-slate-400 dark:text-slate-600 text-xs">${date}</div>
            `;

            usersListEl.appendChild(userItem);
        });

        // Show "show more" if there are more users
        if (users.length > 5) {
            const moreItem = document.createElement('div');
            moreItem.className = 'text-center pt-2';
            moreItem.innerHTML = `<span class="text-xs text-primary font-semibold">+${users.length - 5} more</span>`;
            usersListEl.appendChild(moreItem);
        }
    }

    /**
     * Initialize and load users
     */
    async loadUsers() {
        try {
            const users = await this.getAllUsers();
            this.renderUsersList(users);
        } catch (error) {
            console.error('Error loading users:', error);
            const usersListEl = document.getElementById('users-list');
            if (usersListEl) {
                usersListEl.innerHTML = '<div class="text-red-500 dark:text-red-400 text-center py-2 text-xs">Error loading users</div>';
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const usersListService = new UsersListService();
    usersListService.loadUsers();
});

// Make available globally
window.usersListService = new UsersListService();

