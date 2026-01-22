@echo off
echo.
echo ========================================
echo Auth App - Quick Start
echo ========================================
echo.

echo Starting backend server on port 5000...
start cmd /k "cd backend && npm run dev"

timeout /t 3

echo Starting frontend dev server on port 3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
pause
