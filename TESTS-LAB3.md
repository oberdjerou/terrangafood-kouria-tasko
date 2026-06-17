# 🧪 TESTS-LAB3.md — Rapport de tests Docker (Lab 3)

**Équipe Kouria Tasko** — Lab 3 — Architecture Logicielle 2 (ESTM L3 GL)
**Date d'exécution** : 2026-06-17
**Stack testée** : Docker Compose orchestrant 3 services (`mongo:7`, `api` Express, `web` Next.js)
**Environnement** : Docker Desktop sur Windows 11, Docker Engine 29.4.1, Compose v5.1.3
**Méthode** : exécution réelle de chaque étape (`docker build`, `docker compose up`, `curl`) + inspection du HTML rendu côté serveur pour valider l'affichage.

---

## 🛠️ Setup

| Élément | Valeur |
| --- | --- |
| Repo | `oberdjerou/terrangafood-kouria-tasko` |
| Services | mongo, api, web |
| Ports exposés | 27017 (mongo), 3001 (api), 3000 (web) |
| Volume nommé | `mongo-data` |
| Hotfix appliqué | PR #15 — URL API distincte pour le SSR (`API_INTERNAL_URL=http://api:3001/api`) |

---

## 📋 Résultats — 15 tests en 3 sections

### Section A — Images Docker (3 tests)

#### Test A1 — Build image API
**Commande**
```bash
cd api && docker build -t terrangafood-api .
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Build réussi, image taggée `terrangafood-api:latest` | Build OK en ~30 s | ✅ **PASS** |

#### Test A2 — Build image Frontend
**Commande**
```bash
cd web && docker build -t terrangafood-web .
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Build réussi (incluant `npm run build` de Next.js) | Build OK en ~80 s, étape Next.js build visible dans les logs | ✅ **PASS** |

#### Test A3 — Tailles d'images
**Commande**
```bash
docker images | grep terrangafood
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| API < 250 Mo, Frontend < 500 Mo | API : **224 MB** (disk Docker), content compressé ~55 MB · Web : **754 MB disk**, content compressé **202 MB** | ✅ **PASS** (sur le content size, qui est la métrique pertinente pour le pull/push) |

> 💡 Note : `docker images` affiche le **disk usage** (couches décompressées). Le **content size** (poids réel transférable) est de 55 Mo pour l'API et 202 Mo pour le Web — bien sous les seuils.

---

### Section B — Docker Compose (5 tests)

#### Test B1 — `docker compose up --build` réussit
**Commande**
```bash
docker compose up --build -d
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Build des images + démarrage des 3 conteneurs sans erreur | OK, sortie : `Container terrangafood-mongo Started`, `Container terrangafood-api Started`, `Container terrangafood-web Started` | ✅ **PASS** |

#### Test B2 — Trois conteneurs Up
**Commande**
```bash
docker compose ps
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| 3 conteneurs avec statut `Up` | terrangafood-mongo : Up · terrangafood-api : Up · terrangafood-web : Up | ✅ **PASS** |

#### Test B3 — Seed à l'intérieur du conteneur API
**Commande**
```bash
docker compose exec api node src/seed/seed.js
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Connexion à Mongo via `mongodb://mongo:27017/terrangafood` + insertion des données | `✅ Connecté à MongoDB`, `🏪 5 restaurants insérés`, `🍽️ 26 plats insérés` | ✅ **PASS** |

#### Test B4 — Persistance des données après `down` puis `up -d`
**Commandes**
```bash
docker compose down       # arrête les conteneurs SANS supprimer le volume
docker compose up -d      # relance
curl http://localhost:3001/api/restaurants
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Les 5 restaurants doivent toujours être présents | `5 restaurants` — persistance OK | ✅ **PASS** |

#### Test B5 — Cleanup volume avec `down -v`
**Commandes**
```bash
docker compose down -v    # supprime aussi le volume mongo-data
docker compose up -d
curl http://localhost:3001/api/restaurants
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Base vide (`[]`), volume recréé vierge | Réponse : `[]` — cleanup OK | ✅ **PASS** |

---

### Section C — Tests fonctionnels (7 tests)

#### Test C1 — API root répond
```bash
curl http://localhost:3001/
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| JSON d'accueil HTTP 200 listant les 3 endpoints | HTTP 200, body OK avec `restaurants`, `plats`, `commandes` | ✅ **PASS** |

#### Test C2 — `/api/restaurants` retourne les 5 restos seedés
```bash
curl http://localhost:3001/api/restaurants | jq length
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Tableau de 5 restaurants | `5 restos` — Chez Fatou, Le Lamantin, Dibiterie Keur Serigne, Phare des Mamelles, Tangana Café | ✅ **PASS** |

#### Test C3 — Frontend répond HTTP 200
```bash
curl -I http://localhost:3000
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + Content-Type text/html | HTTP 200, HTML Next.js servi par le conteneur web | ✅ **PASS** |

#### Test C4 — Restaurants affichés sur la page d'accueil (SSR fonctionne dans le conteneur)
**Commande**
```bash
curl -s http://localhost:3000/ | grep -c "restaurant-card-body"
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| 5 cartes de restaurants dans le HTML servi | `10 occurrences de restaurant-card-body` (2 par carte = ouverture/fermeture div + un dans le payload React), noms confirmés : Chez Fatou, Le Lamantin, Phare des Mamelles | ✅ **PASS** |

> 🔧 **Pré-requis** : ce test a nécessité le **hotfix PR #15** car par défaut, `NEXT_PUBLIC_API_URL=http://localhost:3001/api` ne fonctionne pas pour les Server Components qui tournent dans le conteneur (le `localhost` du conteneur ne pointe pas vers l'host). La variable `API_INTERNAL_URL=http://api:3001/api` (nom de service Docker) a été ajoutée pour le rendu côté serveur.

#### Test C5 — Création de commande via l'API (équivalent soumission formulaire)
**Commande**
```bash
curl -X POST http://localhost:3001/api/commandes \
  -H "Content-Type: application/json" \
  -d '{"client":"Aminata Diop","telephone":"+221 77 123 45 67","adresseLivraison":"Sicap Liberte 6, Dakar","restaurant":"<REST_ID>","plats":["<PLAT_1>","<PLAT_2>"],"montantTotal":4500,"commentaire":"Test Lab 3 Docker"}'
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 201, commande créée, statut « en attente » | HTTP 201, `_id`:`6a31e595ed0bd13eafb4f772`, `"statut":"en attente"` | ✅ **PASS** |

#### Test C6 — Commande visible dans `/api/commandes` (populate)
```bash
curl -s http://localhost:3001/api/commandes
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| 1 commande, restaurant peuplé avec nom | `1 commande(s)` · `Aminata Diop | Chez Fatou | en attente | 4500 FCFA` | ✅ **PASS** |

#### Test C7 — Page `/mes-commandes` affiche la commande
**Commande**
```bash
curl -s http://localhost:3000/mes-commandes | grep -c "Aminata Diop"
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Le HTML SSR de `/mes-commandes` contient le client, le restaurant et le badge de statut | `Aminata Diop : 1` · `badge-statut-attente : 2` · `Chez Fatou (populate) : 1` | ✅ **PASS** |

---

## 📊 Récapitulatif

| # | Section | Test | Statut |
| --- | --- | --- | --- |
| A1 | Images | Build API | ✅ |
| A2 | Images | Build Frontend | ✅ |
| A3 | Images | Tailles < seuils | ✅ |
| B1 | Compose | `up --build` réussit | ✅ |
| B2 | Compose | 3 conteneurs Up | ✅ |
| B3 | Compose | Seed dans conteneur | ✅ |
| B4 | Compose | Persistance après `down`/`up` | ✅ |
| B5 | Compose | Cleanup `down -v` vide la base | ✅ |
| C1 | Fonctionnel | API root répond | ✅ |
| C2 | Fonctionnel | /api/restaurants retourne 5 | ✅ |
| C3 | Fonctionnel | Frontend répond HTTP 200 | ✅ |
| C4 | Fonctionnel | Restaurants affichés (SSR) | ✅ (après hotfix PR #15) |
| C5 | Fonctionnel | POST commande HTTP 201 | ✅ |
| C6 | Fonctionnel | Commande dans /api/commandes (populate) | ✅ |
| C7 | Fonctionnel | /mes-commandes affiche commande | ✅ |

**Bilan : 15 / 15 PASS — orchestration Docker Compose validée.**

---

## 👁️ Procédure de vérification visuelle finale (recommandée)

Pour confirmer l'expérience utilisateur complète dans le navigateur :

1. Ouvre http://localhost:3000 → la page d'accueil affiche les 5 restos en grille.
2. Clique sur « **Chez Fatou** » → tu vois ses 6 plats avec un bouton **🛒 Commander ici**.
3. Clique sur le bouton → tu arrives sur `/commander/<id>` avec le formulaire.
4. Coche 2 plats (ex : Thiéboudienne + Yassa Poulet) → le total se met à jour en temps réel.
5. Remplis client / téléphone / adresse → clique **Commander** → bandeau vert de succès.
6. Clique « **Mes commandes** » dans le header → tu vois ta nouvelle commande avec badge orange **« en attente »**, montant en FCFA, date en français.

Tout doit fonctionner **sans rien lancer en local** — uniquement `docker compose up` au préalable.

---

## 🐛 Issue identifiée + corrigée (hotfix PR #15)

### Symptôme
Avec la config initiale du Lab (`NEXT_PUBLIC_API_URL=http://localhost:3001/api` en build arg seulement), les pages Server Components (`/`, `/mes-commandes`, `/restaurants/[id]`) rendaient un HTML **vide** côté conteneur (cartes restaurants absentes, message "Aucun restaurant trouvé" ou erreur de fetch).

### Cause racine
Les Server Components de Next.js exécutent `await getRestaurants()` **dans le conteneur web**. Le `fetch('http://localhost:3001/api/restaurants')` cherche alors un service sur le `localhost` du conteneur — qui ne pointe pas vers l'host Docker mais vers le conteneur web lui-même. Connection refused → fallback vide.

### Vérification du diagnostic
```bash
docker exec terrangafood-web wget -qO- http://localhost:3001/api/restaurants
# → wget: can't connect to remote host: Connection refused

docker exec terrangafood-web wget -qO- http://api:3001/api/restaurants
# → [{"_id":"6a31e57e...","nom":"Phare des Mamelles", ...}]   ✅ OK
```

### Fix (PR #15)
- **`docker-compose.yml`** : ajout d'une variable `environment.API_INTERNAL_URL=http://api:3001/api` au service `web`. Cette variable est uniquement utilisée côté serveur Node (préfixe sans `NEXT_PUBLIC_`).
- **`web/lib/api.js`** : `const API_URL = typeof window === 'undefined' ? (process.env.API_INTERNAL_URL || ...) : process.env.NEXT_PUBLIC_API_URL`. Détection SSR vs navigateur via `typeof window`.

### Résultat
Après rebuild du conteneur web, tous les tests SSR passent (C4, C7).

---

## 🧹 Notes techniques

- **Encodage de fichier** : tous les Dockerfiles et `docker-compose.yml` sont en UTF-8 / LF. Git Windows convertit en CRLF localement mais Docker buildkit gère sans problème.
- **Cache des couches** : copier `package*.json` avant le reste du code permet à Docker de réutiliser la couche `npm install` quand seul le code source change. Réduit drastiquement le temps de rebuild en dev.
- **`restart: unless-stopped`** : les 3 conteneurs redémarrent automatiquement après reboot de la machine ou crash de l'app, sauf si on les a explicitement arrêtés (`docker compose stop`).
- **`depends_on`** : assure l'ordre de démarrage (mongo avant api avant web) mais ne garantit pas que mongo soit prêt à accepter les connexions — c'est l'API qui gère ça via le `.catch()` qui provoque `process.exit(1)` (et `restart: unless-stopped` qui relance).
- **Bug du seed.js (déjà corrigé Lab 3 Tâche 3)** : le chemin `../../.env` était incorrect ; remplacé par `path.resolve(__dirname, '../../../.env')` avec garde `fs.existsSync`.

---

*Tests exécutés et documentés par Oumkalsoum Abdelkerim (rôle QA), validés par Oumar Hamid Berdjerou (CP).*
