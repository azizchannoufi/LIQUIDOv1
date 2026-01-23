# Configuration Rapide Cloudinary - Résolution du problème "Upload preset not found"

## Problème

Si vous voyez l'erreur : `Upload preset not found` ou `400 Bad Request`, c'est que l'Upload Preset n'existe pas encore dans votre dashboard Cloudinary.

## Solution Rapide (5 minutes)

### Étape 1 : Créer l'Upload Preset

1. **Connectez-vous** à Cloudinary : https://cloudinary.com/console
2. Allez dans **Settings** (⚙️ en haut à droite)
3. Cliquez sur **Upload** dans le menu de gauche
4. Cliquez sur l'onglet **Upload presets**
5. Cliquez sur le bouton **Add upload preset** (en haut à droite)

### Étape 2 : Configurer le Preset

Remplissez le formulaire :

- **Preset name** : `liquido_product_upload` (ou le nom que vous préférez)
- **Signing mode** : Sélectionnez **Unsigned** ⚠️ (IMPORTANT)
- **Folder** : `product-requests` (optionnel, pour organiser)
- **Allowed formats** : Cochez uniquement :
  - ✅ `jpg`
  - ✅ `png` 
  - ✅ `webp`
- **Max file size** : `5242880` (5 MB en bytes)
- **Use filename** : ✅ Activé
- **Unique filename** : ✅ Activé
- **Moderation** : `None`
- **Tags** : Laissez vide (optionnel)

### Étape 3 : Sauvegarder

1. Cliquez sur **Save** en bas du formulaire
2. Le preset apparaît maintenant dans la liste

### Étape 4 : Vérifier la configuration

Vérifiez que le nom du preset dans `src/js/services/cloudinary-config.js` correspond exactement :

```javascript
const cloudinaryConfig = {
    cloudName: 'deknyjbqz',
    uploadPreset: 'liquido_product_upload' // ⬅️ Doit correspondre au nom créé
};
```

### Étape 5 : Tester

1. Rechargez la page `myliquido.html`
2. Essayez d'uploader une image
3. Ça devrait fonctionner ! ✅

## Vérification

Pour vérifier que le preset existe :
1. Allez dans **Settings** > **Upload** > **Upload presets**
2. Vous devriez voir `liquido_product_upload` dans la liste
3. Cliquez dessus pour voir les détails

## Problèmes courants

### "Preset name already exists"
- Utilisez un autre nom (ex: `liquido_upload_v2`)
- Mettez à jour `cloudinary-config.js` avec le nouveau nom

### "Signing mode" est grisé
- Vous devez d'abord créer le preset, puis le modifier pour changer le mode
- Ou créez un nouveau preset directement en mode "Unsigned"

### Le preset existe mais ça ne marche toujours pas
- Vérifiez que le nom correspond **exactement** (sensible à la casse)
- Vérifiez que le preset est bien de type **Unsigned**
- Videz le cache du navigateur (Ctrl+F5)

## Support

Si le problème persiste :
1. Vérifiez la console du navigateur pour l'erreur exacte
2. Vérifiez que `cloudinary-config.js` est bien chargé avant `cloudinary-service.js`
3. Vérifiez que le Cloud Name est correct : `deknyjbqz`

