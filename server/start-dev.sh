#!/bin/bash
# Start Vite dev server in background and Spring Boot in foreground
# This script ensures both are cleaned up properly on exit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Function to cleanup on exit
cleanup() {
    echo "Shutting down Vite dev server..."
    # Kill Vite process if it exists
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null || true
    fi
    # Kill any remaining npm processes in client directory
    pkill -f "npm run dev" || true
}

trap cleanup EXIT SIGINT SIGTERM

# Install node/npm if not present
if [ ! -d "$PROJECT_ROOT/client/node" ]; then
    echo "Installing Node.js and npm..."
    npm install -g node@v20.11.1 2>/dev/null || true
fi

# Install dependencies
echo "Installing frontend dependencies..."
cd "$PROJECT_ROOT/client"
npm install --legacy-peer-deps >/dev/null 2>&1

# Start Vite dev server in background
echo "Starting Vite dev server on port 5173..."
npm run dev &
VITE_PID=$!

# Wait a moment for Vite to start
sleep 3

# Start Spring Boot in foreground
echo "Starting Spring Boot backend on port 8080..."
cd "$SCRIPT_DIR"
exec mvn spring-boot:run
