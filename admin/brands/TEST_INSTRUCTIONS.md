# Instructions de Test - Gestion des Marques avec Types

## 🎯 Objectif
Vérifier que les marques s'affichent correctement depuis Firebase avec leurs types (Liquide/Dispositif) et que les filtres fonctionnent.

## 📋 Prérequis

1. **Firebase doit être initialisé** avec les données du catalogue
   - Ouvrir `admin/init-firebase.html` dans votre navigateur
   - Cliquer sur "Initialiser Firebase avec les données"
   - Attendre la confirmation de succès

2. **Configuration Firebase** doit être correcte
   - Vérifier que `src/js/services/firebase-config.js` contient vos identifiants Firebase

## 🧪 Tests à Effectuer

### Test 1: Chargement des Marques
1. Ouvrir `admin/brands/index.html` dans votre navigateur
2. **Vérifier** :
   - ✅ Les marques se chargent depuis Firebase
   - ✅ Un indicateur de chargement apparaît brièvement
   - ✅ Les cartes de marques s'affichent

### Test 2: Badges de Type
Pour chaque marque affichée, **vérifier** :
- ✅ Les marques de type "liquid" ont un badge **bleu** avec icône 💧 "Liquide"
- ✅ Les marques de type "device" ont un badge **violet** avec icône 📱 "Dispositif"
- ✅ Le badge est visible dans les deux vues (Grille et Liste)

### Test 3: Filtres par Type
1. **Cliquer sur "Tous"** (bouton actif par défaut)
   - ✅ Toutes les marques sont affichées
   - ✅ Le compteur affiche le nombre total

2. **Cliquer sur "Liquides"**
   - ✅ Seules les marques de type "liquid" sont affichées
   - ✅ Le bouton "Liquides" devient actif (surligné)
   - ✅ Le compteur se met à jour

3. **Cliquer sur "Dispositifs"**
   - ✅ Seules les marques de type "device" sont affichées
   - ✅ Le bouton "Dispositifs" devient actif
   - ✅ Le compteur se met à jour

4. **Cliquer à nouveau sur "Tous"**
   - ✅ Toutes les marques réapparaissent

### Test 4: Recherche Combinée
1. **Taper "Suprem"** dans la barre de recherche
   - ✅ Seules les marques contenant "Suprem" s'affichent

2. **Avec "Suprem" toujours dans la recherche, cliquer sur "Liquides"**
   - ✅ Seules les marques liquides contenant "Suprem" s'affichent
   - ✅ Les deux filtres fonctionnent ensemble

3. **Effacer la recherche**
   - ✅ Le filtre de type reste actif

### Test 5: Comptage des Lignes/Produits
**Vérifier** que le comptage est correct :
- ✅ Marques "liquid" : affiche "X lignes" ou "X ligne"
- ✅ Marques "device" : affiche "X produits" ou "X produit"
- ✅ Marques sans lignes/produits : affiche "Aucune ligne"

### Test 6: Ajout d'une Nouvelle Marque
1. **Cliquer sur "Add New Brand"**
2. **Remplir le formulaire** :
   - Nom : "Test Brand"
   - Type : Sélectionner "Liquide" ou "Dispositif"
   - Section : Sélectionner une section
3. **Cliquer sur "Save Brand"**
4. **Vérifier** :
   - ✅ La marque est sauvegardée dans Firebase
   - ✅ Le type est correctement enregistré
   - ✅ Retour à la liste des marques

5. **Retourner à la liste**
   - ✅ La nouvelle marque apparaît avec le bon badge de type

### Test 7: Édition d'une Marque
1. **Cliquer sur l'icône "edit"** d'une marque existante
2. **Vérifier** :
   - ✅ Le champ "Type" est pré-rempli avec la valeur correcte
   - ✅ Tous les autres champs sont pré-remplis
3. **Modifier le type** (si nécessaire)
4. **Sauvegarder**
5. **Vérifier** :
   - ✅ Le badge de type se met à jour dans la liste

## 🐛 Dépannage

### Les marques ne se chargent pas
1. **Ouvrir la console du navigateur** (F12)
2. **Vérifier les erreurs** :
   - Erreur Firebase ? → Vérifier la configuration
   - Erreur de réseau ? → Vérifier la connexion Internet
   - Erreur "catalog not found" ? → Initialiser Firebase avec `init-firebase.html`

### Les badges de type ne s'affichent pas
1. **Vérifier dans la console** :
   ```javascript
   // Dans la console du navigateur
   catalogService.getAllBrands().then(brands => console.log(brands))
   ```
2. **Vérifier** que chaque marque a un champ `type`
3. Si le champ `type` est manquant, réinitialiser Firebase ou ajouter manuellement

### Les filtres ne fonctionnent pas
1. **Vérifier dans la console** s'il y a des erreurs JavaScript
2. **Vérifier** que les boutons de filtre ont les bons IDs :
   - `filter-all-btn`
   - `filter-liquid-btn`
   - `filter-device-btn`

## 📊 Structure de Données Attendue

### Marque de type "liquid"
```json
{
  "name": "Suprem-e",
  "type": "liquid",
  "website": "https://suprem-e.com/",
  "logo_url": "/images/brands/suprem-e_logo.png",
  "lines": [
    {
      "name": "FIRST PICK RE-BRAND",
      "image_url": "/images/products/suprem-e/re-brand.jpg",
      "products": []
    }
  ]
}
```

### Marque de type "device"
```json
{
  "name": "Geekvape",
  "type": "device",
  "website": "geekvape.com/",
  "logo_url": "/images/brands/geekvape_logo.png",
  "products": [
    { "name": "PEAK 2" },
    { "name": "WENAX M" }
  ]
}
```

## ✅ Checklist Finale

- [ ] Firebase est initialisé avec les données
- [ ] Les marques se chargent correctement
- [ ] Les badges de type s'affichent (bleu pour liquides, violet pour dispositifs)
- [ ] Le filtre "Tous" affiche toutes les marques
- [ ] Le filtre "Liquides" affiche uniquement les marques liquides
- [ ] Le filtre "Dispositifs" affiche uniquement les marques dispositifs
- [ ] La recherche fonctionne
- [ ] La recherche + filtre de type fonctionnent ensemble
- [ ] Le comptage lignes/produits est correct
- [ ] L'ajout d'une marque fonctionne avec le champ type
- [ ] L'édition d'une marque fonctionne avec le champ type
- [ ] La suppression d'une marque fonctionne

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier la console du navigateur pour les erreurs
2. Vérifier que Firebase est correctement configuré
3. Vérifier que les données sont dans le bon format dans Firebase
4. Réinitialiser Firebase si nécessaire avec `init-firebase.html`
