# 🎵 Splice Downloader

Sistema completo para descargar samples de Splice con interfaz web.

## 📁 Estructura

```
web-scrapper/
├── scraper/    # Docker scraper de Splice
├── api/        # Backend API (Express)
└── client/     # Frontend web (React)
```

## 🚀 Configuración Inicial

### 1. Construir el Docker del Scraper

```bash
cd scraper
chmod +x build-docker.sh
./build-docker.sh
cd ..
```

### 2. Instalar dependencias

```bash
# API
cd api
npm install
cd ..

# Client
cd client
npm install
cd ..
```

## ▶️ Ejecutar el Sistema

Abre **2 terminales**:

### Terminal 1 - API
```bash
cd api
npm run dev
```
La API correrá en: `http://localhost:4000`

### Terminal 2 - Client
```bash
cd client
npm run dev
```
El cliente correrá en: `http://localhost:5173`

## 🎯 Uso

1. Abre tu navegador en `http://localhost:5173`
2. Pega una URL de Splice
3. Click en "Descargar Audio"
4. Espera a que termine (30-60 segundos)
5. Click en "📥 Descargar Archivo"

## 🛠️ Tecnologías

- **Scraper**: Docker + Puppeteer + FFmpeg + PulseAudio
- **API**: Node.js + Express + TypeScript
- **Client**: React + Vite + TailwindCSS + Axios

## 📝 Notas

- Los audios descargados se limpian automáticamente al reiniciar la API
- El sistema usa polling cada 3 segundos para verificar el estado
- Se requiere `sudo` para ejecutar Docker
