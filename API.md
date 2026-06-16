# 📡 API TerrangaFood — Documentation

**Équipe Kouria Tasko** — Lab 1 (Architecture Logicielle 2, ESTM L3 GL)

---

## Base URL

```
http://localhost:3001/api
```

La route `GET /` (racine, hors `/api`) renvoie un message d'accueil listant les endpoints disponibles.

---

## 🏪 Endpoints — Restaurants

| Méthode | URL | Description | Codes attendus |
| --- | --- | --- | --- |
| GET | `/api/restaurants` | Liste tous les restaurants (triés par note décroissante) | 200 |
| GET | `/api/restaurants/:id` | Détail d'un restaurant | 200 · 404 |
| POST | `/api/restaurants` | Créer un restaurant | 201 · 400 |
| PUT | `/api/restaurants/:id` | Modifier un restaurant | 200 · 400 · 404 |
| DELETE | `/api/restaurants/:id` | Supprimer un restaurant | 200 · 404 |

---

## 🍽️ Endpoints — Plats

| Méthode | URL | Description | Codes attendus |
| --- | --- | --- | --- |
| GET | `/api/plats` | Liste tous les plats | 200 |
| GET | `/api/plats/restaurant/:restaurantId` | Plats d'un restaurant donné | 200 · 404 |
| GET | `/api/plats/:id` | Détail d'un plat | 200 · 404 |
| POST | `/api/plats` | Créer un plat | 201 · 400 |
| PUT | `/api/plats/:id` | Modifier un plat | 200 · 400 · 404 |
| DELETE | `/api/plats/:id` | Supprimer un plat | 200 · 404 |

---

## 📦 Endpoints — Commandes (Lab 1)

| Méthode | URL | Description | Codes attendus |
| --- | --- | --- | --- |
| POST | `/api/commandes` | Créer une commande (statut initial : `en attente`) | 201 · 400 |
| GET | `/api/commandes` | Liste toutes les commandes (triées par date décroissante, restaurant et plats peuplés) | 200 |
| GET | `/api/commandes/:id` | Détail d'une commande (restaurant et plats peuplés) | 200 · 404 |
| PATCH | `/api/commandes/:id/statut` | Mettre à jour le statut (transition contrôlée) | 200 · 400 · 404 |
| DELETE | `/api/commandes/:id` | Supprimer une commande | 200 · 404 |

---

## 📝 Exemple de payload — `POST /api/commandes`

### Requête

```http
POST /api/commandes HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "client": "Aminata Diop",
  "telephone": "+221 77 123 45 67",
  "adresseLivraison": "Villa 12, Sicap Liberté 6, Dakar",
  "restaurant": "6a31a57257c0f6cb5f851f4a",
  "plats": [
    "6a31a57257c0f6cb5f851f60",
    "6a31a57257c0f6cb5f851f61"
  ],
  "montantTotal": 4500,
  "commentaire": "Sans piment s'il vous plaît"
}
```

### Réponse — 201 Created

```json
{
  "_id": "6a31a99b57c0f6cb5f851f99",
  "client": "Aminata Diop",
  "telephone": "+221 77 123 45 67",
  "adresseLivraison": "Villa 12, Sicap Liberté 6, Dakar",
  "restaurant": "6a31a57257c0f6cb5f851f4a",
  "plats": ["6a31a57257c0f6cb5f851f60", "6a31a57257c0f6cb5f851f61"],
  "montantTotal": 4500,
  "statut": "en attente",
  "commentaire": "Sans piment s'il vous plaît",
  "createdAt": "2026-06-16T20:30:00.000Z",
  "updatedAt": "2026-06-16T20:30:00.000Z",
  "__v": 0
}
```

### Réponse — 400 Bad Request (validation Mongoose)

```json
{
  "message": "Données invalides",
  "erreurs": [
    "Le nom du client est obligatoire",
    "Le téléphone du client est obligatoire"
  ]
}
```

---

## 🔁 Diagramme des transitions de statut

```
                          ┌──────────────┐
                          │ en attente   │  ← statut initial (défaut)
                          └──────┬───────┘
                                 │
                ┌────────────────┼────────────────┐
                ▼                                 ▼
        ┌──────────────┐                 ┌──────────────┐
        │  confirmée   │                 │   annulée    │  ← état final
        └──────┬───────┘                 └──────────────┘
               │
       ┌───────┼───────┐
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│en livraison  │ │   annulée    │  ← état final
└──────┬───────┘ └──────────────┘
       │
       ▼
┌──────────────┐
│   livrée     │  ← état final
└──────────────┘
```

### Table des transitions autorisées

| Statut actuel | Transitions autorisées |
| --- | --- |
| `en attente` | `confirmée`, `annulée` |
| `confirmée` | `en livraison`, `annulée` |
| `en livraison` | `livrée` |
| `livrée` | *(aucune — état final)* |
| `annulée` | *(aucune — état final)* |

### Exemple — transition interdite

Requête :

```http
PATCH /api/commandes/6a31a99b57c0f6cb5f851f99/statut HTTP/1.1
Content-Type: application/json

{ "statut": "livrée" }
```

Réponse (statut actuel = `en attente`) — 400 Bad Request :

```json
{
  "message": "Transition de statut interdite",
  "statutActuel": "en attente",
  "statutDemande": "livrée",
  "transitionsAutorisees": ["confirmée", "annulée"]
}
```

---

## 📊 Codes HTTP utilisés

| Code | Signification | Cas typiques |
| --- | --- | --- |
| **200** | OK | GET réussi, PUT/PATCH/DELETE réussi |
| **201** | Created | POST réussi (ressource créée) |
| **400** | Bad Request | Données invalides (`ValidationError` Mongoose) · ID malformé (`CastError`) · Transition de statut interdite |
| **404** | Not Found | Ressource introuvable par ID |
| **500** | Internal Server Error | Erreur serveur non gérée (relayée par `middleware/errorHandler.js`) |

---

## 🔧 Comportements transverses

- **Validation** : tous les `ValidationError` Mongoose sont transformés en réponse 400 avec un tableau `erreurs` listant les messages personnalisés du schéma.
- **Cast d'ID invalide** : géré par `middleware/errorHandler.js` → 400 avec `details` expliquant la valeur fautive.
- **Populate** : les endpoints `GET /api/commandes` et `GET /api/commandes/:id` peuplent automatiquement les champs `restaurant` (nom) et `plats` (nom, prix) pour faciliter l'affichage côté frontend.
- **Tri** : `GET /api/commandes` retourne les commandes triées par `createdAt` décroissant (les plus récentes d'abord).
- **Timestamps** : toutes les ressources ont `createdAt` et `updatedAt` automatiquement gérés par Mongoose.

---

*Document tenu à jour pour Lab 1 — version v0.1.*
