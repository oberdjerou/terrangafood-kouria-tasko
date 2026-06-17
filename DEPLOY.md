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

*Section à compléter en Tâche 2 (déploiement Render).*

---

## 3. Vercel — Frontend Next.js

*Section à compléter en Tâche 3 (déploiement Vercel).*

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
