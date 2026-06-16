# 👥 Contributeurs — Équipe Kouria Tasko

Projet : **TerrangaFood** (Lab 0 — Architecture Logicielle 2)
Établissement : ESTM — L3 Génie Logiciel
Année universitaire : 2025 — 2026

---

## Membres de l'équipe

| Membre | Rôle(s) attribué(s) | GitHub | Périmètre principal |
| --- | --- | --- | --- |
| **Oumar Hamid Berdjerou** | CP · DO · DB | [@oberdjerou](https://github.com/oberdjerou) | Coordination, configuration de l'environnement (MongoDB Atlas, `.env`, scripts), exploration du backend Express dans `api/src/` |
| **Oumkalsoum Abdelkerim** | DF · QA | [@oumkalsoum](https://github.com/oumkalsoum) | Exploration du frontend Next.js dans `web/`, tests fonctionnels des endpoints et de l'interface, rédaction d'`EXPLORATION.md` |

---

## Légende des rôles

- **CP** — Chef de Projet : coordonne, gère le repo, fusionne les Pull Requests, pose les tags.
- **DB** — Développeur Backend : explore et documente l'API Express (`api/src/`).
- **DF** — Développeur Frontend : explore et documente l'interface Next.js (`web/`).
- **DO** — DevOps : configure l'environnement, gère les variables, vérifie le lancement.
- **QA** — Qualité / Test : valide manuellement le bon fonctionnement bout en bout et rédige le rapport.

## Justification de la répartition à deux

Le Lab original prévoit 5 rôles pour une équipe de 5. Notre binôme s'est partagé les responsabilités selon un découpage **back/infra** vs **front/test** :
- Oumar cumule **CP + DO + DB** car ces trois rôles touchent au pilotage et à la couche serveur/données (cohérence forte entre coordination, configuration et code backend).
- Oumkalsoum cumule **DF + QA** car la couche présentation et la validation fonctionnelle sont intimement liées (tester l'UI = exercer le frontend).

Cette répartition garantit que chaque PR ouverte porte sur un domaine isolé, ce qui limite les conflits de merge non pédagogiques et clarifie les revues.

---

*Document maintenu par le CP — dernière mise à jour : 2026-06-16*
