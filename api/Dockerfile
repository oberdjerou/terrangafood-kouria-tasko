FROM node:20-alpine

WORKDIR /app

# Copier d'abord les fichiers de dépendances pour profiter du cache Docker
COPY package.json package-lock.json* ./

RUN npm install --production

# Copier le reste du code source
COPY . .

EXPOSE 3001

CMD ["node", "src/app.js"]
