# Configuration Cloudinary

## Vue d'ensemble

Le projet utilise maintenant **Cloudinary** pour le stockage des images au lieu de Firebase Storage. Cloudinary offre :
- ✅ 25 GB de stockage gratuit par mois
- ✅ 25 GB de bande passante par mois
- ✅ Transformations d'images automatiques
- ✅ CDN global pour des chargements rapides

## Configuration initiale

### 1. Credentials Cloudinary

Les credentials sont déjà configurés dans `src/js/services/cloudinary-config.js` :
- **Cloud Name**: `deknyjbqz`
- **API Key**: `431754751597389`
- **API Secret**: `u0j9rsgE-zHR26gT3Q2BE-Xq2Zk` (⚠️ Ne jamais exposer côté client)

### 2. Créer un Upload Preset (REQUIS)

Pour permettre les uploads depuis le client sans exposer l'API Secret, vous devez créer un **Upload Preset Unsigned** :

1. **Connectez-vous** à votre compte Cloudinary : https://cloudinary.com/console
2. Allez dans **Settings** > **Upload**
3. Cliquez sur l'onglet **Upload presets**
4. Cliquez sur **Add upload preset**
5. Configurez le preset :
   - **Preset name**: `liquido_product_upload` (ou le nom que vous préférez)
   - **Signing mode**: Sélectionnez **Unsigned**
   - **Folder**: `product-requests` (optionnel, pour organiser les fichiers)
   - **Allowed formats**: Cochez `jpg`, `png`, `webp`
   - **Max file size**: `5242880` (5 MB en bytes)
   - **Moderation**: `None` (ou configurez selon vos besoins)
   - **Use filename**: Activé (pour garder le nom original)
   - **Unique filename**: Activé (pour éviter les conflits)
6. Cliquez sur **Save**

### 3. Mettre à jour la configuration

Une fois le preset créé, mettez à jour `src/js/services/cloudinary-config.js` :

```javascript
const cloudinaryConfig = {
    cloudName: 'deknyjbqz',
    uploadPreset: 'liquido_product_upload' // Remplacez par le nom de votre preset
};
```

## Utilisation

Le service Cloudinary est automatiquement utilisé dans `myliquido.html` pour les uploads d'images de produits.

### Fonctionnalités

- ✅ Validation automatique des fichiers (type, taille)
- ✅ Barre de progression pendant l'upload
- ✅ Organisation par dossier utilisateur (`product-requests/{userId}/`)
- ✅ Transformation automatique (format optimisé, qualité)
- ✅ URLs sécurisées (HTTPS)

### Exemple d'utilisation

```javascript
// Upload d'une image
const imageUrl = await window.cloudinaryService.uploadProductImage(
    file,
    userId,
    (progress) => {
        console.log(`Upload: ${progress}%`);
    }
);
```

## Sécurité

⚠️ **IMPORTANT** :
- L'**API Secret** ne doit **JAMAIS** être exposé côté client
- Utilisez toujours un **Upload Preset Unsigned** pour les uploads client
- Pour les suppressions d'images, implémentez un endpoint serveur qui utilise l'API Secret

## Limites du plan gratuit

- **Stockage**: 25 GB/mois
- **Bandwidth**: 25 GB/mois
- **Transformations**: Illimitées
- **Uploads**: Illimités

Si vous dépassez ces limites, Cloudinary vous facturera selon leur grille tarifaire.

## Dépannage

### Erreur: "Configuration Cloudinary non trouvée"
- Vérifiez que `cloudinary-config.js` est chargé avant `cloudinary-service.js`
- Vérifiez que `window.cloudinaryConfig` est défini

### Erreur: "Upload preset not found"
- Vérifiez que le preset existe dans votre dashboard Cloudinary
- Vérifiez que le nom du preset correspond exactement dans `cloudinary-config.js`
- Vérifiez que le preset est de type "Unsigned"

### Erreur CORS
- Cloudinary supporte CORS par défaut, cette erreur ne devrait pas se produire
- Si elle se produit, vérifiez votre connexion internet

## Migration depuis Firebase Storage

Le code a été modifié pour utiliser Cloudinary au lieu de Firebase Storage :
- ✅ `firebase-storage.js` n'est plus utilisé pour les uploads
- ✅ `cloudinary-service.js` remplace Firebase Storage
- ✅ Les URLs retournées sont des URLs Cloudinary (HTTPS)

Les images existantes dans Firebase Storage continueront de fonctionner, mais les nouvelles images seront stockées sur Cloudinary.

