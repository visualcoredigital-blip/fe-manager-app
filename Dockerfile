# Usamos una imagen ligera de Node.js
FROM node:20-alpine

WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del proyecto
COPY . .

# Exponemos el puerto por defecto de Vite
EXPOSE 5173

# Comando para arrancar en modo desarrollo con acceso externo
CMD ["npm", "run", "dev", "--", "--host"]