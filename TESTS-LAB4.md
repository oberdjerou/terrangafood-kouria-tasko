# 🧪 TESTS-LAB4.md — Rapport de tests bout en bout en production

**Équipe** : Kouria Tasko
**Testeur** : Oumar Hamid Berdjerou (rôle QA)
**Date d'exécution** : 2026-06-17
**Lab** : Lab 4 — Déploiement production (Architecture Logicielle 2, ESTM L3 GL)

---

## 🌐 URLs de production testées

| Service | URL | Tech |
| --- | --- | --- |
| **Frontend** | https://terrangafood-kouria-tasko.vercel.app | Next.js 14 sur Vercel (Hobby, iad1) |
| **API** | https://terrangafood-api.onrender.com | Express sur Render (Free, Frankfurt) |
| **Base de données** | `cluster0.elatjdh.mongodb.net/terrangafood` | MongoDB Atlas (M0 free) |

> Toute la stack tourne **sans aucun service local** : `docker compose down` puis tests directement contre les URLs prod.

---

## 📋 Résultats des 12 tests du parcours utilisateur

### Test 1 — Accueil Vercel affiche 5 restaurants

**Vérif** : `curl https://terrangafood-kouria-tasko.vercel.app/`

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + 5 cartes restaurant rendues côté serveur | HTTP 200 · `10 occurrences de "restaurant-card-body"` (2 par carte) · 5 noms confirmés dans le HTML : Chez Fatou / Le Lamantin / Dibiterie Keur Serigne / Phare des Mamelles / Tangana Café | ✅ **PASS** |

### Test 2 — Lien « Mes commandes » dans le Header

**Vérif** : grep `href="/mes-commandes"` dans le HTML d'accueil.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Lien présent dans la nav | `href="/mes-commandes">Mes commandes` trouvé | ✅ **PASS** |

### Test 3 — Page détail restaurant accessible

**Vérif** : `curl https://terrangafood-kouria-tasko.vercel.app/restaurants/6a31a57257c0f6cb5f851f4a` (Chez Fatou)

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + plats du restaurant rendus | HTTP 200 · 3+ plats détectés (Thiéboudienne, Yassa Poulet, Mafé) — le 4e a un encodage UTF-8 que le grep simple ne matche pas mais la page contient bien les 6 plats | ✅ **PASS** |

### Test 4 — Bouton « Commander ici » présent

**Vérif** : grep `btn-commander-ici` dans le HTML détail.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Bouton avec classe `btn-commander-ici` + href correct vers `/commander/<id>` | `btn-commander-ici" href="/commander/6a31a57257c0f6cb5f851f4a"` | ✅ **PASS** |

### Test 5 — Page `/commander/[id]` charge avec formulaire

**Vérif** : `curl https://terrangafood-kouria-tasko.vercel.app/commander/<id>`

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + form + checkboxes + bouton submit | HTTP 200 · `1 commande-form` · `6 type="checkbox"` (6 plats) · `1 class="btn-commander"` | ✅ **PASS** |

### Test 6 — Création de commande (POST + UI form)

**Vérif côté API** : POST sur `https://terrangafood-api.onrender.com/api/commandes` avec body simulant le formulaire.
**Vérif côté UI** : commande "gourbal" pour Phare des Mamelles déjà créée par l'utilisateur via le formulaire Vercel (avant l'exécution des tests automatisés).

| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 201 + statut « en attente » | POST curl : HTTP 201, `_id`:`6a32349926dff8ec9a1a3574` · POST UI manuel : commande "gourbal" / Phare des Mamelles / 7500 FCFA présente en base | ✅ **PASS** |

### Test 7 — Commande visible dans `/api/commandes` (persistance Atlas)

**Vérif** : `curl https://terrangafood-api.onrender.com/api/commandes`

| Attendu | Observé | Statut |
| --- | --- | --- |
| Tableau contient la commande créée, `restaurant` peuplé via populate | 3 commandes en DB : Aminata Diop / Chez Fatou / 4500 FCFA · gourbal / Phare des Mamelles / 7500 FCFA · Aminata Diop / Chez Fatou / 4500 FCFA — toutes avec statut "en attente" et populate du restaurant OK | ✅ **PASS** |

### Test 8 — Page `/mes-commandes` Vercel rend les commandes

**Vérif** : grep des champs distinctifs dans le HTML SSR.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Client, adresse, commentaire visibles | « Aminata Diop » : 1× · « Sicap Liberte 6 » : 1× · « Test prod Lab 4 » : 1× | ✅ **PASS** |

### Test 9 — Populate restaurant visible dans la carte commande

| Attendu | Observé | Statut |
| --- | --- | --- |
| Nom du restaurant ("Chez Fatou") affiché en titre de carte | `Chez Fatou : 1` dans le HTML | ✅ **PASS** |

### Test 10 — Badge de statut « en attente »

**Vérif** : grep de la classe CSS + texte.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Classe `badge-statut-attente` + texte « en attente » | `badge-statut-attente">en attente` trouvé | ✅ **PASS** |

### Test 11 — API root répond

**Vérif** : `curl https://terrangafood-api.onrender.com/`

| Attendu | Observé | Statut |
| --- | --- | --- |
| JSON d'accueil HTTP 200 listant les 3 endpoints | `{"message":"Bienvenue sur l'API TerrangaFood 🍛","version":"0.0.0","endpoints":{"restaurants":"/api/restaurants","plats":"/api/plats","commandes":"/api/commandes"}}` | ✅ **PASS** |

### Test 12 — Endpoints `/api/restaurants` et `/api/plats`

| Attendu | Observé | Statut |
| --- | --- | --- |
| `/api/restaurants` retourne 5 restos, `/api/plats` retourne 26 plats | 5 restos OK · 26 plats OK | ✅ **PASS** |

---

## ⏱️ Cold start Render (Free tier)

| Mesure | Valeur |
| --- | --- |
| Latence warm (`/api/restaurants` × 3 essais consécutifs) | **0.32 s · 0.41 s · 0.34 s** (moyenne ~0.36 s) |
| Cold start (1er fetch après 15 min d'inactivité) | **~30-60 s typique** sur Render Free — pas mesuré précisément ici car l'API a été continuellement sollicitée pendant les tests. À mesurer en conditions réelles avant la démo (cf. recommandation Tâche 5) |

> 💡 **Avant la démo** : faire un `curl https://terrangafood-api.onrender.com/` 2 min avant pour réveiller l'API et éviter le délai cold start visible par le jury.

---

## 📊 Récapitulatif

| # | Test | Statut |
| --- | --- | --- |
| 1 | Accueil 5 restaurants | ✅ |
| 2 | Lien Mes commandes header | ✅ |
| 3 | Page détail restaurant | ✅ |
| 4 | Bouton Commander ici | ✅ |
| 5 | Formulaire /commander/[id] | ✅ |
| 6 | POST commande (API + UI) | ✅ |
| 7 | Commande persistée Atlas | ✅ |
| 8 | /mes-commandes affiche commande | ✅ |
| 9 | Populate restaurant visible | ✅ |
| 10 | Badge en attente | ✅ |
| 11 | API root répond | ✅ |
| 12 | Endpoints restaurants + plats | ✅ |

**Bilan : 12 / 12 PASS — chaîne complète Vercel → Render → Atlas validée en production.**

---

## 🐛 Bugs trouvés

| # | Phase | Bug | Résolution |
| --- | --- | --- | --- |
| 1 | Render | Variable `MONGODB_URI` ajoutée mais redeploy non lancé → app utilisait une URI vide → erreur `Invalid scheme` | Manual Deploy → Deploy latest commit après chaque modif d'env var |
| 2 | Render | Connexion à Atlas refusée → `Could not connect to any servers` | Ajout de `0.0.0.0/0` dans Atlas → Network Access (l'IP de Render Free n'est pas fixe) |
| 3 | Vercel | Build OK mais `Error: No Output Directory named "public" found` | Vercel avait détecté Framework Preset = "Other" → corrigé en "Next.js" → Save → Redeploy |
| 4 | Render | Mot de passe Atlas exposé en clair dans une conversation (lab antérieur) | Régénéré côté Atlas + ré-injecté dans le `.env` local et dans Render env vars |

Aucun bug bloquant restant. Tous les flows utilisateur fonctionnent en prod.

---

## 🎯 Points d'attention pour la démo finale

1. **Réveiller l'API 2 min avant la démo** (cf. recommandation Tâche 5)
2. **Démarrer la démo sur l'URL Vercel** (https://terrangafood-kouria-tasko.vercel.app), pas en local
3. Parcours suggéré : accueil → cliquer "Chez Fatou" → cliquer "Commander ici" → cocher 2 plats → voir le total se mettre à jour → soumettre → message de succès → cliquer "Mes commandes" → voir la commande avec badge orange "en attente"
4. **Garder ouvert** un onglet `https://cloud.mongodb.com/v2/...#/clusters/databases` pour montrer la persistance Atlas (les commandes apparaissent en temps réel dans la collection `commandes`)

---

*Tests exécutés et documentés par Oumar Hamid Berdjerou (rôle QA), validés par Oumkalsoum Abdelkerim.*
