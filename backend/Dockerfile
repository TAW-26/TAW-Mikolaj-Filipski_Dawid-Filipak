# Etap 1: Instalacja zależności i budowanie
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Jeśli używasz TypeScriptu, odkomentuj poniższą linię:
# RUN npm run build

# Etap 2: Środowisko uruchomieniowe (Runtime)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production


COPY --from=builder /app . 

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "index.js"]