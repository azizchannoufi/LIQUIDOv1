# Configuration Firebase avec Variables d'Environnement

Ce projet utilise un système de variables d'environnement pour gérer la configuration Firebase de manière sécurisée.

## 📋 Structure

- **`.env`** - Fichier contenant vos vraies credentials Firebase (NE PAS COMMITTER)
- **`.env.example`** - Template montrant la structure nécessaire
- **`src/js/services/firebase-config.template.js`** - Template pour générer le fichier config
- **`src/js/services/firebase-config.js`** - Fichier généré (COMMITTÉ dans git)
- **`scripts/build-firebase-config.js`** - Script qui génère firebase-config.js depuis .env

## 🚀 Installation

### 1. Créer le fichier .env

Si vous avez déjà un `firebase-config.js` avec vos credentials, utilisez le script d'initialisation :

```bash
npm run init:env
```

Sinon, copiez `.env.example` vers `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos vraies credentials Firebase.

### 2. Générer firebase-config.js

Après avoir créé/modifié le `.env`, générez le fichier config :

```bash
npm run build:config
```

## 📝 Variables d'Environnement Requises

Dans votre fichier `.env`, vous devez définir :

```
FIREBASE_API_KEY=votre_api_key
FIREBASE_AUTH_DOMAIN=votre-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://votre-project-default-rtdb.region.firebasedatabase.app
FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_STORAGE_BUCKET=votre-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔄 Workflow

1. **Développement local** :
   - Le fichier `.env` contient vos credentials locaux
   - Exécutez `npm run build:config` pour générer `firebase-config.js`
   - Le fichier `firebase-config.js` est commité dans git

2. **Déploiement/Hébergement** :
   - Configurez les variables d'environnement sur votre plateforme d'hébergement
   - Exécutez `npm run build:config` dans votre pipeline de déploiement
   - Le fichier `firebase-config.js` sera généré avec les bonnes valeurs

## ⚙️ Scripts NPM Disponibles

- `npm run build:config` - Génère firebase-config.js depuis .env
- `npm run init:env` - Crée .env depuis firebase-config.js existant
- `npm start` - Génère automatiquement le config avant de démarrer (via prestart)

## 🔒 Sécurité

- ✅ Le fichier `.env` est dans `.gitignore` et ne sera jamais commité
- ✅ Le fichier `firebase-config.js` est commité mais généré depuis `.env`
- ⚠️ **Important** : Les clés Firebase sont publiques côté client, mais utiliser `.env` permet de les gérer facilement selon l'environnement (dev/prod)

## 🌐 Hébergement

### Sur Vercel/Netlify/etc.

Configurez les variables d'environnement dans les paramètres de votre projet, puis ajoutez cette commande dans votre build :

```bash
npm run build:config
```

### Sur un serveur traditionnel

1. Créez le fichier `.env` sur le serveur avec les bonnes valeurs
2. Exécutez `npm run build:config` après chaque déploiement
3. Ou configurez un hook de déploiement pour l'exécuter automatiquement

## 🐛 Dépannage

**Erreur : "Missing required environment variables"**
- Vérifiez que votre fichier `.env` existe et contient toutes les variables requises
- Vérifiez qu'il n'y a pas d'espaces autour du signe `=` dans `.env`

**Le config n'est pas généré**
- Vérifiez que `dotenv` est installé : `npm install dotenv`
- Vérifiez les permissions d'écriture dans le dossier `src/js/services/`

