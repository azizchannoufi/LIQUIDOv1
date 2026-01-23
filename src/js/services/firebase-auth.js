/**
 * Firebase Authentication Service
 * Handles user authentication (sign up, sign in, sign out) and user profile management
 */

class FirebaseAuthService {
    constructor() {
        this.auth = null;
        this.database = null;
        this.initialized = false;
        this.initPromise = null;
    }

    /**
     * Initialize Firebase Auth
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
                const { auth, database } = await window.firebaseConfig.initializeFirebase();
                this.auth = auth;
                this.database = database;
                this.initialized = true;
            } catch (error) {
                console.error('Error initializing Firebase Auth Service:', error);
                this.initPromise = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    /**
     * Sign up a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} name - User name
     * @param {string} phone - User phone number
     * @returns {Promise<Object>} User object
     */
    async signUp(email, password, name, phone) {
        await this.initialize();

        try {
            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save user profile to Realtime Database
            const userData = {
                email: email,
                name: name,
                phone: phone,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };

            await this.saveUserProfile(user.uid, userData);

            // Save to localStorage
            const userProfile = {
                uid: user.uid,
                email: email,
                name: name,
                phone: phone
            };
            localStorage.setItem('liquido_user', JSON.stringify(userProfile));

            return {
                uid: user.uid,
                email: user.email,
                ...userData
            };
        } catch (error) {
            console.error('Error signing up:', error);
            throw this._handleAuthError(error);
        }
    }

    /**
     * Sign in an existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User object
     */
    async signIn(email, password) {
        await this.initialize();

        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get user profile from database
            const userProfile = await this.getUserProfile(user.uid);

            // Save to localStorage
            const userData = {
                uid: user.uid,
                email: user.email,
                ...userProfile
            };
            localStorage.setItem('liquido_user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error('Error signing in:', error);
            throw this._handleAuthError(error);
        }
    }

    /**
     * Sign out current user
     * @returns {Promise<void>}
     */
    async signOut() {
        await this.initialize();

        try {
            await this.auth.signOut();
            localStorage.removeItem('liquido_user');
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    /**
     * Get current authenticated user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        if (!this.auth) {
            return null;
        }
        return this.auth.currentUser;
    }

    /**
     * Observe authentication state changes
     * @param {Function} callback - Callback function(user)
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChanged(callback) {
        if (!this.auth) {
            this.initialize().then(() => {
                return this.auth.onAuthStateChanged(callback);
            });
            return () => {};
        }
        return this.auth.onAuthStateChanged(callback);
    }

    /**
     * Save user profile to Realtime Database
     * @param {string} userId - User ID
     * @param {Object} userData - User data to save
     * @returns {Promise<void>}
     */
    async saveUserProfile(userId, userData) {
        await this.initialize();

        try {
            const userRef = this.database.ref(`users/${userId}`);
            await userRef.set(userData);
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    }

    /**
     * Get user profile from Realtime Database
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile data
     */
    async getUserProfile(userId) {
        await this.initialize();

        try {
            const userRef = this.database.ref(`users/${userId}`);
            const snapshot = await userRef.once('value');
            return snapshot.val() || null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    /**
     * Handle authentication errors and return user-friendly messages
     * @param {Error} error - Firebase error
     * @returns {Error} Formatted error with user-friendly message
     */
    _handleAuthError(error) {
        let message = 'Si è verificato un errore. Riprova.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Questa email è già registrata.';
                break;
            case 'auth/invalid-email':
                message = 'Indirizzo email non valido.';
                break;
            case 'auth/operation-not-allowed':
                message = 'Operazione non consentita.';
                break;
            case 'auth/weak-password':
                message = 'La password è troppo debole. Usa almeno 6 caratteri.';
                break;
            case 'auth/user-disabled':
                message = 'Questo account è stato disabilitato.';
                break;
            case 'auth/user-not-found':
                message = 'Nessun account trovato con questa email.';
                break;
            case 'auth/wrong-password':
                message = 'Password errata.';
                break;
            case 'auth/too-many-requests':
                message = 'Troppi tentativi. Riprova più tardi.';
                break;
            default:
                message = error.message || message;
        }

        const formattedError = new Error(message);
        formattedError.code = error.code;
        return formattedError;
    }
}

// Create singleton instance
const firebaseAuthService = new FirebaseAuthService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseAuthService;
}

// Make available globally
window.firebaseAuthService = firebaseAuthService;

