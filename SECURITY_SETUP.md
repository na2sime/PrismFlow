# Security Setup Guide - PrismFlow

Ce guide vous aide à configurer PrismFlow de manière sécurisée.

## 🔐 Configuration Obligatoire

### 1. Génération des Secrets JWT

**IMPORTANT:** L'application ne démarrera PAS sans ces secrets configurés.

```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Générer JWT_REFRESH_SECRET (utilisez une commande différente)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez ces secrets dans votre fichier `.env` :

```env
JWT_SECRET=votre_secret_généré_ici
JWT_REFRESH_SECRET=votre_autre_secret_généré_ici
```

### 2. Configuration CORS

Configurez l'URL de votre client pour éviter les problèmes CORS :

```env
CLIENT_URL=https://votre-domaine.com
```

En développement :
```env
CLIENT_URL=http://localhost:3000
```

## 🛡️ Protection CSRF (Automatique)

La protection CSRF est automatiquement activée sur toutes les routes protégées.

### Comment ça fonctionne

1. **Cookie CSRF** : Le serveur envoie un cookie `XSRF-TOKEN`
2. **Header** : Le client doit renvoyer ce token dans le header `x-csrf-token`
3. **Validation** : Le serveur vérifie que les deux correspondent

Le service API client gère automatiquement cela - aucune action requise !

### Routes exemptées

Ces routes ne nécessitent PAS de token CSRF :
- `/api/setup/*` - Configuration initiale
- `/api/auth/login` - Connexion
- `/api/auth/register` - Inscription
- `/api/auth/refresh` - Rafraîchissement de token
- Toutes les requêtes GET

## 🔒 Checklist de Sécurité

### Avant le Déploiement

- [ ] ✅ JWT_SECRET et JWT_REFRESH_SECRET générés et configurés
- [ ] ✅ CLIENT_URL configuré pour votre domaine
- [ ] ✅ NODE_ENV=production dans votre environnement de production
- [ ] ✅ HTTPS activé (obligatoire pour les cookies sécurisés)
- [ ] ✅ Mots de passe email configurés (si utilisation des emails)
- [ ] ⚠️ Firewall configuré pour bloquer l'accès direct à SQLite
- [ ] ⚠️ Backups automatiques de la base de données configurés

### Configuration Production Recommandée

```env
# Production
NODE_ENV=production
PORT=5001

# JWT (OBLIGATOIRE)
JWT_SECRET=<votre-secret-64-caracteres>
JWT_REFRESH_SECRET=<votre-autre-secret-64-caracteres>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CLIENT_URL=https://votre-domaine.com

# Application
APP_URL=https://votre-domaine.com

# Email (optionnel mais recommandé)
EMAIL_ENABLED=true
EMAIL_HOST=smtp.votre-provider.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=votre-email@example.com
EMAIL_PASS=votre-mot-de-passe-app
EMAIL_FROM=noreply@votre-domaine.com
```

## 🚨 Erreurs Courantes

### Erreur: "JWT_SECRET must be set"

**Cause:** Le fichier `.env` n'est pas configuré ou JWT_SECRET est vide

**Solution:**
```bash
cd app/server
cp .env.example .env
# Éditez .env et ajoutez vos secrets JWT
```

### Erreur: "CSRF token missing"

**Cause:** Le client n'envoie pas le token CSRF ou les cookies ne sont pas activés

**Solution:**
- Vérifiez que `withCredentials: true` est configuré dans axios
- Vérifiez que CORS est configuré avec `credentials: true`
- Vérifiez que le cookie `XSRF-TOKEN` existe dans les DevTools

### Erreur: CORS

**Cause:** CLIENT_URL ne correspond pas à l'origine de la requête

**Solution:**
```env
CLIENT_URL=http://localhost:3000  # En développement
CLIENT_URL=https://votre-domaine.com  # En production
```

## 🧪 Tester la Sécurité

### Test 1: JWT Secrets

```bash
# Le serveur doit refuser de démarrer sans secrets
cd app/server
rm .env
npm start
# ❌ Devrait afficher: "FATAL: JWT_SECRET must be set"
```

### Test 2: Protection CSRF

```bash
# Essayer une requête PUT sans token CSRF
curl -X PUT http://localhost:5001/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"username": "test"}'

# ❌ Devrait retourner: "CSRF token missing"
```

### Test 3: Injection SQL

```bash
# Essayer une injection SQL dans le login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com'\'' OR '\''1'\''='\''1", "password": "anything"}'

# ✅ Devrait échouer normalement (pas d'injection)
```

## 📖 Ressources Supplémentaires

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## 🆘 Support

Si vous rencontrez des problèmes de sécurité :

1. Vérifiez ce guide
2. Consultez `SECURITY_AUDIT.md` pour l'état de sécurité actuel
3. Créez une issue sur GitHub (ne divulguez PAS de vulnérabilités publiquement)
4. Pour les vulnérabilités critiques, contactez l'équipe en privé

---

**Dernière mise à jour:** 2025-10-08
**Version:** 1.0.0