# Guide de déploiement de l'application Barbachli E-Commerce

Ce guide vous explique comment déployer l'application Barbachli E-Commerce en utilisant:
- **Frontend**: Vercel
- **Backend**: Render
- **Base de données**: Supabase

## 1. Configuration de Supabase (Base de données)

### Étapes pour configurer Supabase:

1. Créez un compte sur [Supabase](https://supabase.com/) si vous n'en avez pas déjà un.
2. Créez un nouveau projet et notez les informations de connexion.
3. Dans votre projet Supabase, allez dans "SQL Editor" et importez le schéma de votre base de données.
   - Vous pouvez copier le contenu du fichier `database/schema.sql` et l'exécuter dans l'éditeur SQL de Supabase.
4. Notez l'URL de connexion à la base de données qui ressemble à:
   ```
   postgres://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```

## 2. Déploiement du Backend sur Render

### Préparation du backend:

1. Créez un fichier `render.yaml` à la racine de votre projet:

```yaml
services:
  - type: web
    name: barbachli-api
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: JWT_SECRET
        value: 12345
        # Remplacez par votre propre secret JWT en production
      - key: DATABASE_URL
        value: postgres://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
        # Remplacez par l'URL de votre base de données Supabase
```

### Déploiement sur Render:

1. Créez un compte sur [Render](https://render.com/) si vous n'en avez pas déjà un.
2. Connectez votre compte GitHub à Render.
3. Cliquez sur "New Web Service".
4. Sélectionnez le dépôt contenant votre application.
5. Configurez le service:
   - **Name**: barbachli-api (ou le nom que vous préférez)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Ajoutez les variables d'environnement mentionnées dans le fichier `render.yaml`.
7. Cliquez sur "Create Web Service".

## 3. Déploiement du Frontend sur Vercel

### Préparation du frontend:

1. Créez un fichier `vercel.json` à la racine de votre projet:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://[YOUR-RENDER-APP-NAME].onrender.com/api/$1" }
  ]
}
```

2. Modifiez le fichier `.env.production` pour pointer vers votre backend sur Render:

```
REACT_APP_API_URL=https://[YOUR-RENDER-APP-NAME].onrender.com/api
```

### Déploiement sur Vercel:

1. Créez un compte sur [Vercel](https://vercel.com/) si vous n'en avez pas déjà un.
2. Connectez votre compte GitHub à Vercel.
3. Importez votre projet depuis GitHub.
4. Configurez le projet:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Ajoutez les variables d'environnement nécessaires:
   - `REACT_APP_API_URL=https://[YOUR-RENDER-APP-NAME].onrender.com/api`
6. Cliquez sur "Deploy".

## 4. Mise à jour des références dans le code

Assurez-vous de mettre à jour toutes les références à l'API dans votre code frontend pour utiliser la variable d'environnement `REACT_APP_API_URL` au lieu de hardcoder l'URL.

Par exemple, remplacez:
```javascript
axios.get('http://localhost:5001/api/products')
```

Par:
```javascript
axios.get(`${process.env.REACT_APP_API_URL}/products`)
```

## 5. Configuration CORS sur le backend

Assurez-vous que votre serveur backend accepte les requêtes du domaine frontend Vercel:

```javascript
// Dans server.js
app.use(cors({
  origin: ['https://barbachli.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

## 6. Tester le déploiement

1. Visitez votre application déployée sur Vercel.
2. Vérifiez que toutes les fonctionnalités fonctionnent correctement.
3. Vérifiez les logs sur Render et Vercel en cas de problèmes.

## Notes importantes

- Assurez-vous de ne jamais exposer vos secrets (comme JWT_SECRET) dans votre code source.
- Utilisez des variables d'environnement pour toutes les informations sensibles.
- Pour une sécurité optimale, changez votre JWT_SECRET pour une valeur forte et unique en production.
- Considérez l'utilisation de services comme Cloudinary pour le stockage des images en production. 