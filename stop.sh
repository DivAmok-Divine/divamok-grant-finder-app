#!/bin/bash

# Navigate to the script's directory so it works from anywhere
cd "$(dirname "$0")"

stopped=0

if [ -f ".api.pid" ]; then
  pid=$(cat .api.pid)
  echo "Stopping API (PID: $pid)..."
  kill $pid 2>/dev/null
  rm .api.pid
  stopped=1
fi

if [ -f ".frontend.pid" ]; then
  pid=$(cat .frontend.pid)
  echo "Stopping Frontend (PID: $pid)..."
  kill $pid 2>/dev/null
  rm .frontend.pid
  stopped=1
fi

if [ $stopped -eq 0 ]; then
  echo "No running services found from start.sh."
  echo "Searching for leftover Vite or Node server processes..."
  
  # Failsafe fallback to kill orphaned processes
  pkill -f "node server.js" 2>/dev/null
  pkill -f "vite" 2>/dev/null
  
  echo "✅ Cleaned up leftover processes."
else
  echo "✅ All recorded services stopped successfully."
fi
