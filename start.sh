#!/bin/bash

# Navigate to the script's directory so it works from anywhere
cd "$(dirname "$0")"
ROOT="$(pwd)"

# Clean up old PIDs if they exist
rm -f .api.pid .frontend.pid

# Ctrl+C (or TERM) stops everything by running stop.sh
cleanup() {
  echo ""
  echo "Caught Ctrl+C — stopping services…"
  ./stop.sh
  exit 0
}
trap cleanup INT TERM

start_api() {
  echo "Starting API..."
  ( cd "$ROOT/divamok-grant-finder-app-api" && node server.js ) &
  echo $! > "$ROOT/.api.pid"
}

start_frontend() {
  echo "Starting Frontend..."
  ( cd "$ROOT/divamok-grant-finder-app-frontend" && npm run dev ) &
  echo $! > "$ROOT/.frontend.pid"
}

echo "What do you want to start?"
echo "1) All (Frontend and API)"
echo "2) Frontend only"
echo "3) API only"
read -p "Enter your choice (1/2/3): " choice

case $choice in
  1)
    start_api
    start_frontend
    echo ""
    echo "🌐 Frontend: http://localhost:5174"
    echo "⚙️  API:      http://localhost:3000"
    ;;
  2)
    start_frontend
    echo ""
    echo "🌐 Frontend: http://localhost:5174"
    ;;
  3)
    start_api
    echo ""
    echo "⚙️  API:      http://localhost:3000"
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "✅ Services running. Press Ctrl+C to stop them (runs ./stop.sh)."

# Stay in the foreground so Ctrl+C is caught by the trap above.
wait
