FROM ubuntu:24.04

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar curl y ca-certificates primero
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js 22.x desde NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verificar instalación de Node.js
RUN node --version && npm --version

# Instalar dependencias para Chrome, FFmpeg y PulseAudio
RUN apt-get update && apt-get install -y \
    wget \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    ffmpeg \
    pulseaudio \
    pulseaudio-utils \
    && rm -rf /var/lib/apt/lists/*

# Instalar Google Chrome Stable
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de package.json primero (para cache de Docker)
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies para reducir tamaño
RUN npm prune --production

# Crear directorio de salida
RUN mkdir -p /app/out

# Configurar dispositivo virtual de PulseAudio
RUN mkdir -p /root/.config/pulse && \
    echo "load-module module-null-sink sink_name=virtual-capture-recorder" > /root/.config/pulse/default.pa && \
    echo "set-default-sink virtual-capture-recorder" >> /root/.config/pulse/default.pa && \
    echo "load-module module-native-protocol-unix" >> /root/.config/pulse/default.pa

# Copiar y hacer ejecutable el script de entrypoint
RUN cp ./docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
