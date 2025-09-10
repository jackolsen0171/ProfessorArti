#!/bin/bash

echo "🚀 Starting Professor Arti development environment..."

# Kill any existing processes first
echo "🔄 Cleaning up existing processes..."
./scripts/kill-everything.sh

echo ""
echo "🌟 Starting all services..."

# Start ChromaDB server
echo "🟣 Starting ChromaDB server (port 8002)..."
chroma run --host localhost --port 8002 --path ./.raggy_db &
CHROMA_PID=$!

# Wait for ChromaDB to initialize
echo "⏳ Waiting for ChromaDB to initialize..."
sleep 3

# Start backend server
echo "🟦 Starting backend server (port 8001)..."
cd backend
source .env
export $(grep -v '^#' .env | xargs)
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 2

# Start React frontend
echo "🟩 Starting React frontend (port 8000)..."
PORT=8000 npm start &
FRONTEND_PID=$!

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 URLs:"
echo "   • Frontend: http://localhost:8000"
echo "   • Backend API: http://localhost:8001"
echo "   • ChromaDB: http://localhost:8002"
echo "   • Health Check: http://localhost:8001/api/health"
echo ""
echo "📝 Process IDs:"
echo "   • ChromaDB: $CHROMA_PID"
echo "   • Backend: $BACKEND_PID"
echo "   • Frontend: $FRONTEND_PID"
echo ""
echo "To stop all services: npm run kill"
echo ""
echo "🎉 Professor Arti is ready to use!"

# Keep script running to monitor processes
wait