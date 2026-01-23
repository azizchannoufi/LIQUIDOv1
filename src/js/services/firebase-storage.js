/**
 * Firebase Storage Service
 * Handles file uploads to Firebase Storage
 */

class FirebaseStorageService {
    constructor() {
        this.storage = null;
        this.initialized = false;
        this.initPromise = null;
        
        // Configuration
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        this.ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    }

    /**
     * Initialize Firebase Storage
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
                const { storage } = await window.firebaseConfig.initializeFirebase();
                this.storage = storage;
                this.initialized = true;
            } catch (error) {
                console.error('Error initializing Firebase Storage Service:', error);
                this.initPromise = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     * @returns {Object} { valid: boolean, error: string }
     */
    validateFile(file) {
        if (!file) {
            return { valid: false, error: 'Nessun file selezionato.' };
        }

        // Check file type
        if (!this.ALLOWED_TYPES.includes(file.type)) {
            return { 
                valid: false, 
                error: 'Formato file non supportato. Usa JPG, PNG o WEBP.' 
            };
        }

        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            return { 
                valid: false, 
                error: 'File troppo grande. Dimensione massima: 5MB.' 
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Upload product image to Firebase Storage
     * @param {File} file - Image file to upload
     * @param {string} userId - User ID
     * @param {Function} onProgress - Progress callback (optional)
     * @returns {Promise<string>} Download URL of uploaded image
     */
    async uploadProductImage(file, userId, onProgress = null) {
        await this.initialize();

        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Ensure user is authenticated
        const { auth } = await window.firebaseConfig.initializeFirebase();
        const currentUser = auth ? auth.currentUser : null;
        
        if (!currentUser) {
            throw new Error('Devi essere autenticato per caricare immagini.');
        }

        try {
            // Wait for auth token to be ready
            const authToken = await currentUser.getIdToken();
            if (!authToken) {
                throw new Error('Token di autenticazione non disponibile.');
            }

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const storagePath = `product-requests/${userId}/${filename}`;

            // Create storage reference
            const storageRef = this.storage.ref().child(storagePath);

            // Upload file with metadata
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    uploadedBy: userId,
                    uploadedAt: timestamp.toString()
                }
            };

            // Upload file - Firebase SDK handles auth token automatically
            const uploadTask = storageRef.put(file, metadata);

            // Wrap upload task in a promise
            const uploadPromise = new Promise((resolve, reject) => {
                // Monitor upload progress if callback provided
                const unsubscribe = uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (onProgress) {
                            onProgress(progress);
                        }
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        unsubscribe();
                        reject(error);
                    },
                    () => {
                        // Upload completed successfully
                        unsubscribe();
                        resolve();
                    }
                );
            });

            // Wait for upload to complete
            await uploadPromise;

            // Get download URL
            const downloadURL = await storageRef.getDownloadURL();

            return downloadURL;
        } catch (error) {
            console.error('Error uploading product image:', error);
            
            // Provide more specific error messages
            if (error.code === 'storage/unauthorized' || error.code === 'auth/unauthorized') {
                throw new Error('Non autorizzato. Verifica di essere autenticato.');
            } else if (error.code === 'storage/canceled') {
                throw new Error('Upload annullato.');
            } else if (error.code === 'storage/unknown' || error.message.includes('CORS')) {
                throw new Error('Errore di connessione. Verifica le regole di sicurezza Firebase Storage.');
            }
            
            throw new Error(error.message || 'Errore durante il caricamento dell\'immagine. Riprova.');
        }
    }

    /**
     * Get image URL from storage reference
     * @param {string} storagePath - Storage path
     * @returns {Promise<string>} Download URL
     */
    async getImageUrl(storagePath) {
        await this.initialize();

        try {
            const storageRef = this.storage.ref().child(storagePath);
            const url = await storageRef.getDownloadURL();
            return url;
        } catch (error) {
            console.error('Error getting image URL:', error);
            throw new Error('Errore nel recupero dell\'immagine.');
        }
    }

    /**
     * Delete image from Firebase Storage
     * @param {string} storagePath - Storage path
     * @returns {Promise<void>}
     */
    async deleteImage(storagePath) {
        await this.initialize();

        try {
            const storageRef = this.storage.ref().child(storagePath);
            await storageRef.delete();
        } catch (error) {
            console.error('Error deleting image:', error);
            throw new Error('Errore durante l\'eliminazione dell\'immagine.');
        }
    }
}

// Create singleton instance
const firebaseStorageService = new FirebaseStorageService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseStorageService;
}

// Make available globally
window.firebaseStorageService = firebaseStorageService;

