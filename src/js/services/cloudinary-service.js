/**
 * Cloudinary Image Upload Service
 * Handles file uploads to Cloudinary
 * 
 * IMPORTANT: Configurez un Upload Preset dans votre dashboard Cloudinary
 * 1. Allez sur https://cloudinary.com/console/settings/upload
 * 2. Créez un "Upload Preset" de type "Unsigned"
 * 3. Configurez les restrictions (taille max, formats, etc.)
 * 4. Copiez le nom du preset et ajoutez-le dans cloudinary-config.js
 */

class CloudinaryService {
    constructor() {
        this.cloudName = null;
        this.uploadPreset = null;
        this.initialized = false;
        
        // Configuration
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        this.ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    }

    /**
     * Initialize Cloudinary service
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // Load configuration
            if (window.cloudinaryConfig) {
                this.cloudName = window.cloudinaryConfig.cloudName;
                this.uploadPreset = window.cloudinaryConfig.uploadPreset;
            } else {
                throw new Error('Configuration Cloudinary non trouvée. Vérifiez cloudinary-config.js');
            }

            if (!this.cloudName) {
                throw new Error('Cloud Name Cloudinary manquant. Vérifiez cloudinary-config.js');
            }
            
            if (!this.uploadPreset || this.uploadPreset === 'YOUR_UPLOAD_PRESET_NAME') {
                throw new Error('Upload Preset non configuré. Créez un preset "Unsigned" dans votre dashboard Cloudinary et ajoutez son nom dans cloudinary-config.js');
            }

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing Cloudinary Service:', error);
            throw error;
        }
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
     * Upload product image to Cloudinary
     * @param {File} file - Image file to upload
     * @param {string} userId - User ID (for folder organization)
     * @param {Function} onProgress - Progress callback (optional)
     * @returns {Promise<string>} URL of uploaded image
     */
    async uploadProductImage(file, userId, onProgress = null) {
        await this.initialize();

        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        try {
            // Debug: Log configuration
            console.log('Cloudinary Upload Config:', {
                cloudName: this.cloudName,
                uploadPreset: this.uploadPreset,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            // Create FormData - Keep it simple for unsigned uploads
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            
            // Optional: Folder organization (only if preset allows it)
            // Some presets may have folder restrictions, so this is optional
            formData.append('folder', `product-requests/${userId}`);
            
            // Note: We don't set public_id or transformation here
            // Let Cloudinary handle it automatically based on preset settings

            // Upload to Cloudinary
            const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
            
            console.log('Uploading to:', uploadUrl);
            console.log('Using preset:', this.uploadPreset);

            const xhr = new XMLHttpRequest();

            // Create promise for upload
            const uploadPromise = new Promise((resolve, reject) => {
                // Handle progress
                if (onProgress) {
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const progress = (e.loaded / e.total) * 100;
                            onProgress(progress);
                        }
                    });
                }

                // Handle completion
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.secure_url) {
                                resolve(response.secure_url);
                            } else {
                                reject(new Error('Risposta Cloudinary non valida.'));
                            }
                        } catch (error) {
                            reject(new Error('Errore nel parsing della risposta.'));
                        }
                    } else {
                        let errorMessage = 'Errore durante il caricamento.';
                        let errorDetails = null;
                        
                        try {
                            const error = JSON.parse(xhr.responseText);
                            errorMessage = error.error?.message || errorMessage;
                            errorDetails = error;
                            
                            console.error('❌ Cloudinary API Error:', {
                                status: xhr.status,
                                statusText: xhr.statusText,
                                response: xhr.responseText,
                                error: error,
                                config: {
                                    cloudName: this.cloudName,
                                    uploadPreset: this.uploadPreset,
                                    url: uploadUrl
                                }
                            });
                            
                            // Provide specific error message for missing preset
                            if (errorMessage.toLowerCase().includes('preset') || 
                                errorMessage.toLowerCase().includes('invalid') ||
                                xhr.status === 400) {
                                errorMessage = `Erreur 400: Upload preset "${this.uploadPreset}" non trouvé ou invalide.\n\n` +
                                    `Vérifications:\n` +
                                    `1. Le preset "${this.uploadPreset}" existe dans votre dashboard Cloudinary\n` +
                                    `2. Le preset est de type "Unsigned" (pas "Signed")\n` +
                                    `3. Le nom correspond exactement (sensible à la casse)\n` +
                                    `4. Cloud Name: ${this.cloudName}\n\n` +
                                    `Allez sur: https://cloudinary.com/console > Settings > Upload > Upload presets`;
                            }
                        } catch (e) {
                            // If status is 400, likely a preset issue
                            if (xhr.status === 400) {
                                errorMessage = `Erreur 400: Upload preset "${this.uploadPreset}" non trouvé. ` +
                                    `Vérifiez que le preset existe dans votre dashboard Cloudinary ` +
                                    `et que le nom correspond exactement.`;
                            }
                            console.error('Error parsing response:', xhr.responseText);
                        }
                        
                        reject(new Error(errorMessage));
                    }
                });

                // Handle errors
                xhr.addEventListener('error', () => {
                    reject(new Error('Errore di connessione durante il caricamento.'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Caricamento annullato.'));
                });
            });

            // Start upload
            xhr.open('POST', uploadUrl);
            xhr.send(formData);

            // Wait for upload to complete
            const imageUrl = await uploadPromise;

            return imageUrl;
        } catch (error) {
            console.error('Error uploading product image to Cloudinary:', error);
            console.error('Configuration used:', {
                cloudName: this.cloudName,
                uploadPreset: this.uploadPreset
            });
            
            // Provide user-friendly error messages
            if (error.message.includes('preset') || 
                error.message.includes('Preset') || 
                error.message.includes('non trovato') ||
                error.message.includes('non trouvé')) {
                const helpMessage = 
                    `❌ Upload Preset manquant!\n\n` +
                    `Le preset "${this.uploadPreset}" n'existe pas dans votre compte Cloudinary.\n\n` +
                    `📋 Étapes pour résoudre :\n` +
                    `1. Allez sur https://cloudinary.com/console\n` +
                    `2. Settings > Upload > Upload presets\n` +
                    `3. Créez un nouveau preset nommé "${this.uploadPreset}"\n` +
                    `4. Type: "Unsigned"\n` +
                    `5. Formats: jpg, png, webp\n` +
                    `6. Max size: 5MB\n\n` +
                    `Ou changez le nom dans cloudinary-config.js pour correspondre à un preset existant.`;
                
                throw new Error(helpMessage);
            } else if (error.message.includes('connessione') || error.message.includes('connection')) {
                throw new Error('Errore di connessione. Verifica la tua connessione internet.');
            } else if (error.message.includes('non valida')) {
                throw new Error('Errore nel caricamento. Riprova più tardi.');
            }
            
            throw new Error(error.message || 'Errore durante il caricamento dell\'immagine. Riprova.');
        }
    }

    /**
     * Delete image from Cloudinary (requires server-side implementation)
     * @param {string} publicId - Cloudinary public ID
     * @returns {Promise<void>}
     */
    async deleteImage(publicId) {
        // Note: Deletion requires API secret, so this should be done server-side
        console.warn('Image deletion should be implemented server-side for security.');
        throw new Error('Eliminazione immagini non disponibile lato client per motivi di sicurezza.');
    }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cloudinaryService;
}

// Make available globally
window.cloudinaryService = cloudinaryService;

