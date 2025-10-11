FROM node:22-alpine

# Instalar Docker CLI para poder ejecutar comandos docker desde el contenedor
RUN apk update && apk add --no-cache \
    docker-cli \
    ca-certificates

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de package.json primero (para cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies para reducir tamaño
RUN npm prune --production

# Crear directorio para audios
RUN mkdir -p /app/audios

# Exponer el puerto
EXPOSE 4000

# Variables de entorno por defecto (pueden ser sobreescritas)
ENV PORT=4000
ENV NODE_ENV=production

# Comando de inicio
CMD ["npm", "start"]
