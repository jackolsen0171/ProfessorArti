#!/bin/bash

echo "🛑 Killing Professor Arti services..."

# Kill all Node.js processes (backend server)
echo "🔴 Stopping backend server..."
pkill -f "node server.js"

# Kill all React development servers
echo "🔴 Stopping React dev server..."
pkill -f "react-scripts start"

# Kill ChromaDB processes
echo "🔴 Stopping ChromaDB server..."
pkill -f "chroma run"

# Kill any remaining processes on specific ports
echo "🔴 Killing processes on ports 3000, 8000, 8001, 8002..."
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
lsof -ti:8000 | xargs -r kill -9 2>/dev/null
lsof -ti:8001 | xargs -r kill -9 2>/dev/null
lsof -ti:8002 | xargs -r kill -9 2>/dev/null

# Wait a moment for processes to clean up
sleep 2

echo "✅ All Professor Arti services have been stopped!"
echo ""
echo "To restart everything, run: npm run dev"