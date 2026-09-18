# BiblioQuartier — Gestion d'une bibliothèque de quartier

Projet pratique **Akieni Academy — Cohorte 2 — Semaines 14 & 15** (Module 3 : Backend Node.js, SQL & Express).

Application complète de gestion d'une bibliothèque : catalogue de livres, auteurs, utilisateurs (adhérents / bibliothécaires / administrateurs), emprunts avec détection des retards, tableau de bord statistique, et **authentification JWT**. Backend **Express + PostgreSQL**, frontend **HTML/CSS/JS** (fetch API).

## Fonctionnalités

- **Authentification JWT** : register, login, profil. Trois rôles avec accès différent (`adherent`, `bibliothecaire`, `superadmin`)
- **Utilisateurs** : gestion des comptes (superadmin), historique d'emprunts d'un utilisateur
- **Auteurs** : CRUD complet (nom, nationalité) — écriture réservée aux bibliothécaires et superadmin
- **Livres** : CRUD, statut de disponibilité, recherche par titre/auteur, pagination, filtre — écriture réservée aux bibliothécaires et superadmin
- **Emprunts** : création (refusée si livre déjà emprunté ; un adhérent ne peut emprunter que pour lui-même), retour, listes en cours / en retard
- **Tableau de bord** : totaux (livres, adhérents, en cours, en retard), livre le plus emprunté, adhérent le plus actif
- **Bonus** : notifications toast, export CSV des emprunts en retard

## Prérequis

- Node.js 18+
- PostgreSQL 14+ (serveur démarré)

## Installation

Le projet npm (dépendances, scripts) vit dans **`backend/`** — c'est aussi le
dossier de build (Docker) du backend. La racine ne contient ni `package.json`
ni `node_modules`.

```bash
# 1. Cloner le dépôt
git clone <url-du-depot>
cd akieni_academy

# 2. Installer les dépendances
cd backend
npm install

# 3. Configurer l'environnement (.env et .env.example vivent dans backend/)
copy .env.example .env
# puis ajuster DB_USER / DB_PASSWORD si besoin
# IMPORTANT : changer JWT_SECRET pour un secret de production
```

```bash
# 4. Créer la base (vide puis recrée si elle existe) et charger les données
npm run db:reset          # DROP/CREATE bibliotheque + schéma + seed démo

#   ou étape par étape :
npm run db:migrate        # schéma idempotent (backend/db/schema_prod.sql)
npm run db:seed           # seed de démonstration (backend/db/seed_demo.sql)

# 5. Démarrer le serveur (API + frontend statique)
npm start                 # ou : npm run dev (rechargement auto)
```

Ouvrir ensuite **http://localhost:3000**.

> Variables attendues dans `backend/.env` (voir `backend/.env.example`) :
> `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`,
> `JWT_SECRET`, `JWT_EXPIRES_IN`.

## Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| superadmin | `admin@biblio.fr` | `superadmin123` |
| bibliothecaire | `biblio@biblio.fr` | `biblio123` |
| adherent | `t.kabongo@mail.cd` | `adherent123` |

## Structure du projet

```
├── backend/
│   ├── server.js              # point d'entrée Express
│   ├── db.js                  # pool de connexion PostgreSQL
│   ├── package.json           # projet npm (déps, scripts start/dev/db:*)
│   ├── package-lock.json
│   ├── Dockerfile             # image Docker autonome (Build Path = backend)
│   ├── db/                    # schéma + seeds (une seule source)
│   │   ├── schema_prod.sql    # schéma idempotent (dev et prod)
│   │   ├── seed_demo.sql      # jeu de démonstration complet
│   │   └── seed_prod.sql      # 2 comptes staff seulement (prod)
│   ├── controllers/
│   │   ├── auth.controller.js   # register, login, me
│   │   ├── users.controller.js  # gestion des utilisateurs
│   │   ├── auteurs.controller.js
│   │   ├── livres.controller.js
│   │   ├── emprunts.controller.js
│   │   └── stats.controller.js
│   ├── routes/
│   │   ├── auth.routes.js       # POST /register, POST /login, GET /me
│   │   ├── users.routes.js      # CRUD utilisateurs (protégé)
│   │   ├── auteurs.routes.js
│   │   ├── livres.routes.js
│   │   ├── emprunts.routes.js
│   │   └── stats.routes.js
│   ├── middlewares/
│   │   ├── auth.js              # auth JWT + requireRole
│   │   ├── validation.js        # validation des champs
│   │   ├── logger.js            # logs des requêtes
│   │   └── errorHandler.js      # gestion centralisée des erreurs
│   ├── .env.example             # modèle de config (copié en .env)
│   └── utils/
│       └── response.js          # helpers { status, message, data }
├── frontend/
│   ├── index.html             # tableau de bord (racine, redirect après login)
│   ├── pages/                 # les autres pages HTML
│   │   ├── login.html         # connexion
│   │   ├── livres.html
│   │   ├── auteurs.html
│   │   ├── adherents.html
│   │   ├── utilisateurs.html
│   │   └── emprunts.html
│   ├── assets/
│   │   ├── css/style.css       # design system (sidebar, panels, badges, tables, modales, login)
│   │   └── js/                 # JS + endpoint API config.js (généré en prod)
│   └── docker-entrypoint.d/    # injection APP_API_URL → assets/js/config.js
├── deploy.md                   # procédure Dokploy complète
└── README.md
```

## API — endpoints

### Authentification (public)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte (rôle `adherent` par défaut) `{ nom, telephone, email, password }` |
| POST | `/api/auth/login` | Connexion `{ email, password }` → retourne `{ user, token }` |
| GET | `/api/auth/me` | Profil de l'utilisateur connecté (requiert `Authorization: Bearer <token>`) |

### Utilisateurs (protégé)

| Méthode | Rôle requis | Route | Description |
|---|---|---|---|
| GET | bibliothecaire, superadmin | `/api/users?role=&q=&page=&limit=` | Liste des utilisateurs (filtrable par rôle) |
| GET | tous authentifiés | `/api/users/:id` | Détail d'un utilisateur |
| GET | tous authentifiés | `/api/users/:id/emprunts` | Historique des emprunts d'un utilisateur (un adhérent ne voit que les siens) |
| POST | bibliothecaire, superadmin | `/api/users` | Créer un utilisateur `{ nom, email, password, role }` |
| PUT | superadmin (ou soi-même) | `/api/users/:id` | Modifier un utilisateur (nom, telephone, email, password, role) |
| DELETE | superadmin | `/api/users/:id` | Supprimer un utilisateur |

### Auteurs (protégé — écriture : bibliothecaire / superadmin)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/auteurs` | Liste des auteurs |
| GET | `/api/auteurs/:id` | Un auteur |
| POST | `/api/auteurs` | Créer un auteur `{ nom, nationalite }` |
| PUT | `/api/auteurs/:id` | Modifier un auteur |
| DELETE | `/api/auteurs/:id` | Supprimer un auteur |

### Livres (protégé — écriture : bibliothecaire / superadmin)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/livres?q=&auteur=&disponible=&page=&limit=` | Catalogue (recherche, filtre, pagination) |
| GET | `/api/livres/:id` | Un livre (+ nom de l'auteur) |
| POST | `/api/livres` | Créer un livre `{ titre, auteur_id, annee_publication }` |
| PUT | `/api/livres/:id` | Modifier un livre |
| DELETE | `/api/livres/:id` | Supprimer un livre |

### Emprunts (protégé)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/emprunts?statut=en_cours\|en_retard` | Emprunts (un adhérent ne voit que les siens) |
| POST | `/api/emprunts` | Créer un emprunt `{ user_id, livre_id, date_retour_prevue }` |
| PUT | `/api/emprunts/:id/retour` | Enregistrer le retour d'un livre |

### Statistiques & santé (protégé / public)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | État du serveur + connexion DB (public) |
| GET | `/api/stats` | Totaux, livre le plus emprunté, adhérent le plus actif (requiert auth) |

### Format des réponses

Toutes les réponses API utilisent le format :

```json
{
  "status": "success",
  "message": "Description du résultat",
  "data": { ... }
}
```

En cas d'erreur :

```json
{
  "status": "error",
  "message": "Description de l'erreur",
  "data": null
}
```

Codes HTTP utilisés : **200** succès, **201** création, **400** validation/métier, **401** non authentifié, **403** droits insuffisants, **404** introuvable, **500** serveur.

## Modélisation des données

### Choix de modélisation

- **4 tables** : `users`, `auteurs`, `livres`, `emprunts`. Pas de table d'association : un livre n'a qu'un seul auteur et un emprunt lie exactement un utilisateur à un livre.
- `users` contient tous les comptes avec un champ `role` enum (`adherent`, `bibliothecaire`, `superadmin`). Les adhérents ne sont plus une table séparée mais un rôle de la table `users`.
- `livres.auteur_id` → `auteurs.id` (`ON DELETE CASCADE`) : supprimer un auteur retire ses livres.
- `emprunts.user_id` / `emprunts.livre_id` (`ON DELETE CASCADE`) : l'historique suit la suppression d'un utilisateur ou d'un livre.
- `livres.disponible` (booléen) : dénormalisation volontaire pour afficher le statut sans jointure ; synchronisé par le backend à la création d'un emprunt (`FALSE`) et au retour (`TRUE`).
- Cycle de vie d'un emprunt : `date_retour_effective IS NULL` = en cours ; `date_retour_effective IS NULL AND date_retour_prevue < NOW()` = en retard.
- Index sur `livres(titre)`, `livres(auteur_id)`, `livres(disponible)`, `users(email)` et les clés étrangères.

### Diagramme entité-relation

```mermaid
erDiagram
    USERS ||--o{ EMPRUNTS : "effectue"
    AUTEURS ||--o{ LIVRES : "écrit"
    LIVRES ||--o{ EMPRUNTS : "concerné par"

    USERS {
        int id PK
        varchar nom
        varchar telephone
        varchar email UK
        varchar password
        user_role role
        timestamp created_at
    }
    AUTEURS {
        int id PK
        varchar nom
        varchar nationalite
        timestamp created_at
    }
    LIVRES {
        int id PK
        varchar titre
        int auteur_id FK
        int annee_publication
        boolean disponible
        timestamp created_at
    }
    EMPRUNTS {
        int id PK
        int user_id FK
        int livre_id FK
        timestamp date_emprunt
        timestamp date_retour_prevue
        timestamp date_retour_effective
        timestamp created_at
    }
```

### Rôles et permissions

| Action | adherent | bibliothecaire | superadmin |
|---|:---:|:---:|:---:|
| Voir catalogue (livres, auteurs) | ✅ | ✅ | ✅ |
| Consulter son historique d'emprunts | ✅ | ✅ | ✅ |
| Créer un emprunt (pour soi-même) | ✅ | ✅ | ✅ |
| Retourner un emprunt (le sien) | ✅ | ✅ | ✅ |
| CRUD auteurs | ❌ | ✅ | ✅ |
| CRUD livres | ❌ | ✅ | ✅ |
| Créer/modifier adhérents | ❌ | ✅ | ✅ |
| Lister tous les emprunts | ❌ | ✅ | ✅ |
| Gérer les comptes (rôles) | ❌ | ❌ | ✅ |
| Supprimer un utilisateur | ❌ | ❌ | ✅ |

### Règles métier implémentées

1. Un emprunt est refusé (400) si le livre est déjà marqué `emprunté`.
2. Un adhérent ne peut emprunter que pour lui-même.
3. À la création d'un emprunt, le livre passe automatiquement à `emprunté`.
4. Au retour, `date_retour_effective` est posée et le livre redevient `disponible` ; un second retour est refusé (400).
5. Retard = retour prévu dépassé et livre non rendu.
6. Statistiques calculées en SQL : totaux, `COUNT + GROUP BY + ORDER BY + LIMIT 1` pour le livre le plus emprunté et l'adhérent le plus actif.
7. Requêtes SQL paramétrées (`$1, $2…`) contre les injections ; validation des champs côté middleware + côté interface.
8. Authentification JWT avec token transmis en header `Authorization: Bearer <token>`, vérifié à chaque requête protégée.

## Déploiement (Dokploy)

Le projet se déploie en deux applications Dokploy (frontend nginx + backend
Express) plus un service PostgreSQL géré par Dokploy — voir
[deploy.md](deploy.md) pour la procédure complète, les variables
d'environnement et le dépannage.

## Améliorations futures

- Réservation d'un livre déjà emprunté (file d'attente)
- Pagination côté adhérents/emprunts