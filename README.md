# TaskFlow v2.0 — Vue 3 + Vite

Application de gestion de tâches Kanban construite avec Vue 3 (Composition API) et Vite.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## 📁 Structure du projet

```
taskflow-vue/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js
    ├── App.vue                        # Composant racine
    ├── assets/
    │   └── main.css                   # Styles globaux + variables CSS
    ├── composables/
    │   ├── useToast.js                # Système de notifications
    │   └── useTasks.js                # Logique métier (tâches, colonnes)
    └── components/
        ├── ToastContainer.vue         # Notifications toast
        ├── AuthView.vue               # Écran de connexion / inscription
        ├── AppHeader.vue              # Barre de navigation principale
        ├── AppSidebar.vue             # Menu latéral
        ├── StatsBar.vue               # Barre de statistiques
        ├── BoardControls.vue          # Recherche + filtres + bouton
        ├── KanbanBoard.vue            # Vue tableau Kanban (drag & drop)
        ├── ListView.vue               # Vue liste des tâches
        ├── CalendarView.vue           # Vue calendrier (Premium)
        ├── TaskModal.vue              # Modal création / édition de tâche
        └── PremiumModal.vue           # Modal offre Premium
```

## ✨ Fonctionnalités

- 🔐 Authentification (inscription / connexion, localStorage)
- 📋 Tableau Kanban avec drag & drop
- 📝 Vue liste et vue calendrier (Premium)
- ✅ Checklist par tâche
- 🔔 Système de rappels
- 🏷️ Étiquettes et priorités
- 📊 Statistiques en temps réel
- 💾 Persistance des données (localStorage par utilisateur)
- 👑 Mode Premium déverrouillable

## 🛠️ Technologies

- **Vue 3** — Composition API + `<script setup>`
- **Vite** — Build tool ultra-rapide
- **CSS Variables** — Thème sombre cohérent
- **localStorage** — Persistance sans backend
