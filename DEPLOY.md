# 🚀 DEPLOY.md — Déploiement de TerrangaFood en production

**Équipe Kouria Tasko** — Lab 4 (Architecture Logicielle 2, ESTM L3 GL)
**Stack de production** : MongoDB Atlas (DB) + Render (API Express) + Vercel (Next.js)

> 🔐 **Aucun secret n'est documenté dans ce fichier.** Toutes les valeurs sensibles (mot de passe Atlas, URI complète, tokens) restent dans les variables d'environnement de chaque service ou dans le `.env` local (déjà ignoré par Git).

---

## 1. MongoDB Atlas — base de données

### Configuration du cluster

| Élément | Valeur |
| --- | --- |
| Provider | AWS |
| Tier | **M0 (Free)** — 512 Mo, partagé |
| Région | Frankfurt (eu-central-1) *ou* Cape Town (af-south-1) |
| Cluster name | `Cluster0` |
| Base de données | `terrangafood` |

### Sécurité

| Élément | Valeur |
| --- | --- |
| Utilisateur DB | `terrangafood-admin` (rôle `readWrite` sur `terrangafood`) |
| Authentification | SCRAM (username + mot de passe régénéré côté Atlas) |
| Network Access | `0.0.0.0/0` — **accepté pour ce TP** (sinon il faut whitelister l'IP de Render qui change) |

### Format de la connection string (sans secret)

```
mongodb+srv://<USER>:<MOT_DE_PASSE>@cluster0.<id>.mongodb.net/terrangafood?retryWrites=true&w=majority&appName=Cluster0
```

La valeur réelle est stockée :
- **En local** : dans `.env` (déjà dans `.gitignore`, jamais commit)
- **En production Render** : comme variable d'environnement `MONGODB_URI` (voir section 2)

### Données seed initiales

Le script `api/src/seed/seed.js` insère :
- **5 restaurants** dakarois (Chez Fatou, Le Lamantin, Dibiterie Keur Serigne, Phare des Mamelles, Tangana Café)
- **26 plats** répartis sur les 5 restaurants

### Procédure de seed vers Atlas (à exécuter en local, une fois)

```powershell
cd api
$env:MONGODB_URI = "<URI_ATLAS>"   # colle ici l'URI Atlas complète avec mot de passe
node src/seed/seed.js
```

**Attendu** :
```
✅ Connecté à MongoDB
🗑️  Collections nettoyées
🏪 5 restaurants insérés
🍽️  26 plats insérés
✅ Seed terminé avec succès !
```

> ℹ️ Le script utilise `path.resolve(__dirname, '../../../.env')` avec garde `fs.existsSync` (cf. Lab 3) : si un fichier `.env` local existe, il sera chargé en premier ; sinon, seule la variable d'environnement inline est utilisée.

---

## 2. Render — API Express

### Service déployé

| Élément | Valeur |
| --- | --- |
| Service name | `terrangafood-api` |
| **URL publique** | **https://terrangafood-api.onrender.com** |
| Région | Frankfurt (EU Central) |
| Branche source | `main` |
| Auto-deploy | activé (à chaque push sur `main`) |
| Instance Type | **Free** (cold start ~30-60 s après inactivité) |

### Configuration du service

| Champ Render | Valeur |
| --- | --- |
| Root Directory | `api` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node src/app.js` |

### Variables d'environnement (côté Render uniquement)

| Clé | Valeur |
| --- | --- |
| `MONGODB_URI` | URI Atlas complète avec mot de passe (cf. section 1) — **jamais committée** |
| `PORT` | `3001` |

### Vérification après déploiement

```bash
curl https://terrangafood-api.onrender.com/
# → {"message":"Bienvenue sur l'API TerrangaFood 🍛","version":"0.0.0", ...}

curl https://terrangafood-api.onrender.com/api/restaurants
# → tableau des 5 restaurants (Chez Fatou, Le Lamantin, ...)

curl https://terrangafood-api.onrender.com/api/plats
# → tableau des 26 plats

curl https://terrangafood-api.onrender.com/api/commandes
# → [] (vide tant qu'aucune commande n'a été créée en prod)
```

### Pièges rencontrés et résolutions (Lab 4)

1. **`Invalid scheme`** au premier déploiement → la variable `MONGODB_URI` avait été ajoutée mais le redeploy n'avait pas tourné après. Solution : **Manual Deploy → Deploy latest commit** après chaque modif d'env var.
2. **`Could not connect to any servers`** au 2e déploiement → la whitelist Atlas n'incluait pas l'IP variable de Render (Free tier ne donne pas d'IP fixe). Solution : ajouter `0.0.0.0/0` dans Atlas → Network Access.

---

## 3. Vercel — Frontend Next.js

### Service déployé

| Élément | Valeur |
| --- | --- |
| Project name | `terrangafood-kouria-tasko` |
| **URL publique** | **https://terrangafood-kouria-tasko.vercel.app** |
| Région build | Washington DC (iad1) |
| Branche source | `main` |
| Auto-deploy | activé (chaque push sur `main` → nouveau déploiement Production) |
| Plan | Hobby (gratuit) |

### Configuration du projet

| Champ Vercel | Valeur |
| --- | --- |
| Framework Preset | **Next.js** *(critique — voir piège ci-dessous)* |
| Root Directory | `web` |
| Build Command | `next build` (auto-détecté) |
| Output Directory | `.next` (auto-détecté) |
| Install Command | `npm install` (auto-détecté) |
| Node version | 20.x |

### Variables d'environnement (côté Vercel)

| Clé | Valeur | Environments |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://terrangafood-api.onrender.com/api` | Production, Preview, Development |

> ⚠️ **Le suffixe `/api` est obligatoire**. Sans lui, le frontend appelle l'API root (`https://...onrender.com/restaurants`) → 404 sur tous les fetch.

### Vérification après déploiement

```bash
curl -I https://terrangafood-kouria-tasko.vercel.app/
# → HTTP/2 200

curl -s https://terrangafood-kouria-tasko.vercel.app/ | grep -c "Chez Fatou"
# → 1 (et 5 cartes restaurant-card-body au total)

curl -I https://terrangafood-kouria-tasko.vercel.app/mes-commandes
# → HTTP/2 200
```

### Pièges rencontrés et résolutions (Lab 4)

1. **`Error: No Output Directory named "public" found`** au build initial → Framework Preset Vercel était sur "Other" au lieu de "Next.js". Du coup Vercel cherchait un dossier `public/` (sortie HTML statique) au lieu de comprendre `.next/`. Solution : Vercel → Settings → Build & Development Settings → Framework Preset = **Next.js** → Save → Redeploy.
2. **Premier chargement lent (~30-60 s)** : normal. L'API Render Free se met en veille après 15 min sans trafic, le 1er fetch SSR doit la réveiller. Une fois chaude, les requêtes suivantes sont instantanées.
3. **Tests SSR locaux Docker** (cf. Lab 3 PR #15) restent valables : la même logique `typeof window === 'undefined'` permet d'utiliser des URLs différentes côté serveur et côté navigateur. En prod Vercel, `NEXT_PUBLIC_API_URL` est utilisée des deux côtés car les serveurs Vercel atteignent Render sans souci via Internet.

---

## 4. Schéma d'architecture en production

```
            ┌─────────────────────┐
            │     Navigateur      │
            │  (utilisateur final)│
            └──────────┬──────────┘
                       │ HTTPS
                       ▼
            ┌─────────────────────┐
            │  Vercel  (Next.js)  │   https://<frontend>.vercel.app
            │  - Pages statiques  │
            │  - Server Components│
            └──────────┬──────────┘
                       │ fetch HTTPS via NEXT_PUBLIC_API_URL
                       ▼
            ┌─────────────────────┐
            │  Render  (Express)  │   https://<api>.onrender.com
            │  - Routes REST      │
            └──────────┬──────────┘
                       │ MongoDB driver (TLS)
                       ▼
            ┌─────────────────────┐
            │  MongoDB Atlas      │   cluster0.<id>.mongodb.net
            │  - cluster M0 free  │
            └─────────────────────┘
```

---

*Document tenu par Oumar Hamid Berdjerou (CP).*
