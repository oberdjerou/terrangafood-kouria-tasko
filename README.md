# 🍛 TerrangaFood

Plateforme de commande de plats auprès de restaurants dakarois.

**Projet pédagogique** — Architecture Logicielle 2 — L3 Génie Logiciel — UCAD / ESP

## Stack technique

| Module | Stack |
|--------|-------|
| Backend API | Express.js, MongoDB, Mongoose |
| Frontend | Next.js 14 (App Router) |
| Base de données | MongoDB (local ou Atlas) |

## Démarrage rapide

### Prérequis

- Node.js 20 LTS
- MongoDB (local ou compte Atlas)
- Git

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/[votre-pseudo]/terrangafood-[equipe].git
cd terrangafood-[equipe]

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec votre URI MongoDB

# Installer les dépendances API
cd api
npm install

# Installer les dépendances Frontend
cd ../web
npm install
```

### Lancement

```bash
# Terminal 1 — API (port 3001)
cd api
npm run dev

# Terminal 2 — Frontend (port 3000)
cd web
npm run dev
```

### Initialiser les données

```bash
cd api
npm run seed
```

## Structure du projet

```
terrangafood/
├── api/                    # Backend Express
│   ├── src/
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes Express
│   │   ├── controllers/    # Logique métier
│   │   ├── middleware/      # Middleware
│   │   ├── seed/           # Données initiales
│   │   └── app.js          # Point d'entrée
│   └── package.json
├── web/                    # Frontend Next.js
│   ├── app/                # Pages (App Router)
│   ├── components/         # Composants réutilisables
│   ├── lib/                # Utilitaires
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Licence

Projet pédagogique — Usage académique uniquement.

---

## 👥 Équipe — Kouria Tasko

Travail de groupe réalisé dans le cadre du cours **Architecture Logicielle 2** (ESTM, L3 GL).

- **Oumar Hamid Berdjerou** (CP · DO · DB) — [@oberdjerou](https://github.com/oberdjerou)
- **Oumkalsoum Abdelkerim** (DF · QA) — [@oumkalsoum](https://github.com/oumkalsoum)

Pour le détail des rôles, voir [`CONTRIBUTORS.md`](./CONTRIBUTORS.md).
Pour le rapport d'exploration, voir [`EXPLORATION.md`](./EXPLORATION.md).

---

## ✍️ Mot de l'équipe

Bienvenue sur notre fork de TerrangaFood ! Ce projet est notre Lab 0 du cours d'Architecture Logicielle 2.

Le repo a été exploré et validé par les deux membres. Le rapport d'exploration complet est dans [`EXPLORATION.md`](./EXPLORATION.md).
