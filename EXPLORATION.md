# 🔍 EXPLORATION.md — Rapport de découverte du starter TerrangaFood

**Équipe** : Kouria Tasko
**Membres** : Oumar Hamid Berdjerou (CP · DO · DB) — Oumkalsoum Abdelkerim (DF · QA)
**Date** : Juin 2026
**Lab** : Lab 0 — Architecture Logicielle 2 (ESTM, L3 GL)

---

## 1. Présentation générale du projet

TerrangaFood est un starter kit full-stack destiné à servir de base à une plateforme de commande de plats auprès de restaurants dakarois. Le dépôt est organisé en deux sous-projets indépendants :

- `api/` — une API REST construite avec **Express.js** et **Mongoose**, connectée à **MongoDB**.
- `web/` — une interface web développée avec **Next.js 14** (App Router) et **React 18**.

Les deux applications communiquent en HTTP/JSON via la variable d'environnement `NEXT_PUBLIC_API_URL`. CORS est activé côté API pour autoriser le frontend (port 3000) à appeler le backend (port 3001).

---

## 2. Architecture du backend (`api/`)

### 2.1 Structure des dossiers

```
api/src/
├── app.js              ← point d'entrée Express
├── controllers/        ← logique métier (restaurantController.js, platController.js)
├── models/             ← schémas Mongoose (Restaurant.js, Plat.js)
├── routes/             ← définition des endpoints (restaurants.js, plats.js)
├── middleware/         ← errorHandler.js
└── seed/               ← script d'initialisation (seed.js)
```

### 2.2 Pattern adopté : MVC adapté à une API REST

| Couche | Responsabilité | Fichiers concernés |
| --- | --- | --- |
| Model | Définit la forme des documents MongoDB | `models/Restaurant.js`, `models/Plat.js` |
| Controller | Reçoit la requête, appelle le model, renvoie du JSON | `controllers/restaurantController.js`, `controllers/platController.js` |
| Routes | Mappe chaque URL à une fonction du controller | `routes/restaurants.js`, `routes/plats.js` |

Il n'y a pas de couche « View » classique : la View est en réalité le frontend Next.js, qui consomme l'API.

### 2.3 Cycle de vie de l'application

Le fichier `api/src/app.js` orchestre les étapes suivantes :

1. Chargement des variables d'environnement via `dotenv.config({ path: '../.env' })`.
2. Création de l'application Express et lecture du port (`PORT`, défaut 3001).
3. Enregistrement des middlewares globaux : `cors()`, `express.json()`, `morgan('dev')`.
4. Branchement des routes : `/`, `/api/restaurants`, `/api/plats`.
5. Enregistrement du middleware `errorHandler` en dernier.
6. **Connexion à MongoDB** : si elle réussit, le serveur démarre via `app.listen(PORT)` ; sinon le processus se termine (`process.exit(1)`).

### 2.4 Endpoints découverts

| Méthode | URL | Réponse |
| --- | --- | --- |
| GET | `/` | JSON d'accueil listant les endpoints disponibles |
| GET | `/api/restaurants` | Tableau des restaurants seedés |
| GET | `/api/plats` | Tableau des plats seedés |

Tests effectués depuis PowerShell :

```powershell
curl http://localhost:3001/
curl http://localhost:3001/api/restaurants
curl http://localhost:3001/api/plats
```

Les trois retournent un statut HTTP 200 et un corps JSON valide.

---

## 3. Architecture du frontend (`web/`)

### 3.1 Structure des dossiers

```
web/
├── app/                ← App Router (Next.js 13+)
│   ├── layout.js       ← layout racine appliqué à toutes les pages
│   ├── page.js         ← page d'accueil (route /)
│   ├── globals.css
│   └── restaurants/[id]/page.js  ← route dynamique d'un restaurant
├── components/         ← Header.js, RestaurantCard.js, PlatCard.js
└── lib/                ← utilitaires (helpers de fetch)
```

### 3.2 Conventions du Next.js App Router

- Un dossier contenant un fichier `page.js` devient automatiquement une route HTTP accessible.
- `layout.js` enveloppe toutes les pages enfantes (utile pour le `<Header/>` partagé).
- Un dossier nommé entre crochets (`[id]`) crée un **paramètre dynamique** récupérable côté serveur.
- Par défaut, les composants sont des **Server Components** : leur rendu HTML est généré côté serveur Next.js avant envoi au navigateur.

### 3.3 Composants observés

- `Header.js` : barre de navigation utilisée dans toutes les pages, importée depuis `layout.js`.
- `RestaurantCard.js` : carte d'affichage d'un restaurant (utilisée dans la liste de l'accueil).
- `PlatCard.js` : carte d'affichage d'un plat (utilisée sur la page détail d'un restaurant).

### 3.4 Communication avec l'API

Les pages effectuent des `fetch(${process.env.NEXT_PUBLIC_API_URL}/...)`. Le préfixe `NEXT_PUBLIC_` est obligatoire dans Next.js pour que la variable soit accessible côté navigateur.

---

## 4. Configuration et lancement (rôle DO)

### 4.1 Prérequis vérifiés
- Node.js v24.15.0 (≥ 20 requis pour Next.js 14).
- Compte MongoDB Atlas créé par l'équipe (cluster M0 partagé entre les deux membres).
- Git installé.

### 4.2 Procédure de lancement (deux terminaux)

```powershell
# Terminal 1 — API
cd api
npm run dev

# Terminal 2 — Frontend
cd web
npm run dev
```

L'API affiche `✅ Connecté à MongoDB avec succès` puis `🚀 Serveur démarré sur le port 3001`.
Le frontend devient disponible sur `http://localhost:3000`.

### 4.3 Initialisation des données
```powershell
cd api
npm run seed
```

---

## 5. Rapport QA — Tests fonctionnels

| Test | Résultat attendu | Résultat observé | Statut |
| --- | --- | --- | --- |
| API : `GET /` répond du JSON | Statut 200, message d'accueil | OK | ✅ |
| API : `GET /api/restaurants` | Tableau non vide | Tableau de restaurants seedés | ✅ |
| API : `GET /api/plats` | Tableau non vide | Tableau de plats seedés | ✅ |
| Web : page d'accueil charge | Liste de cartes restaurants | Cartes affichées correctement | ✅ |
| Web : clic sur une carte restaurant | Navigation vers `/restaurants/[id]` | Page détail affichée | ✅ |
| Web : le `<Header/>` est partagé | Visible sur toutes les pages | Confirmé | ✅ |

Aucun bug bloquant détecté. Quelques warnings `npm WARN deprecated` au moment de l'installation sont signalés comme non bloquants.

---

## 6. Difficultés rencontrées et résolutions

1. **Connexion MongoDB Atlas refusée au premier lancement** — cause : l'adresse IP du poste n'était pas dans la whitelist Atlas. Résolution : ajout de `0.0.0.0/0` dans Network Access (acceptable pour un contexte pédagogique uniquement).
2. **`.env` non lu côté API** — cause : `dotenv.config({ path: '../.env' })` impose que la commande soit lancée depuis le dossier `api/`. Résolution : toujours `cd api` avant `npm run dev`.

---

## 7. Conclusion

Le starter TerrangaFood présente une séparation claire des responsabilités entre backend et frontend, suit les conventions modernes (MVC côté API, App Router côté Next.js) et fournit un terrain pédagogique exploitable pour la suite du cours. L'équipe Kouria Tasko a validé l'environnement de travail sur les machines des deux membres et confirme que le projet est prêt pour le tag `v0.0`.

---

*Rapport rédigé par Oumkalsoum Abdelkerim (QA) — relu par Oumar Hamid Berdjerou (CP).*
