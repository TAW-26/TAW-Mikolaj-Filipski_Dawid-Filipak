FROM node:18-alpine

WORKDIR /app

# Kopiujemy pliki zależności
COPY package*.json ./
RUN npm install

# Kopiujemy resztę kodu backendu (w tym konfigurację AdminJS)
COPY . .

# Jeśli Twój backend działa na porcie 3000 (standard dla AdminJS)
EXPOSE 3000

CMD ["node", "index.js"]