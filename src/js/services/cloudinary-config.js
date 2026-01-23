/**
 * Cloudinary Configuration
 * 
 * IMPORTANT: Ne jamais exposer l'API Secret côté client !
 * 
 * Pour obtenir vos credentials :
 * 1. Allez sur https://cloudinary.com/console
 * 2. Connectez-vous à votre compte
 * 3. Allez dans Dashboard pour voir votre Cloud Name
 * 4. Allez dans Settings > Upload pour créer un Upload Preset
 * 
 * Configuration du Upload Preset :
 * 1. Allez dans Settings > Upload > Upload presets
 * 2. Créez un nouveau preset de type "Unsigned"
 * 3. Configurez :
 *    - Signing mode: Unsigned
 *    - Folder: product-requests (optionnel)
 *    - Allowed formats: jpg, png, webp
 *    - Max file size: 5MB
 *    - Moderation: None (ou configurez selon vos besoins)
 * 4. Donnez un nom au preset (ex: "liquido_product_upload")
 * 5. Copiez le nom ici dans uploadPreset
 */

const cloudinaryConfig = {
    cloudName: 'deknyjbqz',
    uploadPreset: 'liquido_product_upload' // Configurez ce preset dans votre dashboard Cloudinary
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cloudinaryConfig;
}

// Make available globally
window.cloudinaryConfig = cloudinaryConfig;

