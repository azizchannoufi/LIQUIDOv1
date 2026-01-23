# Firebase Realtime Database Setup

## Configuration

Le projet est maintenant configuré pour utiliser Firebase Realtime Database pour stocker et gérer le catalogue de produits.

## Structure de données

Les données sont stockées dans Firebase sous la structure suivante :

```
catalog/
  └── sections/
      ├── 0/
      │   ├── id: "cat_liquidi"
      │   ├── name: "Liquidi"
      │   ├── description: "E-liquides et arômes"
      │   └── brands/
      │       ├── 0/
      │       │   ├── name: "Suprem-e"
      │       │   ├── logo_url: "/images/brands/suprem-e_logo.png"
      │       │   └── lines/
      │       │       ├── 0/
      │       │       │   ├── name: "RE-BRAND"
      │       │       │   └── image_url: "/images/products/suprem-e/re-brand.jpg"
      │       │       └── ...
      │       └── ...
      └── 1/
          └── ...
```

## Initialisation

### Option 1: Initialiser avec les données du JSON

1. Ouvrez la console du navigateur
2. Chargez le script d'initialisation :
   ```javascript
   // Dans la console du navigateur
   const script = document.createElement('script');
   script.src = '../src/js/utils/firebase-init-data.js';
   document.head.appendChild(script);
   ```

### Option 2: Initialiser manuellement

1. Allez dans la console Firebase : https://console.firebase.google.com/
2. Sélectionnez votre projet `liquidovapeshop`
3. Allez dans Realtime Database
4. Importez le fichier `src/data/catalog.json` (structure `catalog`)

## Utilisation

### Pages publiques

Les pages publiques (`products.html`, `brands.html`) chargent automatiquement les données depuis Firebase.

### Pages admin

Les formulaires admin (`admin/brands/add.html`, `admin/products/add.html`) permettent de :
- Ajouter/modifier des marques
- Ajouter/modifier des lignes de produits
- Les données sont sauvegardées directement dans Firebase

## Fallback

Si Firebase n'est pas disponible, le système bascule automatiquement vers le fichier JSON statique (`src/data/catalog.json`).

## Sécurité

### Realtime Database Rules

⚠️ **Important** : Configurez les règles de sécurité Firebase dans la console :

```json
{
  "rules": {
    "catalog": {
      ".read": true,
      ".write": false
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Pour permettre l'écriture depuis l'admin, vous devrez :
1. Activer Firebase Authentication
2. Configurer les règles pour autoriser l'écriture uniquement aux utilisateurs authentifiés

### Storage Rules

⚠️ **CRITIQUE** : Configurez les règles de sécurité Firebase Storage pour permettre les uploads :

1. Allez dans Firebase Console > Storage > Rules
2. Configurez les règles suivantes :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permettre les uploads dans product-requests pour les utilisateurs authentifiés
    match /product-requests/{userId}/{fileName} {
      allow read: if true; // Tous peuvent lire
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Bloquer tout le reste par défaut
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**Note importante** : Sans ces règles, vous obtiendrez des erreurs CORS lors des uploads.

## Scripts inclus

- `src/js/services/firebase-config.js` - Configuration Firebase
- `src/js/services/firebase-catalog-service.js` - Service pour gérer le catalogue dans Firebase
- `src/js/services/catalog-service.js` - Service unifié (Firebase + JSON fallback)


