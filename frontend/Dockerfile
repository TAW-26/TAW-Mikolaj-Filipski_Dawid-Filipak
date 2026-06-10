FROM node:20-alpine

WORKDIR /app

# Instalujemy Angular CLI globalnie wewnątrz kontenera
RUN npm install -g @angular/cli

# Kopiujemy pliki zależności i je instalujemy
COPY package*.json ./
RUN npm install

# Kopiujemy kod źródłowy Angulara
COPY . .

# Angular domyślnie działa na porcie 4200
EXPOSE 4200

# Odpalamy ng serve z wyłączoną weryfikacją hosta dla Dockera
CMD ["ng", "serve", "--host", "0.0.0.0"]