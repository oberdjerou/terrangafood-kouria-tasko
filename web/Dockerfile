FROM node:20-alpine

WORKDIR /app

# Copier d'abord les fichiers de dépendances pour profiter du cache Docker
COPY package.json package-lock.json* ./

RUN npm install

# Copier le reste du code source
COPY . .

# Variable d'environnement nécessaire au build Next.js (exposée au client)
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Build Next.js (génère .next/)
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
