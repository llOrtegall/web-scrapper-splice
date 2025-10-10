# 🎵 Splice Scraper (Docker)

Scraper automatizado para descargar samples de Splice usando grabación virtual de audio.

## 🏗️ Construcción

```bash
# Desde la carpeta scraper/
chmod +x build-docker.sh
./build-docker.sh
```

Esto construye la imagen Docker `splice-scraper`.

## 🧪 Uso Standalone (sin API)

```bash
# Crear carpeta para audios
mkdir -p audios

# Ejecutar el scraper
sudo docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper <SPLICE_URL>
```

### Ejemplo:
```bash
sudo docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper https://splice.com/sounds/sample/abc123...
```

## 🔧 Cómo Funciona

1. **Puppeteer** abre Chrome headless y navega a Splice
2. **PulseAudio** crea un dispositivo virtual para capturar audio
3. **FFmpeg** graba el audio mientras se reproduce
4. Detecta silencio automáticamente y detiene la grabación
5. Guarda el archivo `.wav` y metadata en JSON

## 🐳 Detalles del Container

- **Base**: Ubuntu 22.04
- **Audio**: PulseAudio + FFmpeg
- **Browser**: Chromium (via Puppeteer)
- **Runtime**: Node.js
- **Output**: `/app/out` (montado como volumen)

## 📝 Archivos de Salida

- `sample_name.wav` - Audio descargado
- `sample_name.json` - Metadata (BPM, pack, author, etc.)

## ⚠️ Notas

- Requiere `sudo` para ejecutar Docker
- El volumen debe ser una ruta absoluta o `$(pwd)`
- La imagen pesa ~2GB debido a dependencias de audio/browser
