# TODO - Gestion des Projets PrismFlow

## 📋 Phase 1: Page de Détails du Projet ✅
- [x] Créer la page `/projects/:id` avec route et navigation
- [x] Afficher les informations du projet (nom, description, icône, couleur)
- [x] Afficher les statistiques du projet (nombre de tâches, membres, progression)
- [x] Créer un layout avec sections (Overview, Tasks, Members, Activity)
- [x] Ajouter des actions rapides (Edit, Archive, Delete)
- [x] Implémenter le breadcrumb de navigation
- [x] Appliquer le système de thème à toute la page
- [x] Fix backend: Ajouter memberCount et taskCount aux projets
- [x] Fix backend: Retourner les données user complètes dans getMembers
- [x] Fix frontend: Afficher les photos de profil des membres

## 👥 Phase 2: Gestion des Membres du Projet (EN COURS)
- [x] Créer le composant de liste des membres
- [x] Afficher les membres avec leurs rôles et avatars
- [x] Afficher la photo de profil si disponible
- [ ] Créer un modal pour ajouter des membres
- [ ] Implémenter la recherche d'utilisateurs à ajouter
- [ ] Permettre de modifier le rôle d'un membre (owner, member, viewer)
- [ ] Permettre de retirer un membre du projet
- [ ] Ajouter les permissions (seul owner peut gérer les membres)
- [ ] Afficher les statistiques par membre (tâches assignées, complétées)

## ✅ Phase 3: Gestion des Tâches
- [ ] Créer le modèle de données pour les tâches (si pas déjà fait)
- [ ] Créer l'interface de liste des tâches
- [ ] Créer le modal de création/édition de tâche
- [ ] Implémenter les champs: titre, description, priorité, statut, assigné à
- [ ] Ajouter la gestion des dates d'échéance
- [ ] Créer le système d'étiquettes/tags
- [ ] Implémenter les filtres (statut, priorité, assigné, tags)
- [ ] Ajouter la recherche dans les tâches
- [ ] Créer la vue détaillée d'une tâche
- [ ] Implémenter les commentaires sur les tâches
- [ ] Ajouter les sous-tâches/checklist

## 📊 Phase 4: Boards (Kanban/Scrum/List)
- [ ] Créer la page Board pour chaque projet
- [ ] Implémenter la vue Kanban avec colonnes
  - [ ] Créer les colonnes par défaut selon le template
  - [ ] Permettre d'ajouter/modifier/supprimer des colonnes
  - [ ] Implémenter le drag & drop des tâches
  - [ ] Afficher les tâches dans les colonnes
- [ ] Implémenter la vue List
  - [ ] Afficher les tâches en liste triable
  - [ ] Grouper par statut, priorité, ou assigné
  - [ ] Permettre l'édition inline
- [ ] Implémenter la vue Scrum
  - [ ] Afficher le sprint actif
  - [ ] Afficher le backlog
  - [ ] Permettre de déplacer les tâches du backlog au sprint
- [ ] Ajouter les actions rapides sur les tâches (éditer, supprimer, changer statut)
- [ ] Synchroniser les changements en temps réel

## 🏃 Phase 5: Sprints (pour Scrum)
- [ ] Créer le modèle de données pour les sprints
- [ ] Créer l'interface de gestion des sprints
- [ ] Permettre de créer un nouveau sprint (dates de début/fin)
- [ ] Permettre d'ajouter des tâches au sprint (Sprint Planning)
- [ ] Afficher le sprint actif dans le board
- [ ] Créer la vue Sprint Backlog
- [ ] Implémenter le burndown chart
- [ ] Permettre de clôturer un sprint
- [ ] Créer la page Sprint Retrospective

## 📈 Phase 6: Rapports et Analytics
- [ ] Créer la page Rapports pour chaque projet
- [ ] Afficher la progression globale du projet
- [ ] Créer des graphiques:
  - [ ] Tâches par statut (pie chart)
  - [ ] Tâches par priorité
  - [ ] Tâches par membre
  - [ ] Timeline de complétion
  - [ ] Vélocité (pour Scrum)
- [ ] Afficher le temps estimé vs temps réel
- [ ] Créer des rapports exportables (PDF/CSV)
- [ ] Ajouter des filtres de période

## 🔔 Phase 7: Notifications et Activité
- [ ] Créer le système de notifications backend
- [ ] Afficher le feed d'activité du projet
- [ ] Envoyer des notifications pour:
  - [ ] Nouvelle tâche assignée
  - [ ] Tâche complétée
  - [ ] Commentaire sur une tâche
  - [ ] Membre ajouté/retiré
  - [ ] Date d'échéance proche
- [ ] Créer le composant de notifications header
- [ ] Permettre de marquer les notifications comme lues
- [ ] Implémenter les mentions (@utilisateur) dans les commentaires

## 🎨 Phase 8: Améliorations UI/UX
- [ ] Ajouter des animations et transitions fluides
- [ ] Améliorer la responsive design sur mobile
- [ ] Ajouter des tooltips explicatifs
- [ ] Créer des vues vides avec appels à l'action
- [ ] Ajouter des raccourcis clavier
- [ ] Améliorer l'accessibilité (ARIA labels, navigation au clavier)
- [ ] Ajouter un mode de présentation (fullscreen boards)

## 🔧 Phase 9: Fonctionnalités Avancées
- [ ] Implémenter les templates de projet personnalisés
- [ ] Ajouter la duplication de projet
- [ ] Créer un système de favoris/épinglés
- [ ] Permettre l'import/export de projets
- [ ] Ajouter des webhooks pour intégrations externes
- [ ] Créer une API publique
- [ ] Implémenter la recherche globale (tous les projets)

## 🧪 Phase 10: Tests et Optimisation
- [ ] Écrire des tests unitaires pour les composants
- [ ] Écrire des tests d'intégration
- [ ] Optimiser les performances (lazy loading, virtualization)
- [ ] Optimiser les requêtes API (pagination, cache)
- [ ] Améliorer le SEO
- [ ] Audit de sécurité
- [ ] Tests de charge

---

## 🚀 Prochaine Étape
**Commencer par Phase 1: Page de Détails du Projet**

## 📝 Notes
- Appliquer le système de thème à tous les nouveaux composants
- Maintenir l'i18n (FR/EN) pour tous les textes
- Suivre les patterns existants du codebase
- Documenter les fonctionnalités complexes