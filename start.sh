#!/bin/bash

echo "🚀 Starting Pipeline AI with Real Training..."
echo ""

# Check if Python service is needed
if [ "$1" == "--docker" ]; then
    echo "📦 Starting with Docker Compose..."
    docker-compose up
else
    echo "🐍 Starting Python Training Service..."
    cd python-service
    python main.py &
    PYTHON_PID=$!
    cd ..
    
    echo "⏳ Waiting for Python service to start..."
    sleep 5
    
    echo "🌐 Starting Next.js App..."
    npm run dev &
    NEXTJS_PID=$!
    
    echo ""
    echo "✅ Pipeline AI is running!"
    echo ""
    echo "📍 Frontend: http://localhost:3000"
    echo "📍 Training API: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for Ctrl+C
    trap "kill $PYTHON_PID $NEXTJS_PID; exit" INT
    wait
fi
