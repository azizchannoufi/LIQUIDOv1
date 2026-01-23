# 🔧 Fix: "Upload preset not found" - Guide Complet

## ⚠️ Problème Actuel

Vous voyez cette erreur :
```
Upload preset non trovato
Status: 400 Bad Request
```

Cela signifie que le preset `liquido_product_upload` n'existe pas encore dans votre compte Cloudinary.

## ✅ Solution en 5 Étapes

### Étape 1 : Ouvrir Cloudinary Dashboard

1. Allez sur : **https://cloudinary.com/console**
2. **Connectez-vous** avec votre compte
3. Vous devriez voir votre dashboard avec le Cloud Name : `deknyjbqz`

### Étape 2 : Accéder aux Upload Presets

1. Cliquez sur **Settings** (⚙️ icône en haut à droite)
2. Dans le menu de gauche, cliquez sur **Upload**
3. Cliquez sur l'onglet **Upload presets** (en haut)

### Étape 3 : Créer le Preset

1. Cliquez sur le bouton **Add upload preset** (en haut à droite, bouton bleu)

### Étape 4 : Configurer le Preset

Remplissez le formulaire avec ces valeurs **EXACTES** :

#### Informations de Base
- **Preset name** : `liquido_product_upload` ⚠️ (Doit être EXACTEMENT ce nom)
- **Signing mode** : Sélectionnez **Unsigned** ⚠️ (TRÈS IMPORTANT)

#### Restrictions
- **Allowed formats** : Cochez uniquement :
  - ✅ `jpg` ou `jpeg`
  - ✅ `png`
  - ✅ `webp`
- **Max file size** : `5242880` (5 MB en bytes)
  - Ou sélectionnez "5 MB" dans le menu déroulant

#### Options
- **Use filename** : ✅ Activé (checkbox cochée)
- **Unique filename** : ✅ Activé (checkbox cochée)
- **Folder** : `product-requests` (optionnel, mais recommandé)
- **Moderation** : `None` (dans le menu déroulant)

#### Transformations (optionnel)
- Laissez vide pour l'instant

### Étape 5 : Sauvegarder

1. Cliquez sur **Save** (bouton en bas)
2. Le preset apparaît maintenant dans la liste
3. Vérifiez que le nom est bien : `liquido_product_upload`

## 🔍 Vérification

### Vérifier que le preset existe

1. Dans **Settings > Upload > Upload presets**
2. Vous devriez voir `liquido_product_upload` dans la liste
3. Cliquez dessus pour voir les détails
4. Vérifiez que **Signing mode** est bien **Unsigned**

### Vérifier la configuration dans le code

Ouvrez `src/js/services/cloudinary-config.js` et vérifiez :

```javascript
const cloudinaryConfig = {
    cloudName: 'deknyjbqz',
    uploadPreset: 'liquido_product_upload' // ⬅️ Doit correspondre EXACTEMENT
};
```

⚠️ Le nom doit être **EXACTEMENT** le même (sensible à la casse, pas d'espaces)

## 🧪 Tester

1. **Rechargez** la page `myliquido.html` (Ctrl+F5 pour vider le cache)
2. Essayez d'**uploader une image**
3. Ça devrait fonctionner ! ✅

## 🐛 Si ça ne marche toujours pas

### Vérification 1 : Console du navigateur

Ouvrez la console (F12) et regardez les logs. Vous devriez voir :
```
Cloudinary Upload Config: {
  cloudName: "deknyjbqz",
  uploadPreset: "liquido_product_upload",
  ...
}
```

Si le preset est différent, mettez à jour `cloudinary-config.js`.

### Vérification 2 : Nom du preset

Le nom dans Cloudinary doit correspondre **EXACTEMENT** au nom dans le code :
- ✅ `liquido_product_upload` = `liquido_product_upload` → OK
- ❌ `Liquido_Product_Upload` ≠ `liquido_product_upload` → ERREUR
- ❌ `liquido-product-upload` ≠ `liquido_product_upload` → ERREUR

### Vérification 3 : Type de preset

Le preset **DOIT** être de type **Unsigned**. Si c'est "Signed", ça ne marchera pas.

Pour vérifier :
1. Ouvrez le preset dans Cloudinary
2. Regardez "Signing mode"
3. Doit être **Unsigned**

### Vérification 4 : Cloud Name

Vérifiez que le Cloud Name est correct : `deknyjbqz`

## 📸 Aide Visuelle

### Où trouver les Upload Presets

```
Cloudinary Dashboard
  └── Settings (⚙️)
      └── Upload
          └── Upload presets (onglet)
              └── Add upload preset (bouton)
```

### Configuration du Preset

```
┌─────────────────────────────────────┐
│ Preset name: liquido_product_upload │
│ Signing mode: [Unsigned ▼]          │
│                                     │
│ Allowed formats:                    │
│ ☑ jpg  ☑ png  ☑ webp              │
│                                     │
│ Max file size: 5242880 (5 MB)      │
│                                     │
│ ☑ Use filename                      │
│ ☑ Unique filename                   │
│                                     │
│ Folder: product-requests           │
│ Moderation: None                    │
└─────────────────────────────────────┘
```

## 💡 Alternative : Utiliser un autre nom

Si vous préférez utiliser un autre nom pour le preset :

1. Créez le preset avec le nom que vous voulez (ex: `my_upload_preset`)
2. Modifiez `src/js/services/cloudinary-config.js` :
   ```javascript
   uploadPreset: 'my_upload_preset' // Votre nouveau nom
   ```
3. Rechargez la page

## 🆘 Support

Si le problème persiste après avoir suivi ces étapes :

1. Vérifiez la console du navigateur (F12) pour l'erreur exacte
2. Vérifiez que tous les scripts sont chargés dans l'ordre :
   - `cloudinary-config.js` (avant)
   - `cloudinary-service.js` (après)
3. Videz le cache du navigateur (Ctrl+Shift+Delete)

---

**Note** : Une fois le preset créé, il fonctionnera pour tous les futurs uploads. Vous n'aurez plus besoin de le recréer.

