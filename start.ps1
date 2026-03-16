# UrbanRoots Quick Start Script

Write-Host "🌱 Starting UrbanRoots E-Commerce Platform..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Python is installed
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python is not installed. Please install Python first." -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host "`n📦 Starting Backend API..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'backend'; & '.\venv\Scripts\python.exe' -m uvicorn main:app --reload"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev"

Write-Host "`n✅ UrbanRoots is starting!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "`nPress any key to stop both servers..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop both terminals would require tracking the processes
