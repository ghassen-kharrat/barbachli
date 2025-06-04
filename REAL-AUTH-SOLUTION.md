# Solution d'Authentification Complète

Cette documentation explique comment corriger le système d'authentification pour faire fonctionner l'ensemble de l'architecture (frontend, backend et base de données).

## Problèmes Identifiés

1. **Endpoints API manquants** : Les endpoints d'authentification du backend ne fonctionnent pas correctement
2. **Problème de connexion à la base de données** : La connexion entre le backend et Supabase présente des erreurs
3. **Problème de déploiement** : Les configurations entre Vercel (frontend) et Render (backend) ne sont pas synchronisées

## Solution Complète

### 1. Configuration du Backend

Le script `fix-auth-backend.js` a créé les fichiers suivants :

- `server.js` : Un serveur Express complet avec tous les endpoints d'authentification
- `db-manager.js` : Un script pour configurer correctement la base de données Supabase

#### Installation et Configuration

```bash
# Installer les dépendances nécessaires
npm install express cors body-parser @supabase/supabase-js

# Configurer la base de données Supabase
node db-manager.js

# Démarrer le serveur backend local
node server.js
```

Le serveur sera accessible sur `http://localhost:3001` avec les endpoints :
- `/api/auth/login`
- `/api/auth/check`
- `/api/auth/profile`
- `/api/auth/register`

### 2. Déploiement sur Render

Pour déployer le backend sur Render :

1. Connectez-vous à votre compte Render
2. Accédez au service `barbachli-1`
3. Mettez à jour le dépôt avec les nouveaux fichiers
4. Configurez les variables d'environnement :
   - `SUPABASE_URL=https://ptgkvovawoqvymkcr.supabase.co`
   - `SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configuration de la Base de Données Supabase

Le script `db-manager.js` effectue automatiquement les opérations suivantes :

1. Vérification/création de l'utilisateur admin dans auth.users
2. Vérification/création de la table users
3. Vérification/création de l'utilisateur admin dans la table users avec le rôle 'admin'

### 4. Configuration du Frontend

Le script a également mis à jour le fichier `src/features/auth/services/auth.api.ts` pour utiliser les bons endpoints.

Pour une solution complète, vous pouvez redéployer le frontend sur Vercel :

1. Poussez les modifications vers votre dépôt GitHub
2. Vercel déploiera automatiquement les changements
3. Vérifiez les variables d'environnement dans Vercel

## Comptes Utilisateurs

### Admin
- Email: `admin@example.com`
- Mot de passe: `Password123!`
- Rôle: `admin`

### Utilisateur Test
- Email: `test@example.com`
- Mot de passe: `Password123!`
- Rôle: `user`

## Vérification

Pour vérifier que tout fonctionne correctement :

1. Démarrez le serveur backend local : `node server.js`
2. Testez les endpoints d'authentification avec curl ou Postman :

```bash
# Test de connexion admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'

# Vérification d'authentification (utilisez le token reçu)
curl -X GET http://localhost:3001/api/auth/check \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

3. Accédez au frontend déployé et connectez-vous avec les identifiants admin

## Dépannage

Si vous rencontrez des problèmes :

1. **Erreurs 404** : Vérifiez que le serveur backend est en cours d'exécution
2. **Erreurs de base de données** : Exécutez à nouveau `node db-manager.js`
3. **Problèmes CORS** : Vérifiez les paramètres CORS dans `server.js`

## Solution à Long Terme

Pour une solution permanente, vous devriez :

1. Intégrer ces modifications dans votre code source principal
2. Configurer des variables d'environnement sécurisées pour les clés Supabase
3. Mettre en place des tests automatisés pour les endpoints d'authentification
4. Mettre à niveau le niveau de service Render pour éviter les limitations de performance 