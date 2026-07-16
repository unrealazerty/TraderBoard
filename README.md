# TraderBoard

Dashboard complet de trading pour suivre, analyser et gérer vos transactions financières avec des outils de visualisation avancés et une gestion des risques intégrée.

## 🎯 Fonctionnalités principales

- **📊 Tableau de bord** - Vue d'ensemble synthétique de vos performances et statistiques
- **📈 Analytique avancée** - Graphiques détaillés et métriques de trading en temps réel
- **📅 Calendrier de trading** - Planification et suivi de vos opérations
- **📝 Journal de trading** - Documentation complète de chaque trade avec annotations
- **📋 Liste de surveillance** - Suivi des actifs et alertes personnalisées
- **⚠️ Gestion des risques** - Outils de calcul et monitoring des risques
- **📥 Import de données** - Importez vos données de trading facilement
- **👤 Profil & Paramètres** - Configuration personnalisée de votre compte
- **🔐 Authentification** - Connexion sécurisée avec récupération de mot de passe

## 🛠️ Stack technologique

### Frontend
- **Framework**: React 19 + TypeScript
- **Routage**: TanStack Router avec SSR (TanStack Start)
- **UI Components**: Radix UI (complet : accordion, dialog, menu, dropdown, etc.)
- **Styles**: Tailwind CSS 4 + CSS Tailwind animations
- **Formes**: React Hook Form + Zod pour validation
- **État/Requêtes**: TanStack Query (React Query)
- **Graphiques**: Recharts pour visualisation des données
- **Icônes**: Lucide React
- **Notifications**: Sonner pour toast notifications
- **Autres**: Embla Carousel, date-fns, cmdk

### Outils de développement
- **Build**: Vite 8 + Bun (package manager)
- **Serveur**: Nitro (Cloudflare Workers par défaut)
- **Linting**: ESLint 9 + Prettier
- **TypeScript**: 5.8

## 📁 Structure du projet

```
TraderBoard/
├── src/
│   ├── routes/              Routes et pages (TanStack Router)
│   │   ├── __root.tsx       Layout racine
│   │   ├── auth.*.tsx       Pages d'authentification (login, register, forgot)
│   │   ├── _app.*.tsx       Pages de l'application (dashboard, journal, etc.)
│   │   └── index.tsx        Page d'accueil
│   ├── components/
│   │   ├── ui/              Composants Radix UI réutilisables
│   │   └── app/             Composants métier spécifiques
│   ├── lib/                 Utilitaires et helpers
│   ├── styles.css           Styles globaux
│   ├── router.tsx           Configuration du router
│   ├── server.ts            Configuration du serveur (SSR)
│   └── start.ts             Point d'entrée
├── package.json             Dépendances et scripts
├── vite.config.ts           Configuration Vite
├── tsconfig.json            Configuration TypeScript
└── eslint.config.js         Configuration ESLint
```

## 🚀 Démarrage rapide

### Prérequis
- **Node.js**: 18+ ou **Bun** (recommandé)
- **Package manager**: npm, yarn, pnpm ou Bun

### Installation

```bash
# Cloner le repository
git clone https://github.com/unrealazerty/TraderBoard.git
cd TraderBoard

# Installer les dépendances
bun install
# ou: npm install / yarn install / pnpm install
```

### Développement

```bash
# Démarrer le serveur de développement
bun run dev
# ou: npm run dev

# L'application sera disponible à http://localhost:5173
```

### Build

```bash
# Construire pour la production
bun run build
# ou: npm run build

# Prévisualiser le build
bun run preview
```

### Qualité du code

```bash
# Linter le code
bun run lint

# Formater le code
bun run format
```

## 📋 Pages principales

| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/` | Page de bienvenue |
| Tableau de bord | `/dashboard` | Vue d'ensemble des performances |
| Analytique | `/analytics` | Graphiques et statistiques détaillées |
| Calendrier | `/calendar` | Visualisation calendrier des trades |
| Journal | `/journal` | Documentation complète des transactions |
| Liste de surveillance | `/watchlist` | Suivi des actifs intéressants |
| Risques | `/risk` | Analyse et monitoring des risques |
| Import | `/import` | Importation de données |
| Profil | `/profile` | Paramètres du compte utilisateur |
| Paramètres | `/settings` | Configuration de l'application |
| Connexion | `/auth/login` | Page de login |
| Inscription | `/auth/register` | Page de création de compte |

## 🔧 Configuration

### Bun (`bunfig.toml`)
Le projet est optimisé pour Bun avec une configuration spécifique pour les performances et la compatibilité.

### Composants UI (`components.json`)
Utilise Shadcn/ui avec Radix UI comme base pour les composants.

## 📦 Dépendances principales

- **@tanstack/react-query**: Gestion de l'état serveur
- **@tanstack/react-router**: Routage côté client/serveur
- **@radix-ui/\***: Composants d'interface utilisateur sans style
- **recharts**: Bibliothèque de graphiques React
- **zod**: Validation de schémas TypeScript
- **react-hook-form**: Gestion des formulaires
- **tailwindcss**: Framework CSS utilitaire

## 🎨 Style et Thème

Le projet utilise **Tailwind CSS 4** avec des utilitaires animations personnalisés (`tw-animate-css`). Les composants Radix UI sont stylérisés via Tailwind pour une cohérence visuelle.

## 🚀 Déploiement

L'application est prête pour déploiement sur **Cloudflare Workers** (configuration Nitro par défaut). Vous pouvez adapter la configuration dans `vite.config.ts` pour d'autres cibles (Node.js, Vercel, etc.).

## 📝 Scripts disponibles

```json
{
  "dev": "Démarrer le serveur de développement Vite",
  "build": "Build production optimisé",
  "build:dev": "Build en mode développement",
  "preview": "Prévisualiser le build local",
  "lint": "Vérifier le code avec ESLint",
  "format": "Formater le code avec Prettier"
}
```

## 💡 Architecture

**TraderBoard** suit une architecture moderne avec :
- **Frontend isomorphe**: Code React côté client et serveur (SSR via TanStack Start)
- **Séparation UI/Métier**: Composants Radix UI réutilisables dans `ui/`, logique métier dans `app/`
- **Validation stricte**: TypeScript + Zod pour la sécurité des types
- **État réactif**: React Query pour la synchronisation serveur/client

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est disponible sous licence [À spécifier - ajouter LICENCE.md si nécessaire]

## 📞 Support & Questions

Pour toute question ou problème :
- Ouvrez une [issue](https://github.com/unrealazerty/TraderBoard/issues)
- Consultez la [documentation React](https://react.dev)
- Consultez la [documentation TanStack Router](https://tanstack.com/router)

---

**Développé avec ❤️ par unrealazerty**
