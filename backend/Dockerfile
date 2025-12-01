# Utiliser une image Node.js officielle légère
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production

# Copier le reste du code source
COPY . .

# Créer le dossier de logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 5001

# Définir l'utilisateur node pour la sécurité
USER node

# Commande de démarrage
CMD ["node", "server.js"]
