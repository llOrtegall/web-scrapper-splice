#!/bin/bash

# Example script to run Splice Scraper in Docker

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a Splice sample URL"
    echo ""
    echo "Usage: ./run-docker-example.sh <SPLICE_URL>"
    echo ""
    echo "Example:"
    echo "  ./run-docker-example.sh https://splice.com/sounds/sample/feb223bd040647a583e3defd4c5225ea852d8e88c37d3aecd14696430bde9fa2"
    exit 1
fi

URL="$1"

echo "🎵 Downloading sample from Splice..."
echo "📂 Output directory: $(pwd)/audios"
echo ""

# Create audios directory if it doesn't exist
mkdir -p audios

# Run the Docker container
sudo docker run --rm \
    -v "$(pwd)/audios:/app/out" \
    splice-scraper \
    "$URL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Download completed!"
    echo "📁 Files saved in: $(pwd)/audios/"
    ls -lh audios/
else
    echo ""
    echo "❌ Download failed!"
    exit 1
fi
