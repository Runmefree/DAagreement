#!/bin/bash

echo ""
echo "========================================"
echo "Auth App - Quick Start"
echo "========================================"
echo ""

echo "Starting backend server on port 5000..."
cd backend
npm run dev &
BACKEND_PID=$!

sleep 3

echo "Starting frontend dev server on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Both servers are running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

wait
