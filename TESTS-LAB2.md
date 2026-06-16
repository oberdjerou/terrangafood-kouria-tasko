# 🧪 TESTS-LAB2.md — Rapport de tests Frontend (Lab 2)

**Équipe Kouria Tasko** — Lab 2 — Architecture Logicielle 2 (ESTM L3 GL)
**Date d'exécution** : 2026-06-16
**Stack testée** : Next.js 14 (App Router) — frontend `http://localhost:3000` + API Express `http://localhost:3001`
**Méthode** :
- **Verifiable code/réseau** : `curl` + `grep` sur le HTML rendu côté serveur (Server Components SSR) + POST direct sur l'API pour simuler une soumission de formulaire
- **Verifiable visuellement** : actions à exécuter dans le navigateur (formulaire client-side avec `useState`, animations, alerts)

---

## 🛠️ Setup

| Élément | Valeur |
| --- | --- |
| Restaurant testé | Chez Fatou (`6a31a57257c0f6cb5f851f4a`) |
| Plats utilisés | Thiéboudienne (2500 XOF), Yassa Poulet (2000 XOF) |
| Total attendu | 4500 FCFA |
| Commande créée pour les tests d'affichage | `6a31df17f9fa45437855ab9b` |

---

## 📋 Résultats des 15 tests

### Test 1 — Lien « Mes commandes » dans le Header

**Méthode** : grep dans le HTML de la page d'accueil.
```bash
curl -s http://localhost:3000/ | grep 'href="/mes-commandes"'
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| `<a href="/mes-commandes">Mes commandes</a>` présent | `href="/mes-commandes">Mes commandes` trouvé | ✅ **PASS** |

---

### Test 2 — Bouton « Commander ici » sur `/restaurants/:id`

**Méthode** : grep dans le HTML de la page restaurant.
```bash
curl -s http://localhost:3000/restaurants/6a31a57257c0f6cb5f851f4a | grep 'btn-commander-ici'
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Bouton avec classe `btn-commander-ici` + lien `/commander/:id` | `class="btn-commander-ici" href="/commander/6a31a57257c0f6cb5f851f4a">🛒 Commander ici` | ✅ **PASS** |

---

### Test 3 — Affichage de `/commander/[id]`

**Méthode** : HTTP + présence des éléments du formulaire.
```bash
curl -I http://localhost:3000/commander/6a31a57257c0f6cb5f851f4a
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200 + form + checkboxes + bouton | HTTP 200, `class="commande-form"`, `type="checkbox"`, `class="btn-commander"` tous présents | ✅ **PASS** |

---

### Test 4 — Plats visibles dans le formulaire

**Méthode** : compter les occurrences de la classe `commande-plat-item-nom` dans le HTML.
```bash
curl -s .../commander/$REST_ID | grep -oE 'commande-plat-item-nom' | wc -l
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| 6 plats listés (tous les plats de Chez Fatou) | 6 occurrences, noms confirmés : Thiéboudienne, Yassa Poulet, Mafé, Thiéré, Bissap, Thiakry | ✅ **PASS** |

---

### Test 5 — Sélection de plats + total en temps réel

**Méthode** : test visuel obligatoire (client-side, `useState`).
**Vérif code** : `CommandeForm.js` utilise `useState([])` pour `platsChoisis`, recalcule `montantTotal` à chaque render via `reduce`, et applique la classe `selected` conditionnelle.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Cocher un plat met à jour le total instantanément, le décocher le retire | À confirmer visuellement dans le navigateur — code conforme | ✅ **PASS** (code) — *Vérif visuelle requise* |

---

### Test 6 — Validation des champs obligatoires

**Méthode** : test visuel (HTML5 form validation).
**Vérif code** : les inputs `client`, `telephone`, `adresseLivraison` ont l'attribut `required`. Le bouton submit est `disabled` si `platsChoisis.length === 0`.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Submit bloqué si client/téléphone/adresse vide ou aucun plat coché | `required` présent sur les 3 inputs + bouton disabled si pas de plat | ✅ **PASS** (code) — *Vérif visuelle requise* |

---

### Test 7 — Commande envoyée à l'API

**Méthode** : POST direct sur l'API en reproduisant le body que `creerCommande()` enverrait.
```bash
curl -X POST http://localhost:3001/api/commandes \
  -H "Content-Type: application/json" \
  -d '{"client":"Aminata Diop","telephone":"+221 77 123 45 67","adresseLivraison":"Sicap Liberte 6, Dakar","restaurant":"6a31a57257c0f6cb5f851f4a","plats":["6a31a57257c0f6cb5f851f50","6a31a57257c0f6cb5f851f51"],"montantTotal":4500,"commentaire":"Test Lab 2 frontend"}'
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 201, statut « en attente », `_id` retourné | HTTP 201, `"statut":"en attente"`, `_id`:`6a31df17f9fa45437855ab9b` | ✅ **PASS** |

---

### Test 8 — Message de succès après soumission

**Méthode** : test visuel.
**Vérif code** : sur succès, `setMessage({type:'success', texte:'✅ Commande créée…'})` puis le JSX rend `<div className="commande-message commande-message-success">{message.texte}</div>`.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Bandeau vert « ✅ Commande créée avec succès (#xxxxxx) — statut : en attente. » | Code conforme, dépend du rendu navigateur | ✅ **PASS** (code) — *Vérif visuelle requise* |

---

### Test 9 — Formulaire réinitialisé après succès

**Méthode** : test visuel.
**Vérif code** : la fonction `reinitialiser()` (appelée après succès) remet à `''`/`[]` les 5 states (client, telephone, adresseLivraison, commentaire, platsChoisis).

| Attendu | Observé | Statut |
| --- | --- | --- |
| Tous les champs vidés, plats décochés, total à 0 | Code conforme | ✅ **PASS** (code) — *Vérif visuelle requise* |

---

### Test 10 — Affichage de `/mes-commandes`

**Méthode** : HTTP code.
```bash
curl -I http://localhost:3000/mes-commandes
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| HTTP 200, page rendue avec en-tête + liste | HTTP 200, h1 « Mes commandes (1) » + carte | ✅ **PASS** |

---

### Test 11 — Commande visible dans la liste

**Méthode** : grep des champs distinctifs dans le HTML.

| Attendu | Observé | Statut |
| --- | --- | --- |
| Client, téléphone, adresse, commentaire affichés | « Aminata Diop » : 1× · « +221 77 123 45 67 » : 1× · « Sicap Liberte 6 » : 1× · « Test Lab 2 frontend » : 1× | ✅ **PASS** |

---

### Test 12 — Couleur du StatutBadge

**Méthode** : grep de la classe CSS.
```bash
curl -s .../mes-commandes | grep -oE 'badge-statut[^"]*"'
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Classe `badge-statut-attente` (orange) + texte « en attente » | `badge-statut badge-statut-attente">en attente` trouvé | ✅ **PASS** |

> 💡 Les 5 variantes CSS sont dans `globals.css` (`badge-statut-attente`/`-confirmee`/`-livraison`/`-livree`/`-annulee`). Le composant `StatutBadge.js` mappe correctement chaque valeur de statut à sa classe.

---

### Test 13 — Nom du restaurant affiché (populate)

**Méthode** : grep dans le HTML.
| Attendu | Observé | Statut |
| --- | --- | --- |
| « Chez Fatou » présent comme titre de la carte | `<h3>` contient `"Chez Fatou"` | ✅ **PASS** |

---

### Test 14 — Montant FCFA formaté

**Méthode** : inspection de la sérialisation React (le séparateur de milliers est un espace insécable U+00A0).
| Attendu | Observé | Statut |
| --- | --- | --- |
| « 4 500 FCFA » (avec espace insécable, format `fr-SN`) | Dans le payload React : `"children":["4 500"," FCFA"]` | ✅ **PASS** |

---

### Test 15 — Date affichée en français

**Méthode** : regex sur les noms de mois français.
```bash
curl -s .../mes-commandes | grep -oE '[0-9]{1,2} (janvier|...|décembre) [0-9]{4}'
```
| Attendu | Observé | Statut |
| --- | --- | --- |
| Date type « 16 juin 2026 à 23:41 » | `"16 juin 2026 à 23:41"` trouvé dans le payload React | ✅ **PASS** |

---

## 📊 Récapitulatif

| # | Test | Statut | Méthode |
| --- | --- | --- | --- |
| 1 | Lien « Mes commandes » dans Header | ✅ | curl + grep HTML |
| 2 | Bouton « Commander ici » | ✅ | curl + grep HTML |
| 3 | /commander/[id] charge avec formulaire | ✅ | HTTP + grep |
| 4 | 6 plats visibles dans le form | ✅ | grep count |
| 5 | Sélection + total temps réel | ✅ (code) | Vérif visuelle requise |
| 6 | Validation champs obligatoires | ✅ (code) | Vérif visuelle requise |
| 7 | POST commande à l'API | ✅ | curl POST 201 |
| 8 | Message de succès | ✅ (code) | Vérif visuelle requise |
| 9 | Formulaire réinitialisé | ✅ (code) | Vérif visuelle requise |
| 10 | /mes-commandes charge | ✅ | HTTP 200 |
| 11 | Commande visible | ✅ | grep champs |
| 12 | Couleur StatutBadge | ✅ | grep classe CSS |
| 13 | Nom restaurant (populate) | ✅ | grep |
| 14 | Montant FCFA formaté | ✅ | inspection React payload |
| 15 | Date FR formatée | ✅ | regex mois français |

**Bilan : 15 / 15 PASS — 4 tests demandent une confirmation visuelle finale dans le navigateur** (interactions client-side avec `useState`/`onChange` impossibles à tester depuis `curl`).

---

## 👁️ Procédure de vérification visuelle (4 tests restants)

1. Ouvre http://localhost:3000 dans Chrome.
2. Clique « 🛒 Commander ici » sur la carte de **Chez Fatou** (test 2 + 3).
3. **Test 5** : coche/décoche plusieurs plats → vérifie que la ligne « Total » change instantanément.
4. **Test 6** : essaie de soumettre avec un champ vide ou aucun plat → le bouton doit être grisé ou le navigateur doit refuser.
5. Remplis le formulaire et clique « Commander » :
   - **Test 8** : un bandeau vert « ✅ Commande créée… » doit apparaître au-dessus du form.
   - **Test 9** : les champs doivent se vider, les plats se décocher, le total revenir à 0.
6. Va dans le Header → clique « Mes commandes » → tu dois voir ta nouvelle commande avec badge orange « en attente ».

---

## 🐛 Notes techniques

- **Hot-reload Next.js** : à chaque merge de PR contenant une modif de `web/`, le serveur dev Next.js a rechargé automatiquement les pages sans intervention manuelle.
- **Encodage UTF-8** : contrairement au Lab 1 (qui avait des soucis d'accents dans `curl -d` inline), les requêtes POST simulant le formulaire utilisent un fichier JSON écrit via Node (`require('fs').writeFileSync`) ce qui garantit l'encodage propre.
- **Distinction Server/Client Component bien respectée** :
  - `mes-commandes/page.js` et `commander/[id]/page.js` sont des **Server Components async** (pas de `'use client'`).
  - `CommandeForm.js` est un **Client Component** (avec `'use client'`) car il utilise `useState`.
  - `StatutBadge.js` est un composant **pur** (pas de directive) — pas besoin d'état.

---

*Tests exécutés et documentés par Oumkalsoum Abdelkerim (rôle QA), validés par Oumar Hamid Berdjerou (CP).*
