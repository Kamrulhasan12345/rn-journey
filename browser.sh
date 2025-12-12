#!/bin/bash

# Check if --app argument is provided
if [ -z "$1" ]; then
  echo "Error: No argument provided."
  exit 1
fi

# Check for proper format: --app=<URL>
if [[ "$1" == --app=* ]]; then

  # Extract the URL from the --app argument
  APP_URL=$(echo "$1" | sed 's/--app=//')

  # Define your tunnel URL here
  TUNNEL_URL=$(tailscale ip -4)

  # Extract path and query from the original URL
  PATH_QUERY=$(echo "$APP_URL" | sed -E 's|https?://[^/]+||')

  # Construct the new URL using the tunnel URL
  FINAL_URL="$TUNNEL_URL$PATH_QUERY"
  export DEVTOOLS_URL="$FINAL_URL"
  echo "Opening URL: $FINAL_URL"

  echo "$FINAL_URL" > ./.devtools_url

  # Open the URL in the default web browser based on the OS
  echo "Unsupported OS. Please open this URL manually: $FINAL_URL"
  exit 0
else
  echo "Error: Invalid argument format. Expected --app=<URL>"
  exit 1
fi
