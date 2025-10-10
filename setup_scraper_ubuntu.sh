#!/usr/bin/env bash

echo "[1/9] Actualizando apt e instalando utilidades base…"
sudo apt-get update -y
sudo apt-get install -y curl wget ca-certificates gnupg software-properties-common apt-transport-https

echo "[2/9] Instalando Node.js (si ya lo tienes >=18, puedes saltar este paso)…"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  node -v
fi

echo "[3/9] Instalando FFmpeg…"
sudo apt-get install -y ffmpeg

echo "[4/9] Instalando dependencias del sistema para Chrome/Chromium…"
# Paquetes comúnmente requeridos por Chrome/Chromium headless y Puppeteer
sudo apt-get install -y \
  libnss3 libxss1 libasound2 fonts-liberation libatk-bridge2.0-0 libgtk-3-0 \
  libgbm1 libxshmfence1 libdrm2 libu2f-udev libxcb1

echo "[5/9] Instalando Google Chrome (recomendado en servidores para evitar problemas de Snap)…"
if ! command -v google-chrome >/dev/null 2>&1; then
  wget -O /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  sudo apt-get install -y /tmp/google-chrome-stable_current_amd64.deb || true
  # Si faltan deps, intenta corregir
  sudo apt-get -f install -y
fi

# Alternativa: Chromium (descomenta si prefieres Chromium; en algunas distros viene como snap)
# sudo apt-get install -y chromium-browser || sudo apt-get install -y chromium

CHROME_PATH="/usr/bin/google-chrome"
if [ ! -x "$CHROME_PATH" ]; then
  # Intentar localizar chrome o chromium
  if command -v google-chrome >/dev/null 2>&1; then
    CHROME_PATH="$(command -v google-chrome)"
  elif command -v chromium >/dev/null 2>&1; then
    CHROME_PATH="$(command -v chromium)"
  elif command -v chromium-browser >/dev/null 2>&1; then
    CHROME_PATH="$(command -v chromium-browser)"
  else
    echo "No se encontró Chrome/Chromium en el sistema. Revisa la instalación."
    exit 1
  fi
fi
echo "Usando navegador en: $CHROME_PATH"

echo "[6/9] Instalando y preparando audio (PulseAudio)…"
# En servidores modernos puede usarse PipeWire, pero aquí forzamos PulseAudio para FFmpeg -f pulse
sudo apt-get install -y pulseaudio pulseaudio-utils pavucontrol || true

# Iniciar PulseAudio en modo usuario (no requiere root)
if ! pulseaudio --check >/dev/null 2>&1; then
  pulseaudio --start || true
  sleep 1
fi

# A veces se necesita permitir acceso a tiempo real de audio
sudo usermod -aG audio "$USER" || true

echo "[7/9] Creando sink virtual 'virtual-capture-recorder'…"
# Si ya existe, pactl load-module devolverá error; lo manejamos de forma segura
set +e
pactl list short sinks | grep -q '^.*virtual-capture-recorder' 2>/dev/null
EXISTS_SINK=$?
set -e

if [ $EXISTS_SINK -ne 0 ]; then
  pactl load-module module-null-sink sink_name=virtual-capture-recorder sink_properties=device.description=Virtual-Capture-Recorder
fi

echo "Verificando monitor del sink…"
pactl list short sources | grep virtual-capture-recorder.monitor || {
  echo "No se encontró el monitor del sink. Asegúrate de que pulseaudio está corriendo con tu usuario y vuelve a intentar."
  exit 1
}

echo "[8/9] Preparando el proyecto…"
# Asumimos que estás en /home/ortega/scraping/scraper
PROJECT_DIR="$(pwd)"
if [ -f "package.json" ] && [ -d "src" ]; then
  echo "Instalando dependencias npm…"
  npm install
else
  echo "ADVERTENCIA: ejecuta este script dentro del directorio del proyecto (donde está package.json)."
fi

echo "Creando directorio de salida './out' con permisos…"
mkdir -p ./out
chmod -R a+rwx ./out

echo "[9/9] Sugerencias de configuración ('scraper/src/config.ts')…"
echo " - outputDir: './out'"
echo " - executablePath: '$CHROME_PATH'"
echo " - ffmpegAudioInput: 'pulse'"
echo " - recordingDevice: 'virtual-capture-recorder.monitor'"
echo " - browserArgs: añade '--no-sandbox' si corres en contenedor o con restricciones"

cat <<'EONEXT'
============ PASOS SIGUIENTES ============
1) Edita scraper/src/config.ts y ajusta:
   - outputDir: './out'
   - executablePath: el valor mostrado arriba
   - ffmpegAudioInput: 'pulse'
   - recordingDevice: 'virtual-capture-recorder.monitor'
   - Si hace falta: browserArgs: ['--no-sandbox','--disable-dev-shm-usage']

2) Asegura que el navegador use el sink virtual:
   - En servidores sin GUI, Puppeteer normalmente corre headless y no necesitas pavucontrol.
   - Si pruebas con GUI, abre 'pavucontrol' y en la pestaña Playback elige 'Virtual-Capture-Recorder' para Chrome.

3) Verificaciones rápidas:
   - ffmpeg -version
   - pactl list short sources | grep virtual-capture-recorder.monitor
   - Prueba de grabación 3s:
     ffmpeg -f pulse -i virtual-capture-recorder.monitor -t 3 -acodec pcm_s24le -ar 48000 /tmp/test.wav

4) Ejecutar en test mode (nota el -- para pasar flags a tu script):
   npm run dev -- <sample-url> --testMode

5) Si Puppeteer falla por sandbox en servidores:
   - Agrega '--no-sandbox' a config.browserArgs.
==========================================
EONEXT

echo "Listo. Revisa los mensajes anteriores y ajusta config.ts según corresponda."