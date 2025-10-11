FROM node:20-slim

# Instalar Docker CLI para poder ejecutar comandos docker desde el contenedor
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Crear directorio para audios
RUN mkdir -p /app/audios

# Exponer el puerto
EXPOSE 4000

# Variables de entorno por defecto (pueden ser sobreescritas)
ENV PORT=4000
ENV NODE_ENV=production

# Comando de inicio
CMD ["npm", "start"]
