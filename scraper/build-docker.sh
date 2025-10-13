#!/bin/bash

echo "🐳 Building Docker image for Splice Scraper..."

# Build the Docker image
sudo docker build -t splice-scraper .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker image built successfully!"
    echo ""
    echo "📋 Usage examples:"
    echo ""
    echo "  Basic usage:"
    echo "  sudo docker run --rm -v \"\$(pwd)/audios:/app/out\" splice-scraper <SPLICE_URL>"
    echo ""
    echo "  Example:"
    echo "  sudo docker run --rm -v \"\$(pwd)/audios:/app/out\" splice-scraper https://splice.com/sounds/sample/abc123..."
    echo ""
else
    echo ""
    echo "❌ Docker build failed!"
    exit 1
fi