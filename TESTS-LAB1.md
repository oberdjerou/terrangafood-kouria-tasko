# 🧪 TESTS-LAB1.md — Rapport de tests API Commandes

**Équipe Kouria Tasko** — Lab 1 — Architecture Logicielle 2 (ESTM L3 GL)
**Date d'exécution** : 2026-06-16
**Environnement** : API Express locale (`http://localhost:3001`), MongoDB Atlas (cluster `cluster0.elatjdh`)
**Outil** : `curl` depuis bash sur Windows

---

## 🛠️ Setup — IDs utilisés

Récupérés via `GET /api/restaurants` et `GET /api/plats` :

| Élément | ID | Valeur |
| --- | --- | --- |
| Restaurant | `6a31a57257c0f6cb5f851f4a` | Chez Fatou |
| Plat 1 | `6a31a57257c0f6cb5f851f50` | Thiéboudienne (2500 XOF) |
| Plat 2 | `6a31a57257c0f6cb5f851f51` | Yassa Poulet (2000 XOF) |
| **Total** | — | **4500 XOF** |
| ID inexistant (pour 404) | `507f1f77bcf86cd799439011` | (ObjectId valide mais absent) |

> ⚠️ **Note d'encodage UTF-8** : sur Windows + bash, passer un body inline avec accents (`"confirmée"`) à `curl -d` corrompt les caractères avant l'envoi (le `é` arrive comme byte 0xe9 latin-1 au lieu de `\xc3\xa9` UTF-8). Solution adoptée pour les tests de transition de statut : générer le JSON via Node (`node -e "require('fs').writeFileSync(...)"`) puis `curl -d @fichier.json`. Cela garantit un encodage UTF-8 propre conforme à la spec JSON.

---

## 📋 Résultats des 13 tests

### Test 1 — POST commande valide (201)

**Commande** :
```bash
curl -X POST http://localhost:3001/api/commandes \
  -H "Content-Type: application/json" \
  -d '{"client":"Aminata Diop","telephone":"+221 77 123 45 67","adresseLivraison":"Sicap Liberte 6, Dakar","restaurant":"6a31a57257c0f6cb5f851f4a","plats":["6a31a57257c0f6cb5f851f50","6a31a57257c0f6cb5f851f51"],"montantTotal":4500,"commentaire":"Sans piment svp"}'
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 201 + statut « en attente » | `HTTP 201`, `"statut":"en attente"`, `_id` retourné, `createdAt`/`updatedAt` automatiques | ✅ **PASS** |

---

### Test 2 — POST sans client (400 + liste des erreurs)

**Commande** :
```bash
curl -X POST http://localhost:3001/api/commandes \
  -H "Content-Type: application/json" \
  -d '{"telephone":"+221 77 000 00 00","adresseLivraison":"Plateau","restaurant":"6a31a57257c0f6cb5f851f4a","plats":["6a31a57257c0f6cb5f851f50"],"montantTotal":2500}'
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 400 + tableau d'erreurs | `HTTP 400`, body : `{"message":"Données invalides","erreurs":["Le nom du client est obligatoire"]}` | ✅ **PASS** |

---

### Test 3 — GET toutes les commandes (200)

**Commande** :
```bash
curl http://localhost:3001/api/commandes
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200, tableau, tri date desc | `HTTP 200`, tableau avec la commande créée, `restaurant` et `plats` peuplés (voir tests 12 et 13) | ✅ **PASS** |

---

### Test 4 — GET commande par ID (200)

**Commande** :
```bash
curl http://localhost:3001/api/commandes/6a31af44472cdeb1cefc185a
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + commande peuplée | `HTTP 200`, commande complète avec `restaurant.nom` et `plats[].nom`, `plats[].prix` | ✅ **PASS** |

---

### Test 5 — GET commande ID inexistant (404)

**Commande** :
```bash
curl http://localhost:3001/api/commandes/507f1f77bcf86cd799439011
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 404 + message | `HTTP 404`, body : `{"message":"Commande non trouvée"}` | ✅ **PASS** |

---

### Test 6 — PATCH en attente → confirmée (200)

**Commande** (avec JSON UTF-8 généré via Node) :
```bash
node -e "require('fs').writeFileSync('s_confirmee.json', JSON.stringify({statut:'confirmée'}))"
curl -X PATCH http://localhost:3001/api/commandes/$CMD_ID/statut \
  -H "Content-Type: application/json" -d @s_confirmee.json
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + statut "confirmée" | `HTTP 200`, body retourne la commande avec `"statut":"confirmée"` | ✅ **PASS** |

---

### Test 7 — PATCH confirmée → en livraison (200)

**Commande** :
```bash
node -e "require('fs').writeFileSync('s_livraison.json', JSON.stringify({statut:'en livraison'}))"
curl -X PATCH http://localhost:3001/api/commandes/$CMD_ID/statut \
  -H "Content-Type: application/json" -d @s_livraison.json
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + statut "en livraison" | `HTTP 200`, body retourne la commande avec `"statut":"en livraison"` | ✅ **PASS** |

---

### Test 8 — PATCH en livraison → livrée (200)

**Commande** :
```bash
node -e "require('fs').writeFileSync('s_livree.json', JSON.stringify({statut:'livrée'}))"
curl -X PATCH http://localhost:3001/api/commandes/$CMD_ID/statut \
  -H "Content-Type: application/json" -d @s_livree.json
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + statut "livrée" | `HTTP 200`, body retourne la commande avec `"statut":"livrée"` | ✅ **PASS** |

---

### Test 9 — PATCH transition interdite : en attente → livrée (400)

**Commande** :
```bash
curl -X PATCH http://localhost:3001/api/commandes/$CMD_ID/statut \
  -H "Content-Type: application/json" -d '{"statut":"livrée"}'
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 400 + statutActuel/statutDemande/transitionsAutorisees | `HTTP 400`, body : `{"message":"Transition de statut interdite","statutActuel":"en attente","statutDemande":"livrée","transitionsAutorisees":["confirmée","annulée"]}` | ✅ **PASS** |

---

### Test 10 — PATCH commande livrée (toute transition) → 400

**Commande** :
```bash
node -e "require('fs').writeFileSync('s_annulee.json', JSON.stringify({statut:'annulée'}))"
curl -X PATCH http://localhost:3001/api/commandes/$CMD_ID/statut \
  -H "Content-Type: application/json" -d @s_annulee.json
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 400, `transitionsAutorisees: []` (état final) | `HTTP 400`, body : `{"message":"Transition de statut interdite","statutActuel":"livrée","statutDemande":"annulée","transitionsAutorisees":[]}` | ✅ **PASS** |

---

### Test 11 — DELETE commande (200)

**Commande** :
```bash
curl -X DELETE http://localhost:3001/api/commandes/$CMD_ID
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + message | `HTTP 200`, body : `{"message":"Commande supprimée avec succès"}` | ✅ **PASS** |

**Vérification additionnelle** : `GET /api/commandes/$CMD_ID` retourne ensuite `HTTP 404` + `{"message":"Commande non trouvée"}` → la commande est bien retirée de la DB.

---

### Test 12 — Populate restaurant visible

**Commande** :
```bash
curl http://localhost:3001/api/commandes/6a31af44472cdeb1cefc185a
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| `restaurant` populated (nom inclus) | `"restaurant":{"_id":"6a31a57257c0f6cb5f851f4a","nom":"Chez Fatou"}` | ✅ **PASS** |

---

### Test 13 — Populate plats visible

**Commande** :
```bash
curl http://localhost:3001/api/commandes/6a31af44472cdeb1cefc185a
```

| Attendu | Observé | Statut |
| --- | --- | --- |
| `plats[]` populated (nom + prix inclus) | `"plats":[{"_id":"...","nom":"Thiéboudienne","prix":2500},{"_id":"...","nom":"Yassa Poulet","prix":2000}]` | ✅ **PASS** |

---

## 📊 Récapitulatif

| # | Test | Code attendu | Code obtenu | Statut |
| --- | --- | --- | --- | --- |
| 1 | POST commande valide | 201 | 201 | ✅ |
| 2 | POST sans client | 400 | 400 | ✅ |
| 3 | GET toutes commandes | 200 | 200 | ✅ |
| 4 | GET commande par ID | 200 | 200 | ✅ |
| 5 | GET ID inexistant | 404 | 404 | ✅ |
| 6 | PATCH en attente → confirmée | 200 | 200 | ✅ |
| 7 | PATCH confirmée → en livraison | 200 | 200 | ✅ |
| 8 | PATCH en livraison → livrée | 200 | 200 | ✅ |
| 9 | PATCH transition interdite | 400 | 400 | ✅ |
| 10 | PATCH commande livrée → 400 | 400 | 400 | ✅ |
| 11 | DELETE commande | 200 | 200 | ✅ |
| 12 | Populate restaurant | présent | présent | ✅ |
| 13 | Populate plats | présent | présent | ✅ |

**Bilan : 13 / 13 PASS — aucun FAIL.**

---

## 🐛 Bug mineur identifié (hors périmètre Lab 1)

**`api/src/seed/seed.js` ligne 6** : `dotenv.config({ path: '../../.env' })` cherche le `.env` deux niveaux au-dessus du cwd. Comme `npm run seed` est lancé depuis `api/`, le path résout `Desktop/.env` au lieu de `terrangafood-kouria-tasko/.env`. Contournement utilisé : passer `MONGODB_URI` en variable inline pour le seed initial. Le correctif (changer en `'../.env'` comme dans `app.js`) sera fait dans un ticket séparé du Lab 1.

---

*Tests exécutés et documentés par Oumkalsoum Abdelkerim (rôle QA), validés par Oumar Hamid Berdjerou (CP).*
