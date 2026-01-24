# SumUp API Integration Setup

## Vue d'ensemble

Ce projet intègre l'API SumUp pour afficher et gérer les transactions de paiement dans le dashboard admin. Les appels API SumUp sont gérés par un backend Node.js/Express pour sécuriser les clés API.

## Architecture

```
Admin Dashboard (Frontend)
    ↓
Express Backend API (/api/sumup/*)
    ↓
SumUp REST API (https://api.sumup.com)
```

## Prérequis

1. Compte SumUp avec accès API
2. Node.js installé (v14+)
3. Clé API SumUp (Bearer Token)
4. Code marchand SumUp (optionnel, pour filtrer par merchant)

## Configuration

### 1. Obtenir les credentials SumUp

1. Connectez-vous à votre compte SumUp : https://me.sumup.com
2. Allez dans **Settings > Developer**
3. Créez une nouvelle clé API
4. Copiez le **Bearer Token**
5. Notez votre **Merchant Code** (disponible dans le dashboard)

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# SumUp API Configuration
SUMUP_BASE_URL=https://api.sumup.com
SUMUP_BEARER_TOKEN=votre_bearer_token_ici
SUMUP_MERCHANT_CODE=votre_merchant_code_ici

# Server Configuration
PORT=3001
```

**Important** : Le fichier `.env` est déjà dans `.gitignore` et ne sera pas commité.

### 3. Installation des dépendances

```bash
npm install
```

Cela installera :
- `express` - Framework web pour Node.js
- `cors` - Middleware CORS
- `dotenv` - Gestion des variables d'environnement
- `axios` - Client HTTP pour les appels API

### 4. Démarrer le serveur

```bash
npm start
# ou
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Structure des fichiers

```
backend/
├── routes/
│   └── sumup-routes.js      # Routes Express pour SumUp API
├── services/
│   └── sumup-api.js          # Service pour appels HTTP vers SumUp
└── config/
    └── sumup-config.example.js # Exemple de configuration

src/js/
├── services/
│   └── sumup-service.js      # Service client pour appeler l'API backend
└── admin/
    └── sumup-transactions.js # Logique d'affichage des transactions

admin/
└── payments/
    └── index.html            # Page admin pour visualiser les transactions
```

## API Endpoints

### Backend (Express)

- `GET /api/sumup/transactions` - Liste des transactions
  - Query params: `limit`, `order`, `status`, `payment_type`, `start_date`, `end_date`
- `GET /api/sumup/transactions/:id` - Détails d'une transaction
- `GET /api/sumup/checkouts` - Liste des checkouts
- `GET /api/sumup/checkouts/:id` - Détails d'un checkout

### Frontend (Service)

Le service `window.sumupService` expose les méthodes suivantes :

```javascript
// Récupérer les transactions
const response = await window.sumupService.getTransactions({
  limit: 100,
  status: 'SUCCESSFUL',
  order: 'desc'
});

// Récupérer une transaction spécifique
const transaction = await window.sumupService.getTransaction('transaction_id');

// Formater un montant
const formatted = window.sumupService.formatAmount(10000, 'EUR'); // "€100.00"

// Formater une date
const formatted = window.sumupService.formatDate('2024-01-15T10:30:00Z');
```

## Utilisation dans le dashboard admin

1. Accédez au dashboard admin : `http://localhost:3000/admin/`
2. Cliquez sur **Payments** dans la sidebar
3. Les transactions SumUp s'affichent automatiquement
4. Utilisez les filtres pour rechercher par :
   - Statut (SUCCESSFUL, FAILED, PENDING, EXPIRED)
   - Type de paiement (CARD, BALANCE, MOTO)
   - ID de transaction ou montant

## Sandbox / Test

Pour tester avec le sandbox SumUp :

1. Créez un compte sandbox : https://me.sumup.com/settings/developer
2. Générez une clé API sandbox
3. Utilisez le bearer token sandbox dans votre `.env`
4. Les transactions de test apparaîtront dans le dashboard

## Sécurité

- ✅ Les clés API SumUp ne sont **jamais** exposées côté client
- ✅ Toutes les requêtes passent par le backend Express
- ✅ Le fichier `.env` est dans `.gitignore`
- ✅ CORS est configuré pour limiter les origines (si nécessaire)

## Dépannage

### Erreur : "SUMUP_BEARER_TOKEN not set"

Vérifiez que le fichier `.env` existe et contient `SUMUP_BEARER_TOKEN`.

### Erreur : "Network error: No response from SumUp API"

1. Vérifiez votre connexion internet
2. Vérifiez que `SUMUP_BASE_URL` est correct
3. Vérifiez que votre bearer token est valide

### Erreur : "Unauthorized" (401)

1. Vérifiez que votre bearer token est correct
2. Vérifiez que le token n'a pas expiré
3. Régénérez une nouvelle clé API si nécessaire

### Aucune transaction n'apparaît

1. Vérifiez que vous avez des transactions dans votre compte SumUp
2. Vérifiez les filtres appliqués
3. Vérifiez les logs du serveur pour les erreurs API

## Documentation SumUp

- Documentation API : https://developer.sumup.com/api
- Dashboard SumUp : https://me.sumup.com
- Support : https://support.sumup.com

## Prochaines étapes (optionnel)

- Créer des checkouts depuis le dashboard
- Lier les transactions aux commandes Firebase
- Traiter les remboursements
- Exporter les transactions en CSV/Excel

