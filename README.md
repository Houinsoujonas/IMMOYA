# IMMOYA

Plateforme immobilière premium — projet de portfolio.

Frontend en HTML/CSS/Tailwind/JavaScript vanilla, backend Node.js (Express). Deux
sources de biens : un catalogue éditorial local (IMMOYA, FCFA) et un catalogue
partenaire en lecture seule alimenté en direct par l'API réelle **Untera**
(agrégateur immobilier international).

## Fonctionnalités

**Public**
- Accueil, catalogue filtrable (`/biens`, avec un onglet "Biens partenaires" alimenté
  par Untera), recherche avancée (`/recherche`), fiche détail avec galerie
  (`/biens/:id` simulé par `property.html?id=...`), favoris via `localStorage`
  (`/favoris`), à propos, contact.
- Formulaires "Contacter" et "Demander une visite" envoyés au backend, avec
  protection anti-spam (honeypot) et limitation de débit.
- Photos honnêtes : un bien sans photo réelle affiche une icône de remplacement,
  jamais une image générique faisant croire qu'elle représente le bien.

**Admin** (`/admin`, jamais lié depuis le site public — accès direct par URL)
- Dashboard avec statistiques réelles (répartition par type, dernières demandes),
  gestion des biens IMMOYA (ajout/modification/suppression avec confirmation),
  gestion des demandes et visites (changement de statut), paramètres.
- Authentification par mot de passe haché (bcrypt), protection CSRF sur toutes les
  actions qui modifient des données, limitation des tentatives de connexion.

## Lancer le projet en local

```bash
npm install
npm run build:css
npm start
```

Puis ouvrir http://localhost:4000 (redirige vers la homepage). Le backend sert à la
fois l'API (`/api/*`) et les fichiers statiques (`pages/`, `src/`, `public/`).

Pendant le développement du CSS (dans un second terminal) :

```bash
npm run watch:css
```

## Variables d'environnement (`.env`)

```env
UNTERA_API_KEY=          # clé fournie par Untera
UNTERA_BASE_URL=https://api.untera.io/api/v1
PORT=4000
ADMIN_PASSWORD_HASH=     # hash bcrypt, jamais le mot de passe en clair
```

Génère un hash bcrypt avec :

```bash
node -e "console.log(require('bcryptjs').hashSync('ton-mot-de-passe', 10))"
```

`.env` n'est jamais versionné (voir `.gitignore`). Copier `.env.example` pour démarrer.

### Intégration Untera

`backend/services/untera.service.js` appelle réellement l'API Untera (recherche de
biens, détail d'un bien, scores de marché par pays), normalise chaque annonce vers le
même modèle que les biens IMMOYA locaux, et met en cache les réponses 5 minutes. Les
biens Untera sont strictement en lecture seule (non gérables depuis l'admin) et
toujours affichés avec leur source et un lien vers l'annonce d'origine. Si Untera est
injoignable, les endpoints publics renvoient une erreur maîtrisée sans casser le reste
du site.

## Identifiants admin par défaut

Mot de passe : `immoya-admin-2026` (correspond au hash fourni dans `.env`). À changer
avant toute mise en ligne réelle en générant un nouveau hash bcrypt.
