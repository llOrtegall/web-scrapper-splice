# 🎵 Splice Sample Scraper

Automated tool to download and record audio samples from Splice using headless browser automation and FFmpeg audio capture.

## 🌟 Features

- ✅ **Automated sample download** from Splice.com
- ✅ **Audio recording** via FFmpeg with PulseAudio virtual device
- ✅ **Metadata extraction** (title, artist, album, BPM)
- ✅ **Silence detection** and retry mechanism
- ✅ **Clean filenames** using sample titles
- ✅ **Docker support** for containerized execution
- ✅ **Modular architecture** for easy maintenance

---

## 📦 Installation

### Prerequisites

- Node.js 20+
- Google Chrome
- FFmpeg
- PulseAudio

### Local Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

---

## 🚀 Usage

### Local Development

```bash
npm run dev <SPLICE_URL> -- --testMode
```

**Example:**
```bash
npm run dev https://splice.com/sounds/sample/feb223bd040647a583e3defd4c5225ea852d8e88c37d3aecd14696430bde9fa2 -- --testMode
```

### Production Mode

```bash
npm run dev <SPLICE_URL>
```

---

## 🐳 Docker Usage

### 1. Build Docker Image

```bash
./build-docker.sh
```

Or manually:
```bash
sudo docker build -t splice-scraper .
```

### 2. Run Container

**Using the helper script:**
```bash
./run-docker-example.sh <SPLICE_URL>
```

**Or manually:**
```bash
sudo docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper <SPLICE_URL>
```

**Example:**
```bash
sudo docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper https://splice.com/sounds/sample/feb223bd040647a583e3defd4c5225ea852d8e88c37d3aecd14696430bde9fa2
```

---

## 📂 Project Structure

```
src/
├── browser/             # Puppeteer utilities
│   └── puppeteerUtils.ts
├── metadata/            # Metadata extraction
│   └── extractor.ts
├── playback/            # Playback monitoring
│   └── playbackMonitor.ts
├── recording/           # FFmpeg recording
│   └── ffmpegRecorder.ts
├── services/            # Business logic
│   └── sampleDownloader.ts
├── utils/               # File system utilities
│   └── fileSystem.ts
├── audioUtils.ts        # Audio processing
├── config.ts            # Configuration
├── constants.ts         # Application constants
├── types.ts             # TypeScript types
└── index.ts             # Entry point
```

---

## ⚙️ Configuration

The application has two modes:

### Test Mode (`--testMode`)
- Extra browser arguments for debugging
- Browser stays open 100s after download
- More permissive security settings

### Production Mode (Default)
- Minimal browser arguments
- Browser closes immediately
- Optimized for Docker/Server

Configuration files:
- `src/config.ts` - Environment configurations
- `src/constants.ts` - Application constants

---

## 📄 Output Files

For each downloaded sample:

```
out/
├── Sample_Name.wav      # Audio file (24-bit PCM, 48kHz)
└── Sample_Name.json     # Metadata
```

**Metadata structure:**
```json
{
  "title": "Sample_Name.wav",
  "artist": "Artist Name",
  "album": "Sample Pack Name",
  "bpm": "128",
  "fileUrl": "https://splice.com/sounds/sample/...",
  "sampleId": "unique-sample-id"
}
```

---

## 🛠️ Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Clean

```bash
npm run clean
```

---

## 🐛 Troubleshooting

### Docker Permission Denied

Add your user to the docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

Or use sudo:
```bash
sudo docker run ...
```

### No Audio Recorded

Check PulseAudio virtual device:
```bash
pactl list sinks | grep virtual-capture-recorder
```

### FFmpeg Exit Code 255

This is normal - FFmpeg exits with code 255 when receiving SIGINT (expected behavior).

---

## 📚 Documentation

- [DOCKER.md](DOCKER.md) - Detailed Docker usage guide

---

## 🔧 Tech Stack

- **TypeScript** - Type-safe development
- **Puppeteer** - Browser automation
- **Cheerio** - HTML parsing
- **FFmpeg** - Audio recording
- **PulseAudio** - Virtual audio device
- **Docker** - Containerization

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
