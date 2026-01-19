# LIQUIDO Vape Store Website

Bienvenue sur le site web LIQUIDO - Une boutique de vape premium avec une interface moderne et élégante.

## 📁 Structure du Projet

```
LIQUIDOv1/
├── index.html                  # Page d'accueil
├── brands.html                 # Catalogue des marques partenaires
├── products.html               # Catalogue des produits
├── product-detail.html         # Page de détail d'un produit
├── about.html                  # Page À propos
├── contact.html                # Page de contact
├── admin/                      # Section administration
│   ├── login.html             # Connexion admin
│   ├── dashboard.html         # Tableau de bord
│   ├── products.html          # Gestion des produits
│   ├── brands.html            # Gestion des marques
│   ├── add-product.html       # Ajouter un produit
│   ├── add-brand.html         # Ajouter une marque
│   ├── inbox.html             # Boîte de réception
│   ├── message-details.html   # Détails des messages
│   └── settings.html          # Paramètres
└── README.md                   # Ce fichier

```

## 🌟 Pages Principales

### Pages Publiques

1. **index.html** - Page d'accueil
   - Hero section avec produit vedette
   - Marques partenaires
   - Nouveaux arrivages
   - Call-to-action

2. **brands.html** - Marques Partenaires
   - Catalogue des marques (Vaporesso, GeekVape, Dinner Lady, etc.)
   - Filtres par catégorie
   - Recherche de marques

3. **products.html** - Catalogue Produits
   - Liste complète des produits
   - Filtres et tri
   - Vue grille

4. **product-detail.html** - Détail Produit
   - Images du produit
   - Spécifications techniques
   - Produits associés
   - Boutons d'action

5. **about.html** - À Propos
   - Histoire de l'entreprise
   - Standards de qualité
   - Certifications
   - Photos du magasin

6. **contact.html** - Contact
   - Formulaire de contact
   - Informations de localisation
   - Carte interactive
   - Horaires d'ouverture

### Section Administration

7. **admin/login.html** - Connexion Admin
   - Formulaire de connexion sécurisé

8. **admin/dashboard.html** - Tableau de Bord
   - Statistiques
   - Graphiques
   - Aperçu des ventes

9. **admin/products.html** - Gestion Produits
   - Liste des produits
   - Actions CRUD
   - Recherche et filtres

10. **admin/brands.html** - Gestion Marques
    - Liste des marques
    - Actions CRUD

11. **admin/add-product.html** - Ajouter Produit
    - Formulaire d'ajout de produit
    - Upload d'images
    - Catégorisation

12. **admin/add-brand.html** - Ajouter Marque
    - Formulaire d'ajout de marque
    - Upload de logo

13. **admin/inbox.html** - Boîte de Réception
    - Messages des clients
    - Gestion des demandes

14. **admin/message-details.html** - Détails Message
    - Vue détaillée d'un message
    - Réponse

15. **admin/settings.html** - Paramètres
    - Configuration du site
    - Paramètres généraux

## 🎨 Technologies Utilisées

- **HTML5** - Structure sémantique
- **Tailwind CSS** - Framework CSS via CDN
- **Google Fonts** - Plus Jakarta Sans
- **Material Symbols** - Icônes
- **JavaScript** - Interactivité (intégré dans les pages)

## 🚀 Comment Utiliser

1. **Ouvrir le site**
   - Double-cliquez sur `index.html` pour ouvrir la page d'accueil
   - Ou utilisez un serveur local (recommandé)

2. **Serveur Local (Recommandé)**
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Avec Node.js (npx)
   npx http-server
   
   # Avec PHP
   php -S localhost:8000
   ```
   Puis ouvrez http://localhost:8000 dans votre navigateur

3. **Navigation**
   - Utilisez le menu de navigation pour accéder aux différentes pages
   - Les liens sont tous fonctionnels et interconnectés

## 🎯 Fonctionnalités

### Design
- ✅ Design moderne et premium
- ✅ Mode sombre élégant
- ✅ Animations fluides
- ✅ Effets de survol interactifs
- ✅ Responsive (mobile, tablette, desktop)

### Navigation
- ✅ Menu de navigation cohérent
- ✅ Footer avec liens rapides
- ✅ Breadcrumbs sur certaines pages
- ✅ Liens internes fonctionnels

### Contenu
- ✅ Images de haute qualité
- ✅ Typographie soignée
- ✅ Palette de couleurs cohérente (jaune primaire #F2EA7E)
- ✅ Icônes Material Symbols

## 🎨 Palette de Couleurs

- **Primary**: #F2EA7E (Jaune)
- **Background Dark**: #0A0A0A
- **Background Light**: #1a1a1a
- **Charcoal**: #121212
- **White**: #FFFFFF
- **Text Secondary**: rgba(255, 255, 255, 0.7)

## 📱 Pages Responsives

Toutes les pages sont optimisées pour:
- 📱 Mobile (320px - 767px)
- 📱 Tablette (768px - 1023px)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🔐 Section Admin

Pour accéder à la section admin:
1. Allez sur `admin/login.html`
2. La page de connexion est stylisée et sécurisée
3. Après connexion (simulée), accès au dashboard et aux outils de gestion

## 📝 Notes Importantes

- Les images sont hébergées sur Google Cloud (lh3.googleusercontent.com)
- Tailwind CSS est chargé via CDN
- Les polices Google Fonts sont chargées via CDN
- Aucune dépendance npm requise
- Site statique, prêt pour le déploiement

## 🌐 Déploiement

Ce site peut être déployé sur:
- **Netlify** - Glissez-déposez le dossier
- **Vercel** - Déploiement Git
- **GitHub Pages** - Hébergement gratuit
- **Firebase Hosting** - Hébergement Google
- **N'importe quel serveur web** - Apache, Nginx, etc.

## 📧 Contact

Pour toute question concernant ce projet, consultez la page contact.html

---

**LIQUIDO** - Premium Vaping Experience Since 2018
*21+ Only • Enjoy Responsibly*
