#!/bin/bash
set -e

# Start PulseAudio in daemon mode
pulseaudio --start --exit-idle-time=-1 --log-target=stderr &

# Wait for PulseAudio to be ready
sleep 2

# Load virtual sink module
pactl load-module module-null-sink sink_name=virtual-capture-recorder || true

# Set default sink
pactl set-default-sink virtual-capture-recorder || true

# Check if URL was provided
if [ -z "$1" ]; then
    echo "Error: Please provide a Splice sample URL"
    echo "Usage: docker run --rm -v \"\$(pwd)/audios:/app/out\" splice-scraper <sample-url>"
    exit 1
fi

# Run the application
exec node /app/dist/index.js "$@"
