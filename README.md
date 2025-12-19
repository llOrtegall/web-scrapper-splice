# Web Scrapper Splice

Plataforma integral para extraer samples de Splice mediante un scraper de audio, administrarlos vía API y visualizar descargas y métricas en un panel web.

> Proyecto personal para practicar y demostrar skills full-stack; 100% educativo y sin ánimo de lucro.

## 🔍 Visión rápida
- Scraper headless que reproduce y graba audio de Splice (Puppeteer + PulseAudio + FFmpeg), guardando `.wav` y metadata.
- API en Bun/Express que autentica, orquesta descargas y expone métricas/usuarios sobre PostgreSQL.
- SPA en React/Vite que consume la API para gestionar descargas y ver métricas en tiempo real.
- Orquestación con Docker Compose; Nginx sirve el cliente y PostgreSQL persiste datos.

## 🧭 Arquitectura en síntesis
- **Scraper**: Automatiza Chrome, detecta silencio y detiene la grabación; código en [scraper/](scraper/).
- **API**: REST con Bun/Express, JWT, Zod y Sequelize; rutas en [api/](api/).
- **DB**: PostgreSQL 16 para usuarios, conteos y registros de descargas.
- **Cliente**: React + Vite + Tailwind; panel de métricas, autenticación y control de descargas en [client/](client/).
- Flujo: scraper obtiene audio + metadata → API almacena/expone y controla acceso → cliente consume y muestra métricas.

## 🧰 Stack principal
- Backend: Bun v1, Express 5, Sequelize (PostgreSQL), JWT, Zod, bcrypt, CORS, Morgan.
- Frontend: React 19 + TypeScript, Vite 7, Tailwind CSS 4, Radix UI, lucide-react, React Router 7.
- Scraper: Node 18+, Puppeteer (+ stealth), FFmpeg, PulseAudio, yargs, cheerio.
- Infra: Docker / Docker Compose, Nginx (sirve el cliente), red externa `winkermind`.

## 🚀 Puesta en marcha rápida
1) Crear la red externa requerida por Compose:
```bash
docker network create winkermind
```
2) Levantar servicios base (PostgreSQL y Nginx para el cliente):
```bash
docker compose up -d
```
   - DB expuesta en `localhost:9010` (usuario/password por defecto `postgres`).
   - El contenedor del backend está comentado en docker-compose; puedes iniciarlo manualmente con Bun.
3) Backend (local):
```bash
cd api
bun install
cp .env.example .env   # crea tu archivo .env si no existe
bun run dev             # puerto por defecto 4000
```
4) Cliente (local):
```bash
cd client
npm install
npm run dev             # Vite en 5173
```
5) Scraper:
- Local: `npm install` y `npm run dev -- <SPLICE_URL>` dentro de [scraper/](scraper/).
- Docker: desde [scraper/](scraper/) ejecutar `chmod +x build-docker.sh && ./build-docker.sh` y luego:
```bash
sudo docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper <SPLICE_URL>
```

## ⚙️ Configuración de entorno (API)
Variables esperadas según [api/src/schemas/env.ts](api/src/schemas/env.ts):
```
PORT=4000
ORIGIN=http://localhost:5173
ENV=dev|prod|test
JWT_SECRECT=tu_secreto_jwt
ROUNDS_SALT=10
DB_HOST=localhost
DB_PORT=9010
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=web_scrapper
COOKIE_NAME=splice-token-winkermind
```
Ajusta credenciales si modificas el docker-compose o usas una base externa.

## 🧪 Modos de uso del scraper
- **Standalone Docker**: construye con `./build-docker.sh` y ejecuta el contenedor montando `/app/out` para conservar `.wav` y `.json`.
- **Local (dev)**: usa `npm run dev -- <url>` para iterar rápido; requiere FFmpeg y PulseAudio instalados.

## 📂 Estructura de carpetas
- [api/](api/): Backend REST (Express/Bun) y conexión PostgreSQL.
- [client/](client/): Frontend React + Vite + Tailwind.
- [scraper/](scraper/): Scraper headless con Puppeteer y FFmpeg.
- [docker-compose.yml](docker-compose.yml): Servicios de Postgres y Nginx (cliente), red `winkermind` externa.

## 🛠️ Scripts útiles
- API (Bun): `bun run dev`, `bun run build`, `bun run start`.
- Cliente: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Scraper: `npm run dev -- <url>`, `npm run build`, `npm run start`, `./build-docker.sh` para imagen Docker.

## ✅ Checklist de verificación rápida
- ORIGIN en el API apunta al host/puerto del cliente.
- La red `winkermind` existe antes de `docker compose up`.
- El volumen `/app/out` del scraper está montado cuando se corre en Docker.
- Credenciales de PostgreSQL configuradas y puerto 9010 libre.
- JWT_SECRECT y ROUNDS_SALT definidos en `.env` del API.

## 📌 Notas y buenas prácticas
- El scraper graba audio en tiempo real; monta un volumen en `/app/out` para conservar `.wav` y `.json`.
- Habilita CORS en el API con ORIGIN acorde a la URL del cliente.
- Ejecuta migraciones/seed (si aplica) antes de exponer el API a producción.
