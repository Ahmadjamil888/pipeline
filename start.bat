@echo off
echo 🚀 Starting Pipeline AI with Real Training...
echo.

if "%1"=="--docker" (
    echo 📦 Starting with Docker Compose...
    docker-compose up
) else (
    echo 🐍 Starting Python Training Service...
    start /B cmd /c "cd python-service && python main.py"
    
    echo ⏳ Waiting for Python service to start...
    timeout /t 5 /nobreak > nul
    
    echo 🌐 Starting Next.js App...
    start /B cmd /c "npm run dev"
    
    echo.
    echo ✅ Pipeline AI is running!
    echo.
    echo 📍 Frontend: http://localhost:3000
    echo 📍 Training API: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop
    
    pause
)
