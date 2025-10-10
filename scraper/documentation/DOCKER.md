# 🐳 Docker Usage Guide

## Quick Start

### 1. Build the Docker Image

```bash
docker build -t splice-scraper .
```

### 2. Run the Container

**Basic usage:**
```bash
docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper <SPLICE_URL>
```

**Example:**
```bash
docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper https://splice.com/sounds/sample/feb223bd040647a583e3defd4c5225ea852d8e88c37d3aecd14696430bde9fa2
```

---

## 📝 Command Breakdown

| Flag | Purpose |
|------|---------|
| `--rm` | Remove container after execution (ephemeral) |
| `-v "$(pwd)/audios:/app/out"` | Mount local `./audios` to container `/app/out` |
| `splice-scraper` | Image name |
| `<URL>` | Splice sample URL to download |

---

## 📂 Output Structure

After running, you'll find in `./audios/`:

```
audios/
├── Sample_Name.wav       # Audio file
└── Sample_Name.json      # Metadata
```

---

## 🔧 Advanced Usage

### Custom Output Directory

```bash
docker run --rm -v "/path/to/output:/app/out" splice-scraper <URL>
```

### Keep Container Running (Debug)

```bash
docker run --rm -it -v "$(pwd)/audios:/app/out" splice-scraper <URL>
```

### View Logs

```bash
docker run --rm -v "$(pwd)/audios:/app/out" splice-scraper <URL> 2>&1 | tee download.log
```

---

## 🛠️ Troubleshooting

### Issue: No audio file generated
**Solution:** Check FFmpeg and PulseAudio are running:
```bash
docker run --rm -it splice-scraper bash
pulseaudio --check
ffmpeg -version
```

### Issue: Permission denied on output
**Solution:** Fix volume permissions:
```bash
sudo chown -R $USER:$USER ./audios
```

### Issue: Chrome crashes
**Solution:** Add more shared memory:
```bash
docker run --rm --shm-size=2g -v "$(pwd)/audios:/app/out" splice-scraper <URL>
```

---

## 🧹 Cleanup

Remove the image:
```bash
docker rmi splice-scraper
```

Remove all stopped containers:
```bash
docker container prune
```
